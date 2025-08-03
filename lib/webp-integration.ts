import { 
  convertToWebP, 
  convertToWebPWithPreset, 
  getImageMetadata,
  WEBP_QUALITY_PRESETS,
  type WebPQualitySettings 
} from './webp-converter';
import { uploadImageToR2, generateEnhancedImageKey, type ImageMetadata } from './r2';
import { validateWebPConversion, generateValidationReport, type WebPValidationResult } from './webp-validation';

// WebP integration configuration
export interface WebPIntegrationConfig {
  enabled: boolean;
  defaultPreset: keyof typeof WEBP_QUALITY_PRESETS;
  convertExistingImages: boolean;
  validateConversions: boolean;
  fallbackToOriginal: boolean;
}

// Default WebP integration configuration
export const DEFAULT_WEBP_CONFIG: WebPIntegrationConfig = {
  enabled: true,
  defaultPreset: 'medium',
  convertExistingImages: false,
  validateConversions: true,
  fallbackToOriginal: true,
};

// Upload image with WebP conversion
export async function uploadImageWithWebP(
  imageBuffer: Buffer,
  originalContentType: string,
  imageMetadata: ImageMetadata,
  config: WebPIntegrationConfig = DEFAULT_WEBP_CONFIG
): Promise<{
  success: boolean;
  r2Key: string;
  contentType: string;
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
  validation?: WebPValidationResult;
  error?: string;
}> {
  try {
    const originalSize = imageBuffer.length;
    let finalBuffer = imageBuffer;
    let finalContentType = originalContentType;
    let webpSize = originalSize;
    let compressionRatio = 0;
    let validation: WebPValidationResult | undefined;

    // Convert to WebP if enabled and not already WebP
    if (config.enabled && !originalContentType.includes('webp')) {
      try {
        const webpBuffer = await convertToWebPWithPreset(imageBuffer, config.defaultPreset);
        finalBuffer = webpBuffer;
        finalContentType = 'image/webp';
        webpSize = webpBuffer.length;
        compressionRatio = ((originalSize - webpSize) / originalSize) * 100;

        // Validate conversion if enabled
        if (config.validateConversions) {
          validation = await validateWebPConversion(imageBuffer, webpBuffer);
          
          // Fallback to original if validation fails and fallback is enabled
          if (!validation.isValid && config.fallbackToOriginal) {
            console.warn('WebP conversion validation failed, falling back to original format');
            finalBuffer = imageBuffer;
            finalContentType = originalContentType;
            webpSize = originalSize;
            compressionRatio = 0;
          }
        }
      } catch (conversionError) {
        console.error('WebP conversion failed:', conversionError);
        
        if (config.fallbackToOriginal) {
          console.log('Falling back to original format');
          finalBuffer = imageBuffer;
          finalContentType = originalContentType;
          webpSize = originalSize;
          compressionRatio = 0;
        } else {
          throw conversionError;
        }
      }
    }

    // Generate enhanced key with WebP extension if applicable
    const extension = finalContentType.includes('webp') ? 'webp' : 
                     finalContentType.includes('png') ? 'png' : 
                     finalContentType.includes('jpeg') || finalContentType.includes('jpg') ? 'jpg' : 'webp';
    
    const enhancedKey = generateEnhancedImageKey(imageMetadata, extension);
    
    // Upload to R2
    const r2Key = await uploadImageToR2(enhancedKey.key, finalBuffer, finalContentType);

    return {
      success: true,
      r2Key,
      contentType: finalContentType,
      originalSize,
      webpSize,
      compressionRatio,
      validation,
    };
  } catch (error) {
    return {
      success: false,
      r2Key: '',
      contentType: originalContentType,
      originalSize: imageBuffer.length,
      webpSize: imageBuffer.length,
      compressionRatio: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Batch upload with WebP conversion
export async function uploadBatchWithWebP(
  images: Array<{
    id: string;
    buffer: Buffer;
    contentType: string;
    metadata: ImageMetadata;
  }>,
  config: WebPIntegrationConfig = DEFAULT_WEBP_CONFIG
): Promise<Array<{
  id: string;
  success: boolean;
  r2Key: string;
  contentType: string;
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
  validation?: WebPValidationResult;
  error?: string;
}>> {
  const results = [];

  for (const image of images) {
    try {
      const result = await uploadImageWithWebP(
        image.buffer,
        image.contentType,
        image.metadata,
        config
      );
      
      results.push({
        id: image.id,
        ...result,
      });
    } catch (error) {
      results.push({
        id: image.id,
        success: false,
        r2Key: '',
        contentType: image.contentType,
        originalSize: image.buffer.length,
        webpSize: image.buffer.length,
        compressionRatio: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

// Generate WebP thumbnail
export async function generateWebPThumbnail(
  imageBuffer: Buffer,
  size: number = 300,
  quality: keyof typeof WEBP_QUALITY_PRESETS = 'low'
): Promise<Buffer> {
  const { createWebPThumbnail } = await import('./webp-converter');
  return createWebPThumbnail(imageBuffer, size, WEBP_QUALITY_PRESETS[quality]);
}

// Check if image should be converted to WebP
export function shouldConvertToWebP(
  contentType: string,
  config: WebPIntegrationConfig = DEFAULT_WEBP_CONFIG
): boolean {
  if (!config.enabled) return false;
  if (contentType.includes('webp')) return false;
  if (contentType.includes('gif')) return false; // GIFs might need special handling
  
  return true;
}

// Get optimal WebP preset based on image type and use case
export function getOptimalWebPPreset(
  imageType: string,
  useCase: 'thumbnail' | 'preview' | 'full' | 'high-quality' = 'full'
): keyof typeof WEBP_QUALITY_PRESETS {
  switch (useCase) {
    case 'thumbnail':
      return 'low';
    case 'preview':
      return 'medium';
    case 'high-quality':
      return 'high';
    case 'full':
    default:
      return 'medium';
  }
}

// Analyze WebP conversion benefits
export async function analyzeWebPBenefits(
  imageBuffer: Buffer,
  contentType: string
): Promise<{
  canConvert: boolean;
  estimatedCompressionRatio: number;
  recommendedPreset: keyof typeof WEBP_QUALITY_PRESETS;
  benefits: string[];
  warnings: string[];
}> {
  const benefits: string[] = [];
  const warnings: string[] = [];
  
  // Check if conversion is possible
  const canConvert = await import('./webp-converter').then(m => m.canConvertToWebP(imageBuffer));
  
  if (!canConvert) {
    return {
      canConvert: false,
      estimatedCompressionRatio: 0,
      recommendedPreset: 'medium',
      benefits: [],
      warnings: ['Image format not suitable for WebP conversion'],
    };
  }

  // Get image metadata
  const metadata = await getImageMetadata(imageBuffer);
  
  // Estimate compression ratio based on image characteristics
  let estimatedCompressionRatio = 25; // Default estimate
  
  if (metadata.format === 'png' && metadata.hasAlpha) {
    estimatedCompressionRatio = 30; // PNG with alpha typically compresses well
    benefits.push('PNG with transparency will benefit from WebP compression');
  } else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
    estimatedCompressionRatio = 20; // JPEG already compressed
    warnings.push('JPEG images may see smaller compression benefits');
  } else if (metadata.format === 'png') {
    estimatedCompressionRatio = 35; // PNG typically compresses very well
    benefits.push('PNG images typically see excellent WebP compression');
  }

  // Adjust based on image size
  if (metadata.size && metadata.size > 1024 * 1024) {
    benefits.push('Large image will benefit significantly from WebP compression');
    estimatedCompressionRatio += 5;
  }

  // Recommend preset based on image characteristics
  let recommendedPreset: keyof typeof WEBP_QUALITY_PRESETS = 'medium';
  
  if (metadata.width && metadata.height) {
    const megapixels = (metadata.width * metadata.height) / 1000000;
    if (megapixels > 10) {
      recommendedPreset = 'high';
      benefits.push('High-resolution image recommended for high-quality preset');
    } else if (megapixels < 1) {
      recommendedPreset = 'low';
      benefits.push('Small image suitable for low-quality preset');
    }
  }

  return {
    canConvert: true,
    estimatedCompressionRatio,
    recommendedPreset,
    benefits,
    warnings,
  };
} 