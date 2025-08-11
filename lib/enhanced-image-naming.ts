export interface ImageMetadata {
  userId: string;
  eventType?: string;
  aspectRatio?: string;
  stylePreset?: string;
  watermarkEnabled?: boolean;
  promptHash?: string;
  generationModel?: string;
  customTags?: string[];
}

export interface EnhancedImageKey {
  key: string;
  filename: string;
  metadata: {
    userId: string;
    imageId: string;
    timestamp: number;
    date: string;
    eventType?: string;
    aspectRatio?: string;
    stylePreset?: string;
    watermarkEnabled?: boolean;
    promptHash?: string;
    generationModel?: string;
    customTags?: string[];
  };
}

/**
 * Generate a hash from the prompt for consistent identification
 */
export function generatePromptHash(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Sanitize string for use in filenames
 */
export function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()
    .substring(0, 50); // Limit length
}

/**
 * Generate enhanced image key with comprehensive metadata
 */
export function generateEnhancedImageKey(
  metadata: ImageMetadata,
  extension: string = 'png'
): EnhancedImageKey {
  const timestamp = Date.now();
  const date = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  const imageId = `img_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate prompt hash if prompt is available
  const promptHash = metadata.promptHash || 'unknown';
  
  // Build filename components
  const components = [
    imageId,
    date,
    metadata.eventType ? sanitizeFilename(metadata.eventType) : 'unknown',
    metadata.aspectRatio ? sanitizeFilename(metadata.aspectRatio) : 'unknown',
    metadata.stylePreset ? sanitizeFilename(metadata.stylePreset) : 'default',
    metadata.watermarkEnabled ? 'watermarked' : 'clean',
    promptHash,
    metadata.generationModel ? sanitizeFilename(metadata.generationModel) : 'ideogram'
  ];
  
  // Add custom tags if provided
  if (metadata.customTags && metadata.customTags.length > 0) {
    const sanitizedTags = metadata.customTags
      .map(tag => sanitizeFilename(tag))
      .join('_');
    components.push(sanitizedTags);
  }
  
  const filename = `${components.join('_')}.${extension}`;
  const key = `users/${metadata.userId}/images/${filename}`;
  
  return {
    key,
    filename,
    metadata: {
      userId: metadata.userId,
      imageId,
      timestamp,
      date,
      eventType: metadata.eventType,
      aspectRatio: metadata.aspectRatio,
      stylePreset: metadata.stylePreset,
      watermarkEnabled: metadata.watermarkEnabled,
      promptHash,
      generationModel: metadata.generationModel,
      customTags: metadata.customTags
    }
  };
}

/**
 * Parse enhanced image key to extract metadata
 */
export function parseEnhancedImageKey(key: string): Partial<EnhancedImageKey['metadata']> | null {
  try {
    const parts = key.split('/');
    const filename = parts[parts.length - 1];
    const filenameParts = filename.split('.')[0].split('_');
    
    if (filenameParts.length < 8) {
      return null; // Not an enhanced key
    }
    
    const [
      imageId,
      date,
      eventType,
      aspectRatio,
      stylePreset,
      watermarkStatus,
      promptHash,
      generationModel,
      ...customTags
    ] = filenameParts;
    
    return {
      imageId,
      date,
      eventType: eventType === 'unknown' ? undefined : eventType,
      aspectRatio: aspectRatio === 'unknown' ? undefined : aspectRatio,
      stylePreset: stylePreset === 'default' ? undefined : stylePreset,
      watermarkEnabled: watermarkStatus === 'watermarked',
      promptHash,
      generationModel: generationModel === 'ideogram' ? undefined : generationModel,
      customTags: customTags.length > 0 ? customTags : undefined
    };
  } catch (error) {
    console.error('Error parsing enhanced image key:', error);
    return null;
  }
}

/**
 * Generate a human-readable filename for display
 */
export function generateDisplayFilename(metadata: ImageMetadata, extension: string = 'png'): string {
  const date = new Date().toISOString().split('T')[0];
  const eventType = metadata.eventType ? sanitizeFilename(metadata.eventType) : 'event';
  const aspectRatio = metadata.aspectRatio ? sanitizeFilename(metadata.aspectRatio) : 'standard';
  
  return `${eventType}_${aspectRatio}_${date}.${extension}`;
}

/**
 * Generate search-friendly tags from metadata
 */
export function generateSearchTags(metadata: ImageMetadata): string[] {
  const tags: string[] = [];
  
  if (metadata.eventType) {
    tags.push(metadata.eventType.toLowerCase());
  }
  
  if (metadata.aspectRatio) {
    tags.push(metadata.aspectRatio.toLowerCase());
  }
  
  if (metadata.stylePreset) {
    tags.push(metadata.stylePreset.toLowerCase());
  }
  
  if (metadata.watermarkEnabled) {
    tags.push('watermarked');
  }
  
  if (metadata.generationModel) {
    tags.push(metadata.generationModel.toLowerCase());
  }
  
  if (metadata.customTags) {
    tags.push(...metadata.customTags.map(tag => tag.toLowerCase()));
  }
  
  return Array.from(new Set(tags)); // Remove duplicates
}

/**
 * Legacy compatibility: Generate simple image key (for backward compatibility)
 */
export function generateSimpleImageKey(userId: string, imageId: string, extension: string = 'png'): string {
  const timestamp = Date.now();
  return `users/${userId}/images/${imageId}-${timestamp}.${extension}`;
}

/**
 * Check if an image key is enhanced format
 */
export function isEnhancedImageKey(key: string): boolean {
  const parts = key.split('/');
  const filename = parts[parts.length - 1];
  const filenameParts = filename.split('.')[0].split('_');
  
  // Enhanced keys have at least 8 components
  return filenameParts.length >= 8;
} 