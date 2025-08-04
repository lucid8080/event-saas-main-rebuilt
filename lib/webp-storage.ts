import { r2Client, generateWebPKey, isWebPKey, getOriginalKeyFromWebP } from './r2';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
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

// Check if WebP version exists in R2
export async function checkWebPExists(originalKey: string): Promise<boolean> {
  try {
    const webpKey = generateWebPKey(originalKey);
    const command = new HeadObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// Get WebP file info from R2
export async function getWebPInfo(originalKey: string): Promise<{
  exists: boolean;
  size?: number;
  lastModified?: Date;
  contentType?: string;
}> {
  try {
    const webpKey = generateWebPKey(originalKey);
    const command = new HeadObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
    });

    const response = await r2Client.send(command);
    return {
      exists: true,
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
    };
  } catch (error) {
    return {
      exists: false,
    };
  }
}

// Upload WebP version to R2
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
    
    // Get original file size for comparison
    let originalSize: number | undefined;
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: originalKey,
      });
      const headResponse = await r2Client.send(headCommand);
      originalSize = headResponse.ContentLength;
    } catch (error) {
      // Original file might not exist, continue anyway
    }

    // Upload WebP version
    const putCommand = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: webpKey,
      Body: webpBuffer,
      ContentType: 'image/webp',
      ACL: 'private',
    });

    await r2Client.send(putCommand);

    return {
      success: true,
      webpKey,
      originalSize,
      webpSize: webpBuffer.length,
    };
  } catch (error) {
    return {
      success: false,
      webpKey: generateWebPKey(originalKey),
      webpSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Download original image from R2 for conversion
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

    const response = await r2Client.send(command);
    
    if (!response.Body) {
      throw new Error('No body in response');
    }

    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    return {
      success: true,
      buffer,
      contentType: response.ContentType,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Delete WebP version from R2
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

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// List all WebP files in R2
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
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    
    const webpFiles = (response.Contents || [])
      .filter(obj => obj.Key && isWebPKey(obj.Key))
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
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get WebP storage statistics
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
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    
    // List all objects
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
    });

    const response = await r2Client.send(command);
    const objects = response.Contents || [];

    // Separate WebP and original files
    const webpFiles = objects.filter(obj => obj.Key && isWebPKey(obj.Key));
    const originalFiles = objects.filter(obj => obj.Key && !isWebPKey(obj.Key));

    // Calculate WebP statistics
    const totalWebPSize = webpFiles.reduce((sum, obj) => sum + (obj.Size || 0), 0);
    const averageWebPSize = webpFiles.length > 0 ? totalWebPSize / webpFiles.length : 0;

    // Calculate original file statistics
    const totalOriginalSize = originalFiles.reduce((sum, obj) => sum + (obj.Size || 0), 0);

    // Calculate average compression ratio (estimate)
    const averageCompressionRatio = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalWebPSize) / totalOriginalSize) * 100 
      : 0;

    return {
      success: true,
      stats: {
        totalWebPFiles: webpFiles.length,
        totalWebPSize,
        averageWebPSize,
        totalOriginalFiles: originalFiles.length,
        totalOriginalSize,
        averageCompressionRatio,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Clean up orphaned WebP files (WebP files without original)
export async function cleanupOrphanedWebPFiles(): Promise<{
  success: boolean;
  cleanedCount: number;
  errors: string[];
}> {
  try {
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    
    // List all WebP files
    const webpListCommand = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
    });

    const webpResponse = await r2Client.send(webpListCommand);
    const webpFiles = (webpResponse.Contents || [])
      .filter(obj => obj.Key && isWebPKey(obj.Key))
      .map(obj => obj.Key!);

    let cleanedCount = 0;
    const errors: string[] = [];

    for (const webpKey of webpFiles) {
      try {
        const originalKey = getOriginalKeyFromWebP(webpKey);
        
        // Check if original exists
        const headCommand = new HeadObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: originalKey,
        });

        try {
          await r2Client.send(headCommand);
          // Original exists, keep WebP file
        } catch (error) {
          // Original doesn't exist, delete orphaned WebP
          const deleteCommand = new DeleteObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: webpKey,
          });

          await r2Client.send(deleteCommand);
          cleanedCount++;
        }
      } catch (error) {
        errors.push(`Failed to process ${webpKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      cleanedCount,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      cleanedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
} 