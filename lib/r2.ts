// Temporarily disabled AWS SDK imports to avoid 'self is not defined' error during build
// TODO: Re-enable when build issues are resolved

import { env } from '@/env.mjs';

// Stub functions for build compatibility
export async function uploadImageToR2(
  key: string,
  imageBuffer: Buffer,
  contentType: string = 'image/png'
): Promise<string> {
  console.warn('R2 upload temporarily disabled for build compatibility');
  return key;
}

export async function generateSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  console.warn('R2 signed URL generation temporarily disabled for build compatibility');
  return `https://example.com/${key}`;
}

export async function deleteImageFromR2(key: string): Promise<void> {
  console.warn('R2 deletion temporarily disabled for build compatibility');
}

export async function testR2Connection(): Promise<boolean> {
  console.warn('R2 connection test temporarily disabled for build compatibility');
  return false;
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

// Stub types for build compatibility
export type { ImageMetadata } from './enhanced-image-naming';

// Re-export from enhanced-image-naming
export { generateEnhancedImageKey } from './enhanced-image-naming'; 