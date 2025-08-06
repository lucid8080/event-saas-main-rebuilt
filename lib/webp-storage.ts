import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { generateWebPKey, isWebPKey, getOriginalKeyFromWebP } from './r2';
import { env } from '@/env.mjs';

// WebP storage configuration
export interface WebPStorageConfig {
  preserveOriginal: boolean; // Keep original file after WebP conversion
  organizeByFormat: boolean; // Organize files by format in separate folders
  backupOriginal: boolean; // Create backup of original before conversion
}

// Default WebP storage configuration
export const DEFAULT_WEBP_STORAGE_CONFIG: WebPStorageConfig = {
  preserveOriginal: true,
  organizeByFormat: false,
  backupOriginal: false,
};

export { generateWebPKey } from './r2';

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function checkWebPExists(originalKey: string): Promise<boolean> {
  try {
    const webpKey = generateWebPKey(originalKey);
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return false;
    }
    console.error('Error checking WebP existence:', error);
    return false;
  }
}

export async function getWebPInfo(originalKey: string): Promise<{
  exists: boolean;
  size?: number;
  lastModified?: Date;
  contentType?: string;
}> {
  try {
    const webpKey = generateWebPKey(originalKey);
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
    });

    const response = await s3Client.send(command);
    return {
      exists: true,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
    };
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return { exists: false };
    }
    console.error('Error getting WebP info:', error);
    return { exists: false };
  }
}

export async function uploadWebPToR2(
  originalKey: string,
  webpBuffer: Buffer,
  config: WebPStorageConfig = DEFAULT_WEBP_STORAGE_CONFIG
): Promise<{
  success: boolean;
  webpKey: string;
  originalSize?: number;
  webpSize: number;
  error?: string;
}> {
  try {
    const webpKey = generateWebPKey(originalKey);
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
      Body: webpBuffer,
      ContentType: 'image/webp',
    });

    await s3Client.send(command);

    // Get original file size if needed
    let originalSize: number | undefined;
    if (config.preserveOriginal) {
      try {
        const originalCommand = new GetObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: originalKey,
        });
        const originalResponse = await s3Client.send(originalCommand);
        originalSize = originalResponse.ContentLength;
      } catch (error) {
        // Original file might not exist, which is fine
      }
    }

    return {
      success: true,
      webpKey,
      originalSize,
      webpSize: webpBuffer.length,
    };
  } catch (error) {
    console.error('Error uploading WebP to R2:', error);
    return {
      success: false,
      webpKey: generateWebPKey(originalKey),
      webpSize: 0,
      error: `Failed to upload WebP: ${error}`,
    };
  }
}

export async function downloadOriginalFromR2(originalKey: string): Promise<{
  success: boolean;
  buffer?: Buffer;
  contentType?: string;
  error?: string;
}> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: originalKey,
    });

    const response = await s3Client.send(command);
    const chunks: Uint8Array[] = [];
    
    if (response.Body) {
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
    }

    const buffer = Buffer.concat(chunks);
    return {
      success: true,
      buffer,
      contentType: response.ContentType,
    };
  } catch (error) {
    console.error('Error downloading original from R2:', error);
    return {
      success: false,
      error: `Failed to download original: ${error}`,
    };
  }
}

export async function deleteWebPFromR2(originalKey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const webpKey = generateWebPKey(originalKey);
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error deleting WebP from R2:', error);
    return {
      success: false,
      error: `Failed to delete WebP: ${error}`,
    };
  }
}

export async function listWebPFiles(prefix?: string): Promise<{
  success: boolean;
  files: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  error?: string;
}> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    const webpFiles = (response.Contents || [])
      .filter(obj => obj.Key && obj.Key.toLowerCase().endsWith('.webp'))
      .map(obj => ({
        key: obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
      }));

    return {
      success: true,
      files: webpFiles,
    };
  } catch (error) {
    console.error('Error listing WebP files:', error);
    return {
      success: false,
      files: [],
      error: `Failed to list WebP files: ${error}`,
    };
  }
}

export async function getWebPStorageStats(): Promise<{
  success: boolean;
  stats?: {
    totalWebPFiles: number;
    totalWebPSize: number;
    averageWebPSize: number;
    totalOriginalFiles: number;
    totalOriginalSize: number;
    averageCompressionRatio: number;
  };
  error?: string;
}> {
  try {
    const webpFiles = await listWebPFiles();
    const originalFiles = await listWebPFiles();

    if (!webpFiles.success) {
      throw new Error(webpFiles.error);
    }

    const totalWebPFiles = webpFiles.files.length;
    const totalWebPSize = webpFiles.files.reduce((sum, file) => sum + file.size, 0);
    const averageWebPSize = totalWebPFiles > 0 ? totalWebPSize / totalWebPFiles : 0;

    // Calculate compression ratio (simplified)
    const averageCompressionRatio = totalWebPSize > 0 ? 30 : 0; // Assume 30% compression

    return {
      success: true,
      stats: {
        totalWebPFiles,
        totalWebPSize,
        averageWebPSize,
        totalOriginalFiles: originalFiles.files.length,
        totalOriginalSize: originalFiles.files.reduce((sum, file) => sum + file.size, 0),
        averageCompressionRatio,
      },
    };
  } catch (error) {
    console.error('Error getting WebP storage stats:', error);
    return {
      success: false,
      error: `Failed to get WebP storage stats: ${error}`,
    };
  }
}

export async function cleanupOrphanedWebPFiles(): Promise<{
  success: boolean;
  cleanedCount: number;
  errors: string[];
}> {
  try {
    const webpFiles = await listWebPFiles();
    if (!webpFiles.success) {
      throw new Error(webpFiles.error);
    }

    const errors: string[] = [];
    let cleanedCount = 0;

    for (const webpFile of webpFiles.files) {
      const originalKey = getOriginalKeyFromWebP(webpFile.key);
      
      // Check if original file exists
      const originalExists = await checkWebPExists(originalKey);
      
      if (!originalExists) {
        try {
          const deleteResult = await deleteWebPFromR2(originalKey);
          if (deleteResult.success) {
            cleanedCount++;
          } else {
            errors.push(`Failed to delete orphaned WebP: ${webpFile.key}`);
          }
        } catch (error) {
          errors.push(`Error deleting orphaned WebP ${webpFile.key}: ${error}`);
        }
      }
    }

    return {
      success: true,
      cleanedCount,
      errors,
    };
  } catch (error) {
    console.error('Error cleaning up orphaned WebP files:', error);
    return {
      success: false,
      cleanedCount: 0,
      errors: [`Cleanup failed: ${error}`],
    };
  }
} 