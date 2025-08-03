/**
 * Utility functions for slicing long carousel images into individual slide backgrounds
 */

export interface SlideImageSlice {
  slideIndex: number;
  imageUrl: string;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Creates CSS crop data for slicing a long image into individual slides
 * @param longImageUrl - The URL of the long horizontal image (3:1 aspect ratio)
 * @param slideCount - Number of slides to create
 * @param targetAspectRatio - Target aspect ratio for individual slides (e.g., "1:1", "16:9")
 * @returns Array of slide image data with crop information
 */
export function sliceLongImageIntoSlides(
  longImageUrl: string,
  slideCount: number,
  targetAspectRatio: string
): SlideImageSlice[] {
  const slides: SlideImageSlice[] = [];
  
  // Calculate crop dimensions
  // The long image is 3:1 (horizontal), we slice it horizontally into 1:1 squares
  // Each slide will be cropped to 1:1 aspect ratio
  const sliceWidth = 1 / slideCount; // Each slice takes 1/slideCount of the total width
  
  for (let i = 0; i < slideCount; i++) {
    const x = i * sliceWidth; // Starting position for this slice
    
    slides.push({
      slideIndex: i,
      imageUrl: longImageUrl,
      cropData: {
        x: x,
        y: 0, // Always start from top
        width: sliceWidth,
        height: 1 // Full height - will be cropped to 1:1 in CSS
      }
    });
  }
  
  return slides;
}

/**
 * Generates CSS for cropping an image to a specific slice
 * @param imageUrl - The image URL
 * @param cropData - The crop data for this slice
 * @param targetAspectRatio - Target aspect ratio for display
 * @returns CSS object for styling the cropped image
 */
export function generateCropCSS(
  imageUrl: string,
  cropData: { x: number; y: number; width: number; height: number },
  targetAspectRatio: string
) {
  // Convert crop data to percentages
  const xPercent = cropData.x * 100;
  const yPercent = cropData.y * 100;
  const widthPercent = cropData.width * 100;
  const heightPercent = cropData.height * 100;
  
  // For carousel slides, force 1:1 aspect ratio regardless of target
  const displayAspectRatio = '1 / 1'; // Always 1:1 for carousel slides
  
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
    backgroundSize: `${100 / cropData.width}% ${100 / cropData.height}%`,
    backgroundRepeat: 'no-repeat',
    aspectRatio: displayAspectRatio,
    width: '100%',
    height: 'auto'
  };
}

/**
 * Converts aspect ratio string to CSS aspect-ratio value
 * @param aspectRatio - Aspect ratio string (e.g., "1:1", "16:9")
 * @returns CSS aspect-ratio value
 */
export function aspectRatioToCSS(aspectRatio: string): string {
  const [width, height] = aspectRatio.split(':').map(Number);
  return `${width} / ${height}`;
}

/**
 * Creates a preview of all slides from the long image
 * @param longImageUrl - The URL of the long horizontal image
 * @param slideCount - Number of slides
 * @param targetAspectRatio - Target aspect ratio for individual slides
 * @returns Array of preview data for each slide
 */
export function createSlidePreviews(
  longImageUrl: string,
  slideCount: number,
  targetAspectRatio: string
) {
  const slices = sliceLongImageIntoSlides(longImageUrl, slideCount, targetAspectRatio);
  
  return slices.map(slice => ({
    ...slice,
    css: generateCropCSS(longImageUrl, slice.cropData, targetAspectRatio)
  }));
} 