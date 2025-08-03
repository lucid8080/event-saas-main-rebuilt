import { generateSignedUrl } from './r2';

// Generate WebP signed URL from WebP key
export async function generateWebPSignedUrl(webpKey: string, expiresIn: number = 3600): Promise<string> {
  try {
    return await generateSignedUrl(webpKey, expiresIn);
  } catch (error) {
    console.error('Error generating WebP signed URL:', error);
    throw error;
  }
}

// Get optimal image URL (WebP if available, fallback to original)
export async function getOptimalImageUrl(
  originalUrl: string,
  webpKey?: string,
  webpEnabled?: boolean,
  originalFormat?: string
): Promise<{
  primaryUrl: string;
  fallbackUrl: string;
  isWebP: boolean;
}> {
  // Don't use WebP if it's not enabled or no WebP key
  if (!webpEnabled || !webpKey || originalFormat === 'webp') {
    return {
      primaryUrl: originalUrl,
      fallbackUrl: originalUrl,
      isWebP: false
    };
  }

  try {
    // Generate WebP signed URL
    const webpUrl = await generateWebPSignedUrl(webpKey);
    
    return {
      primaryUrl: webpUrl,
      fallbackUrl: originalUrl,
      isWebP: true
    };
  } catch (error) {
    console.warn('Failed to generate WebP URL, falling back to original:', error);
    return {
      primaryUrl: originalUrl,
      fallbackUrl: originalUrl,
      isWebP: false
    };
  }
}

// Batch generate WebP URLs for multiple images
export async function batchGenerateWebPUrls(
  images: Array<{
    id: string;
    originalUrl: string;
    webpKey?: string;
    webpEnabled?: boolean;
    originalFormat?: string;
  }>
): Promise<Array<{
    id: string;
    primaryUrl: string;
    fallbackUrl: string;
    isWebP: boolean;
  }>> {
  
  const results = await Promise.allSettled(
    images.map(async (image) => {
      const urlData = await getOptimalImageUrl(
        image.originalUrl,
        image.webpKey,
        image.webpEnabled,
        image.originalFormat
      );
      
      return {
        id: image.id,
        ...urlData
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to generate WebP URL for image ${images[index].id}:`, result.reason);
      // Fallback to original URL
      return {
        id: images[index].id,
        primaryUrl: images[index].originalUrl,
        fallbackUrl: images[index].originalUrl,
        isWebP: false
      };
    }
  });
}

// Check if WebP is supported in the current environment
export function isWebPSupported(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: assume WebP is supported (modern browsers)
    return true;
  }

  // Client-side: check WebP support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const dataURL = ctx.canvas.toDataURL('image/webp');
    return dataURL.indexOf('data:image/webp') === 0;
  }
  
  return false;
}

// Get WebP format indicator for debugging
export function getWebPFormatInfo(
  originalFormat?: string,
  webpEnabled?: boolean,
  webpKey?: string
): {
  shouldUseWebP: boolean;
  reason: string;
  originalFormat: string;
  webpEnabled: boolean;
  hasWebPKey: boolean;
} {
  const shouldUseWebP = webpEnabled && webpKey && originalFormat !== 'webp';
  
  let reason = 'WebP will be used';
  if (!webpEnabled) reason = 'WebP is disabled';
  else if (!webpKey) reason = 'No WebP key available';
  else if (originalFormat === 'webp') reason = 'Original is already WebP';
  
  return {
    shouldUseWebP,
    reason,
    originalFormat: originalFormat || 'unknown',
    webpEnabled: webpEnabled || false,
    hasWebPKey: !!webpKey
  };
} 