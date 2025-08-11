# Before/After Slider Feature

## Overview

The Before/After Slider feature allows users to compare the original image with the upscaled version after using the upscale functionality. This provides a visual comparison to see the quality improvements achieved through upscaling.

## How It Works

### Image Generator Page
1. When a user generates an image, the original image URL is stored in state
2. When the user clicks the "Upscale" button, the original image URL is preserved before replacing it with the upscaled version
3. If both original and upscaled images are available, the BeforeAfterSlider component is displayed instead of the regular image
4. The slider allows users to drag left/right to see the before (original) and after (upscaled) versions

### Gallery Page
1. When a user selects an image in the gallery, the original image URL is stored
2. If the user upscales the image, the before/after slider appears in the modal view
3. The slider works the same way as in the image generator page

## Components

### BeforeAfterSlider Component
- **Location**: `components/ui/before-after-slider.tsx`
- **Features**:
  - Draggable slider handle to compare before/after images
  - Touch support for mobile devices
  - Before/After labels for clarity
  - Maintains image proportions and positioning
  - Smooth dragging experience

### Integration Points
- **Image Generator**: `components/dashboard/image-generator.tsx`
- **Gallery**: `app/(protected)/gallery/page.tsx`
- **Upscale Button**: `components/dashboard/upscale-button.tsx`

## State Management

### Image Generator
- `originalImageUrl`: Stores the original image URL before upscaling
- `generatedImageUrl`: Current image URL (original or upscaled)
- Logic: If `originalImageUrl` exists and differs from `generatedImageUrl`, show slider

### Gallery
- `originalImageUrl`: Stores the original image URL when image is selected
- `selectedImage.url`: Current image URL (original or upscaled)
- Logic: If `originalImageUrl` exists and differs from `selectedImage.url`, show slider

## User Experience

1. **Initial State**: User sees the regular image display
2. **After Upscaling**: User sees the before/after slider with:
   - Original image on the left (before)
   - Upscaled image on the right (after)
   - Draggable handle in the middle
   - Before/After labels for clarity
3. **Interaction**: User can drag the handle left/right to compare images
4. **Reset**: When user generates a new image or deletes the current one, the slider disappears

## Technical Details

### Slider Implementation
- Uses CSS transforms for smooth performance
- Handles both mouse and touch events
- Prevents text selection during dragging
- Maintains aspect ratio of images
- Responsive design that works on all screen sizes

### Image Handling
- Both original and upscaled images are loaded
- Images maintain their original proportions
- No quality loss during comparison
- Works with WebP images and regular formats

## Future Enhancements

Potential improvements for the feature:
1. Add keyboard controls (arrow keys) for slider movement
2. Add percentage indicator showing slider position
3. Add animation when transitioning from regular view to slider
4. Add option to toggle between slider and regular view
5. Add comparison metrics (file size, resolution differences)
