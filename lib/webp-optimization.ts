import { 
  convertToWebPWithPreset, 
  getImageMetadata,
  WEBP_QUALITY_PRESETS,
  type WebPQualityPreset,
  resizeAndConvertToWebP
} from './webp-converter';

// WebP optimization presets for different use cases
export interface WebPOptimizationPreset {
  name: string;
  description: string;
  quality: keyof typeof WEBP_QUALITY_PRESETS;
  maxWidth?: number;
  maxHeight?: number;
  useCase: 'thumbnail' | 'preview' | 'full' | 'high-quality' | 'social-media';
}

export const WEBP_OPTIMIZATION_PRESETS: Record<string, WebPOptimizationPreset> = {
  thumbnail: {
    name: 'Thumbnail',
    description: 'Small thumbnails for gallery previews',
    quality: 'low',
    maxWidth: 300,
    maxHeight: 300,
    useCase: 'thumbnail'
  },
  preview: {
    name: 'Preview',
    description: 'Medium-sized previews for modal views',
    quality: 'medium',
    maxWidth: 800,
    maxHeight: 600,
    useCase: 'preview'
  },
  full: {
    name: 'Full Size',
    description: 'Full-size images for detailed viewing',
    quality: 'medium',
    useCase: 'full'
  },
  highQuality: {
    name: 'High Quality',
    description: 'High-quality images for printing or detailed viewing',
    quality: 'high',
    useCase: 'high-quality'
  },
  socialMedia: {
    name: 'Social Media',
    description: 'Optimized for social media platforms',
    quality: 'medium',
    maxWidth: 1200,
    maxHeight: 630,
    useCase: 'social-media'
  },
  carousel: {
    name: 'Carousel',
    description: 'Optimized for carousel backgrounds',
    quality: 'medium',
    maxWidth: 1920,
    maxHeight: 1080,
    useCase: 'full'
  }
};

// Optimize image for specific use case
export async function optimizeImageForUseCase(
  imageBuffer: Buffer,
  useCase: keyof typeof WEBP_OPTIMIZATION_PRESETS,
  customSettings?: Partial<WebPOptimizationPreset>
): Promise<{
  optimizedBuffer: Buffer;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  metadata: any;
}> {
  const preset = { ...WEBP_OPTIMIZATION_PRESETS[useCase], ...customSettings };
  
  const originalSize = imageBuffer.length;
  let optimizedBuffer: Buffer;
  
  // Get image metadata
  const metadata = await getImageMetadata(imageBuffer);
  
  // Apply resizing if specified
  if (preset.maxWidth || preset.maxHeight) {
    optimizedBuffer = await resizeAndConvertToWebP(
      imageBuffer,
      preset.maxWidth || metadata.width,
      preset.maxHeight || metadata.height,
      WEBP_QUALITY_PRESETS[preset.quality]
    );
  } else {
    // Just convert to WebP with specified quality
    optimizedBuffer = await convertToWebPWithPreset(imageBuffer, preset.quality);
  }
  
  const optimizedSize = optimizedBuffer.length;
  const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
  
  return {
    optimizedBuffer,
    originalSize,
    optimizedSize,
    compressionRatio,
    metadata
  };
}

// Generate multiple optimized versions of an image
export async function generateOptimizedVersions(
  imageBuffer: Buffer,
  useCases: (keyof typeof WEBP_OPTIMIZATION_PRESETS)[]
): Promise<Record<string, {
  buffer: Buffer;
  size: number;
  compressionRatio: number;
  preset: WebPOptimizationPreset;
}>> {
  const results: Record<string, any> = {};
  
  await Promise.all(
    useCases.map(async (useCase) => {
      try {
        const result = await optimizeImageForUseCase(imageBuffer, useCase);
        results[useCase] = {
          buffer: result.optimizedBuffer,
          size: result.optimizedSize,
          compressionRatio: result.compressionRatio,
          preset: WEBP_OPTIMIZATION_PRESETS[useCase]
        };
      } catch (error) {
        console.error(`Failed to optimize for ${useCase}:`, error);
      }
    })
  );
  
  return results;
}

// Smart optimization based on image content and use case
export async function smartOptimize(
  imageBuffer: Buffer,
  useCase: keyof typeof WEBP_OPTIMIZATION_PRESETS,
  imageType?: 'photo' | 'illustration' | 'text' | 'mixed'
): Promise<{
  optimizedBuffer: Buffer;
  settings: WebPOptimizationPreset;
  compressionRatio: number;
  recommendations: string[];
}> {
  const metadata = await getImageMetadata(imageBuffer);
  const basePreset = WEBP_OPTIMIZATION_PRESETS[useCase];
  const recommendations: string[] = [];
  
  // Adjust settings based on image characteristics
  let adjustedPreset = { ...basePreset };
  
  // Adjust quality based on image type
  if (imageType === 'text' && basePreset.quality === 'low') {
    adjustedPreset.quality = 'medium'; // Text needs higher quality
    recommendations.push('Increased quality for text content');
  } else if (imageType === 'photo' && basePreset.quality === 'high') {
    adjustedPreset.quality = 'medium'; // Photos can use medium quality
    recommendations.push('Reduced quality for photo content');
  }
  
  // Adjust size based on aspect ratio
  if (metadata.width && metadata.height) {
    const aspectRatio = metadata.width / metadata.height;
    
    if (aspectRatio > 2 && adjustedPreset.maxWidth) {
      // Very wide image - adjust height constraint
      adjustedPreset.maxHeight = Math.round(adjustedPreset.maxWidth / aspectRatio);
      recommendations.push('Adjusted height for wide aspect ratio');
    } else if (aspectRatio < 0.5 && adjustedPreset.maxHeight) {
      // Very tall image - adjust width constraint
      adjustedPreset.maxWidth = Math.round(adjustedPreset.maxHeight * aspectRatio);
      recommendations.push('Adjusted width for tall aspect ratio');
    }
  }
  
  // Optimize with adjusted settings
  const result = await optimizeImageForUseCase(imageBuffer, useCase, adjustedPreset);
  
  return {
    optimizedBuffer: result.optimizedBuffer,
    settings: adjustedPreset,
    compressionRatio: result.compressionRatio,
    recommendations
  };
}

// Performance monitoring for optimization
export interface OptimizationMetrics {
  useCase: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  processingTime: number;
  quality: string;
  dimensions: { width: number; height: number };
}

export async function optimizeWithMetrics(
  imageBuffer: Buffer,
  useCase: keyof typeof WEBP_OPTIMIZATION_PRESETS
): Promise<OptimizationMetrics> {
  const startTime = Date.now();
  
  const result = await optimizeImageForUseCase(imageBuffer, useCase);
  const processingTime = Date.now() - startTime;
  
  return {
    useCase,
    originalSize: result.originalSize,
    optimizedSize: result.optimizedSize,
    compressionRatio: result.compressionRatio,
    processingTime,
    quality: WEBP_OPTIMIZATION_PRESETS[useCase].quality,
    dimensions: {
      width: result.metadata.width,
      height: result.metadata.height
    }
  };
}

// Batch optimization with progress tracking
export async function batchOptimize(
  images: Array<{
    id: string;
    buffer: Buffer;
    useCase: keyof typeof WEBP_OPTIMIZATION_PRESETS;
  }>,
  onProgress?: (progress: { completed: number; total: number; current: string }) => void
): Promise<Record<string, OptimizationMetrics>> {
  const results: Record<string, OptimizationMetrics> = {};
  let completed = 0;
  
  for (const image of images) {
    try {
      results[image.id] = await optimizeWithMetrics(image.buffer, image.useCase);
      completed++;
      
      onProgress?.({
        completed,
        total: images.length,
        current: image.id
      });
    } catch (error) {
      console.error(`Failed to optimize image ${image.id}:`, error);
      completed++;
    }
  }
  
  return results;
}

// Quality assessment for optimization results
export interface QualityAssessment {
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

export function assessOptimizationQuality(
  originalSize: number,
  optimizedSize: number,
  compressionRatio: number,
  useCase: string
): QualityAssessment {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;
  
  // Check compression ratio
  if (compressionRatio < 10) {
    issues.push('Low compression ratio');
    score -= 20;
    recommendations.push('Consider using lower quality settings');
  } else if (compressionRatio > 80) {
    issues.push('Very high compression - quality may be compromised');
    score -= 15;
    recommendations.push('Consider using higher quality settings');
  }
  
  // Check file size appropriateness for use case
  const sizeKB = optimizedSize / 1024;
  
  if (useCase === 'thumbnail' && sizeKB > 50) {
    issues.push('Thumbnail file size too large');
    score -= 25;
    recommendations.push('Reduce thumbnail dimensions or quality');
  } else if (useCase === 'full' && sizeKB > 500) {
    issues.push('Full-size image file size too large');
    score -= 20;
    recommendations.push('Consider using medium quality for full-size images');
  }
  
  // Check if optimization actually helped
  if (optimizedSize >= originalSize) {
    issues.push('Optimization did not reduce file size');
    score -= 30;
    recommendations.push('Image may already be optimized or WebP conversion failed');
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
} 