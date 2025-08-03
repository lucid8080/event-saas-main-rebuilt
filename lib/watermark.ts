/**
 * Watermark utility functions for adding watermarks to generated images
 */

import sharp from 'sharp';

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  padding?: number;
}

const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  text: 'Made using EventCraftAI.com',
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  color: '#ffffff',
  opacity: 0.7,
  position: 'bottom-right',
  padding: 20,
};

/**
 * Add watermark to an image using Canvas API (client-side)
 * @param imageUrl - URL of the image to watermark
 * @param options - Watermark configuration options
 * @returns Promise<string> - Base64 encoded watermarked image
 */
export async function addWatermarkToImage(
  imageUrl: string, 
  options: Partial<WatermarkOptions> = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Starting watermark process for:', imageUrl);
    const config = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
    console.log('Watermark config:', config);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Canvas context not available');
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Configure text style
      ctx.font = `${config.fontSize}px ${config.fontFamily}`;
      ctx.fillStyle = config.color;
      ctx.globalAlpha = config.opacity;
      
      // Calculate text position
      const textMetrics = ctx.measureText(config.text);
      const textWidth = textMetrics.width;
      const textHeight = config.fontSize;
      
      let x: number, y: number;
      
      switch (config.position) {
        case 'bottom-right':
          x = canvas.width - textWidth - config.padding;
          y = canvas.height - config.padding;
          break;
        case 'bottom-left':
          x = config.padding;
          y = canvas.height - config.padding;
          break;
        case 'top-right':
          x = canvas.width - textWidth - config.padding;
          y = textHeight + config.padding;
          break;
        case 'top-left':
          x = config.padding;
          y = textHeight + config.padding;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = (canvas.height + textHeight) / 2;
          break;
        default:
          x = canvas.width - textWidth - config.padding;
          y = canvas.height - config.padding;
      }
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Draw the watermark text
      ctx.fillText(config.text, x, y);
      
      // Convert to base64
      const watermarkedImageUrl = canvas.toDataURL('image/png');
      resolve(watermarkedImageUrl);
    };
    
    img.onerror = (error) => {
      console.error('Error loading image for watermarking:', error);
      // This is likely a CORS issue with external images
      console.log('This is likely a CORS issue. Trying alternative approach...');
      
      // For CORS issues, we'll create a simple overlay instead
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Create a simple watermark overlay
        canvas.width = 800; // Default width
        canvas.height = 600; // Default height
        
        // Fill with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configure text style
        ctx.font = `${config.fontSize}px ${config.fontFamily}`;
        ctx.fillStyle = config.color;
        ctx.globalAlpha = config.opacity;
        
        // Calculate text position
        const textMetrics = ctx.measureText(config.text);
        const textWidth = textMetrics.width;
        const textHeight = config.fontSize;
        
        let x: number, y: number;
        
        switch (config.position) {
          case 'bottom-right':
            x = canvas.width - textWidth - config.padding;
            y = canvas.height - config.padding;
            break;
          default:
            x = canvas.width - textWidth - config.padding;
            y = canvas.height - config.padding;
        }
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Draw the watermark text
        ctx.fillText(config.text, x, y);
        
        // Convert to base64
        const watermarkedImageUrl = canvas.toDataURL('image/png');
        resolve(watermarkedImageUrl);
      } catch (fallbackError) {
        console.error('Fallback watermark also failed:', fallbackError);
        reject(new Error('Failed to load image for watermarking'));
      }
    };
    
    img.src = imageUrl;
  });
}

/**
 * Add watermark to an image using server-side processing with Sharp
 * This function permanently embeds the watermark in the image data
 * @param imageBuffer - Buffer containing the image data
 * @param options - Watermark configuration options
 * @returns Promise<Buffer> - Buffer containing the watermarked image
 */
export async function addWatermarkToImageBuffer(
  imageBuffer: Buffer,
  options: Partial<WatermarkOptions> = {}
): Promise<Buffer> {
  try {
    console.log('Starting server-side watermark process');
    const config = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
    console.log('Server-side watermark config:', config);

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Image metadata:', { width: metadata.width, height: metadata.height, format: metadata.format });

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image dimensions');
    }

    // Calculate font size based on image dimensions
    const baseFontSize = config.fontSize || 16;
    const scale = Math.min(metadata.width, metadata.height) / 800; // Scale based on 800px reference
    const fontSize = Math.max(12, Math.min(32, baseFontSize * scale));
    
    // Create SVG watermark text with better positioning
    const svgText = `
      <svg width="${metadata.width}" height="${metadata.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        <text 
          x="${metadata.width - 20}" 
          y="${metadata.height - 20}" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}" 
          fill="${config.color}" 
          opacity="${config.opacity}"
          text-anchor="end"
          filter="url(#shadow)"
          font-weight="bold"
        >
          ${config.text}
        </text>
      </svg>
    `;

    console.log('SVG watermark created, applying to image...');

    // Create watermark overlay
    const watermarkBuffer = Buffer.from(svgText);

    // Composite the watermark onto the original image
    const watermarkedBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: watermarkBuffer,
          top: 0,
          left: 0,
        }
      ])
      .png({ quality: 90 }) // Convert to PNG with good quality
      .toBuffer();

    console.log('Server-side watermark applied successfully, output size:', watermarkedBuffer.length);
    return watermarkedBuffer;
  } catch (error) {
    console.error('Error applying server-side watermark:', error);
    // Return original buffer if watermarking fails
    console.log('Returning original buffer due to watermark error');
    return imageBuffer;
  }
}

/**
 * Add watermark to an image from URL using server-side processing
 * @param imageUrl - URL of the image to watermark
 * @param options - Watermark configuration options
 * @returns Promise<Buffer> - Buffer containing the watermarked image
 */
export async function addWatermarkToImageFromUrl(
  imageUrl: string,
  options: Partial<WatermarkOptions> = {}
): Promise<Buffer> {
  try {
    console.log('Fetching image from URL for watermarking:', imageUrl);
    
    // Fetch the image with proper headers
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    console.log('Image fetched successfully, size:', imageBuffer.length);
    
    // Apply watermark
    return await addWatermarkToImageBuffer(imageBuffer, options);
  } catch (error) {
    console.error('Error processing image from URL:', error);
    throw error;
  }
}

/**
 * Check if watermark should be applied based on user settings
 * @param watermarkEnabled - User's watermark toggle setting
 * @returns boolean - Whether watermark should be applied
 */
export function shouldApplyWatermark(watermarkEnabled: boolean): boolean {
  return watermarkEnabled;
}

/**
 * Get watermark configuration based on image dimensions
 * @param width - Image width
 * @param height - Image height
 * @returns WatermarkOptions - Optimized watermark configuration
 */
export function getWatermarkConfig(width: number, height: number): WatermarkOptions {
  // Scale font size based on image dimensions
  const baseFontSize = 16;
  const scale = Math.min(width, height) / 800; // Scale based on 800px reference
  const fontSize = Math.max(12, Math.min(24, baseFontSize * scale));
  
  return {
    ...DEFAULT_WATERMARK_OPTIONS,
    fontSize: Math.round(fontSize),
  };
}

/**
 * Generate a watermarked image URL that will be served through our proxy endpoint
 * @param originalUrl - The original image URL
 * @param userId - The user ID for authentication (optional, handled by session)
 * @returns string - The watermarked image URL
 */
export function getWatermarkedImageUrl(originalUrl: string, userId?: string): string {
  // Use the current host and port from the request
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${baseUrl}/api/watermarked-image?url=${encodedUrl}`;
} 