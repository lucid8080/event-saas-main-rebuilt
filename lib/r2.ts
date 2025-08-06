import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/env.mjs';

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadImageToR2(
  key: string,
  imageBuffer: Buffer,
  contentType: string = 'image/png'
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error(`Failed to upload image to R2: ${error}`);
  }
}

export async function generateSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error}`);
  }
}

export async function deleteImageFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error(`Failed to delete image from R2: ${error}`);
  }
}

export async function testR2Connection(): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: 'test-connection',
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    // If the error is "NoSuchKey", the connection is working but the test file doesn't exist
    if (error.name === 'NoSuchKey') {
      return true;
    }
    console.error('R2 connection test failed:', error);
    return false;
  }
}

export function generateImageKey(userId: string, imageId: string, extension: string = 'png'): string {
  return `${userId}/${imageId}.${extension}`;
}

export function getFileExtension(contentType: string): string {
  const extensionMap: { [key: string]: string } = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return extensionMap[contentType] || 'png';
}

export function generateWebPKey(originalKey: string): string {
  return originalKey.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
}

export function isWebPKey(key: string): boolean {
  return key.toLowerCase().endsWith('.webp');
}

export function getOriginalKeyFromWebP(webpKey: string): string {
  return webpKey.replace(/\.webp$/i, '');
}

// Re-export from enhanced-image-naming
export { generateEnhancedImageKey } from './enhanced-image-naming';
export type { ImageMetadata } from './enhanced-image-naming'; 