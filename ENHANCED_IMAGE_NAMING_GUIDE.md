# Enhanced Image Naming System Guide

## Overview

The enhanced image naming system provides comprehensive metadata embedding in image filenames for better organization, retrieval, and tracking of generated images.

## Key Features

### 📋 Comprehensive Metadata
- **ID**: Unique image identifier
- **Date**: Generation date (YYYY-MM-DD format)
- **Event Type**: Event categorization (WEDDING, BIRTHDAY_PARTY, etc.)
- **Aspect Ratio**: Image dimensions (1:1, 16:9, 9:16, etc.)
- **Style Preset**: Visual style applied
- **Watermark Status**: Whether watermark is applied
- **Prompt Hash**: Hash of the generation prompt for consistency
- **Generation Model**: AI model used (ideogram-v3, etc.)
- **Custom Tags**: Additional user-defined tags

### 🔍 Enhanced Filename Format

```
{imageId}_{date}_{eventType}_{aspectRatio}_{stylePreset}_{watermarkStatus}_{promptHash}_{generationModel}_{customTags}.{extension}
```

**Example:**
```
img_1754154110193_d7na61f56_2025-01-02_wedding_16x9_default_clean_a1b2c3d4_ideogram-v3_custom_tag.webp
```

## Implementation Details

### Core Functions

#### `generateEnhancedImageKey(metadata, extension)`
Generates enhanced image keys with comprehensive metadata.

```typescript
const imageMetadata: ImageMetadata = {
  userId: session.user.id,
  eventType: 'WEDDING',
  aspectRatio: '16:9',
  stylePreset: 'default',
  watermarkEnabled: true,
  promptHash: generatePromptHash(prompt),
  generationModel: 'ideogram-v3',
  customTags: ['outdoor', 'summer']
};

const enhancedKey = generateEnhancedImageKey(imageMetadata, 'webp');
```

#### `parseEnhancedImageKey(key)`
Extracts metadata from enhanced image keys.

```typescript
const metadata = parseEnhancedImageKey('users/123/images/img_1754154110193_d7na61f56_2025-01-02_wedding_16x9_default_clean_a1b2c3d4_ideogram-v3.webp');
// Returns: { imageId, date, eventType, aspectRatio, stylePreset, watermarkEnabled, promptHash, generationModel }
```

#### `generateSearchTags(metadata)`
Generates search-friendly tags from metadata.

```typescript
const tags = generateSearchTags(imageMetadata);
// Returns: ['wedding', '16x9', 'default', 'watermarked', 'ideogram-v3', 'outdoor', 'summer']
```

### Utility Functions

#### `generatePromptHash(prompt)`
Creates a consistent hash from the generation prompt.

#### `sanitizeFilename(str)`
Sanitizes strings for safe filename usage.

#### `generateDisplayFilename(metadata, extension)`
Creates human-readable filenames for display.

#### `isEnhancedImageKey(key)`
Checks if an image key uses the enhanced format.

## Benefits

### 🎯 Better Organization
- **Event-based grouping**: Images automatically organized by event type
- **Date-based sorting**: Chronological organization
- **Style categorization**: Group by visual style and aspect ratio

### 🔍 Improved Searchability
- **Metadata extraction**: Parse information directly from filenames
- **Tag-based search**: Search by event type, style, or custom tags
- **Prompt consistency**: Identify similar prompts via hash

### 📊 Enhanced Analytics
- **Usage tracking**: Monitor which event types are most popular
- **Style preferences**: Track aspect ratio and style usage
- **Generation patterns**: Analyze prompt and model usage

### 🔧 Better Debugging
- **Quick identification**: Identify image properties at a glance
- **Error tracking**: Easier to debug generation issues
- **Version control**: Track model and style changes

## Migration from Legacy System

### Backward Compatibility
- Legacy image keys continue to work
- `generateImageKey()` function maintained for compatibility
- `isEnhancedImageKey()` detects format automatically

### Migration Path
1. New images use enhanced naming automatically
2. Legacy images can be migrated using migration scripts
3. Both formats supported simultaneously

## Usage Examples

### Image Generation
```typescript
// Enhanced image generation with comprehensive metadata
const imageMetadata: ImageMetadata = {
  userId: session.user.id,
  eventType: eventType as EventType,
  aspectRatio: aspectRatio,
  watermarkEnabled: user.watermarkEnabled,
  promptHash: generatePromptHash(prompt),
  generationModel: 'ideogram-v3',
  customTags: eventDetails ? Object.keys(eventDetails).filter(key => eventDetails[key]) : undefined
};

const enhancedKey = generateEnhancedImageKey(imageMetadata, extension);
```

### Image Retrieval
```typescript
// Parse metadata from existing images
const images = await prisma.generatedImage.findMany({
  where: { userId: session.user.id }
});

images.forEach(image => {
  if (image.r2Key && isEnhancedImageKey(image.r2Key)) {
    const metadata = parseEnhancedImageKey(image.r2Key);
    console.log(`Event: ${metadata.eventType}, Date: ${metadata.date}`);
  }
});
```

### Search and Filter
```typescript
// Search by event type
const weddingImages = images.filter(image => {
  const metadata = parseEnhancedImageKey(image.r2Key);
  return metadata?.eventType === 'wedding';
});

// Search by date range
const recentImages = images.filter(image => {
  const metadata = parseEnhancedImageKey(image.r2Key);
  const imageDate = new Date(metadata?.date || '');
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return imageDate > weekAgo;
});
```

## File Structure

```
lib/
├── enhanced-image-naming.ts    # Core enhanced naming functions
├── r2.ts                       # R2 utilities with enhanced naming exports
└── gallery-utils.ts           # Gallery utilities using enhanced naming

actions/
└── generate-image.ts          # Updated to use enhanced naming

scripts/
├── check-image-event-types.ts # Event type verification
└── fix-image-event-types.ts   # Event type correction
```

## Best Practices

### ✅ Do's
- Use enhanced naming for all new images
- Include relevant custom tags for better searchability
- Maintain consistent event type categorization
- Use descriptive style presets

### ❌ Don'ts
- Don't modify enhanced keys manually
- Don't rely on filename parsing for critical operations
- Don't store sensitive information in filenames
- Don't exceed filename length limits

## Troubleshooting

### Common Issues

#### Event Type Mismatch
```bash
npm run check:event:types    # Check current event types
npm run fix:event:types      # Fix incorrect event types
```

#### R2 Key Issues
```bash
npm run check:r2:objects     # Verify R2 object existence
npm run test:image:urls      # Test URL generation
```

#### Metadata Parsing
```typescript
// Check if key is enhanced format
if (isEnhancedImageKey(image.r2Key)) {
  const metadata = parseEnhancedImageKey(image.r2Key);
  // Process enhanced metadata
} else {
  // Handle legacy format
}
```

## Future Enhancements

### Planned Features
- **Batch metadata updates**: Update multiple images at once
- **Advanced search**: Full-text search across all metadata
- **Analytics dashboard**: Visualize image generation patterns
- **Auto-tagging**: AI-powered automatic tag generation

### Integration Opportunities
- **CDN optimization**: Route images based on metadata
- **Caching strategies**: Cache by event type or style
- **Storage optimization**: Compress similar images together
- **Backup strategies**: Backup by event type or date ranges 