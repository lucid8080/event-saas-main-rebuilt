import { 
  getImageMetadata, 
  calculateCompressionRatio, 
  canConvertToWebP,
  type WebPQualitySettings 
} from './webp-converter';

// WebP validation results interface
export interface WebPValidationResult {
  isValid: boolean;
  originalFormat: string;
  originalSize: number;
  webpSize: number;
  compressionRatio: number;
  qualityScore: number;
  warnings: string[];
  errors: string[];
  metadata: {
    width: number;
    height: number;
    hasAlpha: boolean;
    isOpaque: boolean;
  };
}

// WebP quality assessment criteria
export interface WebPQualityCriteria {
  minCompressionRatio: number; // Minimum acceptable compression ratio
  maxQualityLoss: number; // Maximum acceptable quality loss (0-100)
  minFileSize: number; // Minimum file size in bytes
  maxFileSize: number; // Maximum file size in bytes
}

// Default quality criteria
export const DEFAULT_WEBP_QUALITY_CRITERIA: WebPQualityCriteria = {
  minCompressionRatio: 10, // At least 10% compression
  maxQualityLoss: 5, // Maximum 5% quality loss
  minFileSize: 100, // Minimum 100 bytes
  maxFileSize: 10 * 1024 * 1024, // Maximum 10MB
};

// Validate WebP conversion quality
export async function validateWebPConversion(
  originalBuffer: Buffer,
  webpBuffer: Buffer,
  criteria: WebPQualityCriteria = DEFAULT_WEBP_QUALITY_CRITERIA
): Promise<WebPValidationResult> {
  const result: WebPValidationResult = {
    isValid: true,
    originalFormat: 'unknown',
    originalSize: originalBuffer.length,
    webpSize: webpBuffer.length,
    compressionRatio: 0,
    qualityScore: 0,
    warnings: [],
    errors: [],
    metadata: {
      width: 0,
      height: 0,
      hasAlpha: false,
      isOpaque: true,
    },
  };

  try {
    // Get original image metadata
    const originalMetadata = await getImageMetadata(originalBuffer);
    result.originalFormat = originalMetadata.format || 'unknown';
    result.metadata = {
      width: originalMetadata.width || 0,
      height: originalMetadata.height || 0,
      hasAlpha: originalMetadata.hasAlpha || false,
      isOpaque: false,
    };

    // Calculate compression ratio
    result.compressionRatio = calculateCompressionRatio(originalBuffer.length, webpBuffer.length);

    // Validate file size
    if (webpBuffer.length < criteria.minFileSize) {
      result.errors.push(`WebP file too small: ${webpBuffer.length} bytes (minimum: ${criteria.minFileSize})`);
      result.isValid = false;
    }

    if (webpBuffer.length > criteria.maxFileSize) {
      result.errors.push(`WebP file too large: ${webpBuffer.length} bytes (maximum: ${criteria.maxFileSize})`);
      result.isValid = false;
    }

    // Validate compression ratio
    if (result.compressionRatio < criteria.minCompressionRatio) {
      result.warnings.push(`Low compression ratio: ${result.compressionRatio.toFixed(2)}% (minimum: ${criteria.minCompressionRatio}%)`);
    }

    // Check if original image can be converted to WebP
    const canConvert = await canConvertToWebP(originalBuffer);
    if (!canConvert) {
      result.warnings.push('Original image format may not be optimal for WebP conversion');
    }

    // Calculate quality score (0-100)
    result.qualityScore = calculateQualityScore(result, criteria);

    // Additional validations
    if (result.compressionRatio < 0) {
      result.errors.push('WebP file is larger than original (negative compression)');
      result.isValid = false;
    }

    if (result.originalSize === 0) {
      result.errors.push('Original file size is zero');
      result.isValid = false;
    }

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
  }

  return result;
}

// Calculate quality score based on various factors
function calculateQualityScore(
  result: WebPValidationResult,
  criteria: WebPQualityCriteria
): number {
  let score = 100;

  // Deduct points for low compression ratio
  if (result.compressionRatio < criteria.minCompressionRatio) {
    const deduction = (criteria.minCompressionRatio - result.compressionRatio) * 2;
    score -= Math.min(deduction, 30); // Max 30 points deduction
  }

  // Deduct points for file size issues
  if (result.webpSize < criteria.minFileSize) {
    score -= 20;
  }
  if (result.webpSize > criteria.maxFileSize) {
    score -= 20;
  }

  // Bonus points for good compression
  if (result.compressionRatio > 50) {
    score += 10;
  }
  if (result.compressionRatio > 70) {
    score += 10;
  }

  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

// Batch validation for multiple images
export async function validateBatchWebPConversion(
  conversions: Array<{ id: string; originalBuffer: Buffer; webpBuffer: Buffer }>,
  criteria: WebPQualityCriteria = DEFAULT_WEBP_QUALITY_CRITERIA
): Promise<Array<{ id: string; result: WebPValidationResult }>> {
  const results = [];

  for (const conversion of conversions) {
    try {
      const result = await validateWebPConversion(
        conversion.originalBuffer,
        conversion.webpBuffer,
        criteria
      );
      results.push({ id: conversion.id, result });
    } catch (error) {
      results.push({
        id: conversion.id,
        result: {
          isValid: false,
          originalFormat: 'unknown',
          originalSize: conversion.originalBuffer.length,
          webpSize: conversion.webpBuffer.length,
          compressionRatio: 0,
          qualityScore: 0,
          warnings: [],
          errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          metadata: { width: 0, height: 0, hasAlpha: false, isOpaque: true },
        },
      });
    }
  }

  return results;
}

// Generate validation report
export function generateValidationReport(
  results: Array<{ id: string; result: WebPValidationResult }>
): {
  summary: {
    total: number;
    valid: number;
    invalid: number;
    averageCompressionRatio: number;
    averageQualityScore: number;
  };
  details: Array<{ id: string; result: WebPValidationResult }>;
} {
  const validResults = results.filter(r => r.result.isValid);
  const invalidResults = results.filter(r => !r.result.isValid);

  const averageCompressionRatio = validResults.length > 0
    ? validResults.reduce((sum, r) => sum + r.result.compressionRatio, 0) / validResults.length
    : 0;

  const averageQualityScore = validResults.length > 0
    ? validResults.reduce((sum, r) => sum + r.result.qualityScore, 0) / validResults.length
    : 0;

  return {
    summary: {
      total: results.length,
      valid: validResults.length,
      invalid: invalidResults.length,
      averageCompressionRatio,
      averageQualityScore,
    },
    details: results,
  };
}

// Check if WebP format is supported by the system
export async function checkWebPSupport(): Promise<{
  supported: boolean;
  sharpVersion: string;
  webpSupport: boolean;
  error?: string;
}> {
  try {
    const sharp = require('sharp');
    const sharpVersion = sharp.versions.sharp || 'unknown';
    
    // Test WebP support by creating a minimal WebP image
    const testBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    const webpBuffer = await sharp(testBuffer).webp().toBuffer();
    const webpSupport = webpBuffer.length > 0;

    return {
      supported: webpSupport,
      sharpVersion,
      webpSupport,
    };
  } catch (error) {
    return {
      supported: false,
      sharpVersion: 'unknown',
      webpSupport: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 