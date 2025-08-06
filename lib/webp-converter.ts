import sharp from 'sharp';

export const WEBP_QUALITY_PRESETS = {
  low: 60,
  medium: 80,
  high: 95,
} as const;

export type WebPQualityPreset = keyof typeof WEBP_QUALITY_PRESETS;

export async function convertToWebPWithPreset(
  imageBuffer: Buffer,
  quality: WebPQualityPreset = 'medium'
): Promise<Buffer> {
  try {
    const qualityValue = WEBP_QUALITY_PRESETS[quality];
    return await sharp(imageBuffer)
      .webp({ quality: qualityValue })
      .toBuffer();
  } catch (error) {
    console.error('Error converting to WebP:', error);
    throw new Error(`Failed to convert image to WebP: ${error}`);
  }
}

export async function getImageMetadata(imageBuffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  hasProfile: boolean;
  size: number;
}> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      hasAlpha: metadata.hasAlpha || false,
      hasProfile: metadata.hasProfile || false,
      size: imageBuffer.length,
    };
  } catch (error) {
    console.error('Error extracting image metadata:', error);
    throw new Error(`Failed to extract image metadata: ${error}`);
  }
}

export function calculateCompressionRatio(originalSize: number, webpSize: number): number {
  if (originalSize === 0) return 0;
  return ((originalSize - webpSize) / originalSize) * 100;
}

export async function canConvertToWebP(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return metadata.format !== 'webp'; // Can convert if not already WebP
  } catch (error) {
    console.error('Error checking WebP conversion capability:', error);
    return false;
  }
}

export async function createWebPThumbnail(
  imageBuffer: Buffer,
  size: number = 300,
  quality: number = 80
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality })
      .toBuffer();
  } catch (error) {
    console.error('Error creating WebP thumbnail:', error);
    throw new Error(`Failed to create WebP thumbnail: ${error}`);
  }
}

export async function resizeAndConvertToWebP(
  imageBuffer: Buffer,
  width: number,
  height: number,
  quality: number = 80
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(width, height)
      .webp({ quality })
      .toBuffer();
  } catch (error) {
    console.error('Error resizing and converting to WebP:', error);
    throw new Error(`Failed to resize and convert to WebP: ${error}`);
  }
}

export async function convertToWebP(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .webp()
      .toBuffer();
  } catch (error) {
    console.error('Error converting to WebP:', error);
    throw new Error(`Failed to convert to WebP: ${error}`);
  }
}

export async function testWebPConversion(): Promise<{
  success: boolean;
  compressionRatio?: number;
  error?: string;
}> {
  try {
    // Create a test image
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();

    // Convert to WebP
    const webpBuffer = await convertToWebP(testImage);
    
    // Calculate compression ratio
    const compressionRatio = calculateCompressionRatio(testImage.length, webpBuffer.length);

    return {
      success: true,
      compressionRatio,
    };
  } catch (error) {
    console.error('WebP conversion test failed:', error);
    return {
      success: false,
      error: `WebP conversion test failed: ${error}`,
    };
  }
} 