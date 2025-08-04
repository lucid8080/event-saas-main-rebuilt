import sharp from 'sharp';
import { env } from '@/env.mjs';

// WebP conversion quality settings
export interface WebPQualitySettings {
  quality: number; // 0-100
  effort: number; // 0-6 (compression effort)
  lossless: boolean; // true for lossless compression
  nearLossless: boolean; // true for near-lossless compression
  smartSubsample: boolean; // true for smart subsampling
}

// Default WebP quality settings for different use cases
export const WEBP_QUALITY_PRESETS = {
  // High quality for full-size images
  high: {
    quality: 85,
    effort: 4,
    lossless: false,
    nearLossless: false,
    smartSubsample: true,
  },
  // Medium quality for general use
  medium: {
    quality: 75,
    effort: 3,
    lossless: false,
    nearLossless: false,
    smartSubsample: true,
  },
  // Low quality for thumbnails and previews
  low: {
    quality: 60,
    effort: 2,
    lossless: false,
    nearLossless: false,
    smartSubsample: false,
  },
  // Lossless for images that need perfect quality
  lossless: {
    quality: 100,
    effort: 6,
    lossless: true,
    nearLossless: false,
    smartSubsample: true,
  },
} as const;

// Convert image buffer to WebP format
export async function convertToWebP(
  imageBuffer: Buffer,
  settings: WebPQualitySettings = WEBP_QUALITY_PRESETS.medium
): Promise<Buffer> {
  try {
    const webpBuffer = await sharp(imageBuffer)
      .webp({
        quality: settings.quality,
        effort: settings.effort,
        lossless: settings.lossless,
        nearLossless: settings.nearLossless,
        smartSubsample: settings.smartSubsample,
      })
      .toBuffer();

    return webpBuffer;
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    throw new Error('Failed to convert image to WebP format');
  }
}

// Convert image buffer to WebP with specific preset
export async function convertToWebPWithPreset(
  imageBuffer: Buffer,
  preset: keyof typeof WEBP_QUALITY_PRESETS = 'medium'
): Promise<Buffer> {
  const settings = WEBP_QUALITY_PRESETS[preset];
  return convertToWebP(imageBuffer, settings);
}

// Get image metadata without converting
export async function getImageMetadata(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw new Error('Failed to get image metadata');
  }
}

// Resize and convert image to WebP
export async function resizeAndConvertToWebP(
  imageBuffer: Buffer,
  width: number,
  height: number,
  settings: WebPQualitySettings = WEBP_QUALITY_PRESETS.medium
): Promise<Buffer> {
  try {
    const webpBuffer = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: settings.quality,
        effort: settings.effort,
        lossless: settings.lossless,
        nearLossless: settings.nearLossless,
        smartSubsample: settings.smartSubsample,
      })
      .toBuffer();

    return webpBuffer;
  } catch (error) {
    console.error('Error resizing and converting image to WebP:', error);
    throw new Error('Failed to resize and convert image to WebP format');
  }
}

// Create thumbnail in WebP format
export async function createWebPThumbnail(
  imageBuffer: Buffer,
  size: number = 300,
  settings: WebPQualitySettings = WEBP_QUALITY_PRESETS.low
): Promise<Buffer> {
  return resizeAndConvertToWebP(imageBuffer, size, size, settings);
}

// Convert multiple images to WebP in batch
export async function convertBatchToWebP(
  images: Array<{ buffer: Buffer; id: string }>,
  settings: WebPQualitySettings = WEBP_QUALITY_PRESETS.medium
): Promise<Array<{ id: string; webpBuffer: Buffer; originalSize: number; webpSize: number }>> {
  const results = [];

  for (const image of images) {
    try {
      const webpBuffer = await convertToWebP(image.buffer, settings);
      const originalSize = image.buffer.length;
      const webpSize = webpBuffer.length;
      
      results.push({
        id: image.id,
        webpBuffer,
        originalSize,
        webpSize,
      });
    } catch (error) {
      console.error(`Error converting image ${image.id} to WebP:`, error);
      // Continue with other images even if one fails
    }
  }

  return results;
}

// Validate if image can be converted to WebP
export async function canConvertToWebP(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await getImageMetadata(imageBuffer);
    // Sharp can handle most common image formats
    const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'tiff', 'bmp'];
    return supportedFormats.includes(metadata.format?.toLowerCase() || '');
  } catch (error) {
    console.error('Error validating image for WebP conversion:', error);
    return false;
  }
}

// Calculate compression ratio
export function calculateCompressionRatio(originalSize: number, webpSize: number): number {
  if (originalSize === 0) return 0;
  return ((originalSize - webpSize) / originalSize) * 100;
}

// Generate WebP filename with quality indicator
export function generateWebPFilename(
  originalFilename: string,
  preset: keyof typeof WEBP_QUALITY_PRESETS = 'medium'
): string {
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}-${preset}.webp`;
}

// Test WebP conversion with sample data
export async function testWebPConversion(): Promise<{
  success: boolean;
  compressionRatio?: number;
  error?: string;
}> {
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    const webpBuffer = await convertToWebP(testImageBuffer, WEBP_QUALITY_PRESETS.medium);
    const compressionRatio = calculateCompressionRatio(testImageBuffer.length, webpBuffer.length);

    return {
      success: true,
      compressionRatio,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 