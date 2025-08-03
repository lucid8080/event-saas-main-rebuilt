import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/env.mjs';
import { trackR2Operation } from '@/lib/r2-analytics';

// R2 Client Configuration
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload image to R2
export async function uploadImageToR2(
  key: string,
  imageBuffer: Buffer,
  contentType: string = 'image/png'
): Promise<string> {
  const startTime = Date.now();
  try {
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      // Make the object private by default
      ACL: 'private',
    });

    await r2Client.send(command);
    
    // Track successful upload
    const duration = Date.now() - startTime;
    await trackR2Operation('upload', true, duration);
    
    // Return the object key for future reference
    return key;
  } catch (error) {
    // Track failed upload
    const duration = Date.now() - startTime;
    await trackR2Operation('upload', false, duration, error instanceof Error ? error.message : 'Unknown error');
    
    console.error('Error uploading image to R2:', error);
    throw new Error('Failed to upload image to R2');
  }
}

// Generate signed URL for image access
export async function generateSignedUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const startTime = Date.now();
  try {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn,
    });

    // Track successful signed URL generation
    const duration = Date.now() - startTime;
    await trackR2Operation('signed_url', true, duration);

    return signedUrl;
  } catch (error) {
    // Track failed signed URL generation
    const duration = Date.now() - startTime;
    await trackR2Operation('signed_url', false, duration, error instanceof Error ? error.message : 'Unknown error');
    
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Delete image from R2
export async function deleteImageFromR2(key: string): Promise<void> {
  const startTime = Date.now();
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    
    // Track successful deletion
    const duration = Date.now() - startTime;
    await trackR2Operation('delete', true, duration);
  } catch (error) {
    // Track failed deletion
    const duration = Date.now() - startTime;
    await trackR2Operation('delete', false, duration, error instanceof Error ? error.message : 'Unknown error');
    
    console.error('Error deleting image from R2:', error);
    throw new Error('Failed to delete image from R2');
  }
}

// Test R2 connection
export async function testR2Connection(): Promise<boolean> {
  try {
    // Try to list objects in the bucket (limited to 1 to minimize data transfer)
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
      MaxKeys: 1,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('R2 connection test failed:', error);
    return false;
  }
}

// Generate unique key for image storage (legacy function for backward compatibility)
export function generateImageKey(userId: string, imageId: string, extension: string = 'png'): string {
  const timestamp = Date.now();
  return `users/${userId}/images/${imageId}-${timestamp}.${extension}`;
}

// Enhanced image key generation with comprehensive metadata
export { 
  generateEnhancedImageKey, 
  generateSimpleImageKey, 
  parseEnhancedImageKey,
  isEnhancedImageKey,
  type ImageMetadata,
  type EnhancedImageKey
} from './enhanced-image-naming';

// Extract file extension from content type
export function getFileExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  
  return extensions[contentType] || 'webp'; // Default to WebP instead of PNG
}

// Generate WebP-specific key for R2 storage
export function generateWebPKey(originalKey: string): string {
  const nameWithoutExt = originalKey.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}.webp`;
}

// Check if a key is a WebP file
export function isWebPKey(key: string): boolean {
  return key.toLowerCase().endsWith('.webp');
}

// Get original key from WebP key
export function getOriginalKeyFromWebP(webpKey: string): string {
  if (!isWebPKey(webpKey)) {
    return webpKey;
  }
  return webpKey.replace(/\.webp$/i, '');
} 