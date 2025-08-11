# Fal-AI Ideogram Provider Integration Guide

## 🎯 Overview

This guide documents the integration of the **Fal-AI Ideogram V3** provider into the advanced AI provider management system. The Ideogram model offers exceptional typography handling and realistic outputs optimized for commercial and creative use.

## ✅ What's Been Implemented

### 1. **Fal-AI Ideogram Provider Integration**
- **Provider ID**: `fal-ideogram`
- **Model**: `fal-ai/ideogram/v3`
- **Cost**: Dynamic pricing based on rendering speed (TURBO: $0.03, BALANCED: $0.06, QUALITY: $0.09 per megapixel)
- **Priority**: 102 (Highest priority - user specifically requested)
- **API**: Uses `@fal-ai/client` with queue-based generation

### 2. **Advanced Settings Support**
- **Rendering Speed**: TURBO, BALANCED, QUALITY
- **Style Types**: AUTO, GENERAL, REALISTIC, DESIGN
- **MagicPrompt**: Automatic prompt enhancement
- **Negative Prompts**: Content exclusion control
- **Custom Image Sizes**: All standard ratios + custom dimensions
- **Sync Mode**: Real-time generation vs queue-based

### 3. **Provider Capabilities**
- **Seeds**: ✅ Supported for reproducible results
- **Multiple Images**: ✅ Up to 4 images per generation
- **Safety Checker**: ❌ Handled internally by Ideogram
- **Negative Prompts**: ✅ Full support
- **Style Presets**: ✅ Multiple style options
- **Typography**: ✅ Exceptional text rendering

## 🏗️ Technical Implementation

### Provider Class
```typescript
// lib/providers/fal-ideogram-provider.ts
export class FalIdeogramProvider extends BaseImageProvider {
  // Full implementation with all Ideogram V3 features
}
```

### Configuration
```typescript
// lib/providers/config.ts
"fal-ideogram": {
  type: "fal-ideogram",
  apiKey: falKey,
  baseUrl: "https://queue.fal.run",
  enabled: true,
  priority: 102,
  options: {
    model: "fal-ai/ideogram/v3",
    imageSize: "square_hd",
    syncMode: false,
    renderingSpeed: "BALANCED"
  }
}
```

### Type Definitions
```typescript
// lib/types/provider-settings.ts
'fal-ideogram'?: {
  renderingSpeed?: 'TURBO' | 'BALANCED' | 'QUALITY';
  expandPrompt?: boolean;
  style?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN';
  styleCodes?: string[];
  colorPalette?: {
    name?: string;
    members?: Array<{ color: string; weight?: number; }>;
  };
  negativePrompt?: string;
  imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  customImageSize?: { width: number; height: number; };
  syncMode?: boolean;
  numImages?: number;
  seed?: number;
};
```

## 🔧 Setup Instructions

### 1. Environment Variables
Add your Fal-AI API key to your environment:
```bash
# .env.local
FAL_KEY=your_fal_ai_api_key_here
```

### 2. Install Dependencies
The `@fal-ai/client` package should already be installed. If not:
```bash
npm install @fal-ai/client
```

### 3. Restart Application
After setting the environment variable, restart your application:
```bash
npm run dev
```

### 4. Verify Installation
Run the test script to verify everything works:
```bash
npx tsx scripts/test-fal-ideogram-provider.ts
```

## 🎛️ Advanced Provider Settings

### Location
Admin Dashboard → Settings Tab → Advanced Provider Settings

### Available Settings

#### Basic Settings
- **Inference Steps**: 1-50 (default: 25)
- **Guidance Scale**: 0.0-20.0 (default: 3.0)
- **Number of Images**: 1-4 (default: 1)
- **Priority Level**: Low/Normal/High

#### Fal-AI Ideogram Specific Settings
- **Rendering Speed**: 
  - `TURBO`: Fastest generation, lower quality
  - `BALANCED`: Good balance of speed and quality
  - `QUALITY`: Highest quality, slower generation
- **Style**: 
  - `AUTO`: Automatic style selection
  - `GENERAL`: General purpose images
  - `REALISTIC`: Photorealistic images
  - `DESIGN`: Design-focused images
- **Expand Prompt**: Enable MagicPrompt for enhanced prompts
- **Negative Prompt**: Text describing what to exclude
- **Image Size**: All standard ratios + custom dimensions
- **Sync Mode**: Wait for generation to complete

### Quality Presets
- **Fast**: TURBO rendering speed, lower inference steps
- **Standard**: BALANCED rendering speed, default settings
- **High**: QUALITY rendering speed, higher inference steps
- **Ultra**: QUALITY rendering speed, maximum settings

## 📊 Cost Management

### Pricing Structure
- **Dynamic Pricing** based on rendering speed:
  - **TURBO**: $0.03 per megapixel (fastest generation)
  - **BALANCED**: $0.06 per megapixel (default, balanced speed/quality)
  - **QUALITY**: $0.09 per megapixel (highest quality, slower generation)

- **Example Costs** (BALANCED speed):
  - 1024x1024 (1.05 MP): ~$0.063
  - 1024x576 (0.59 MP): ~$0.035
  - 576x1024 (0.59 MP): ~$0.035

- **Example Costs** (TURBO speed):
  - 1024x1024 (1.05 MP): ~$0.032
  - 1024x576 (0.59 MP): ~$0.018
  - 576x1024 (0.59 MP): ~$0.018

- **Example Costs** (QUALITY speed):
  - 1024x1024 (1.05 MP): ~$0.095
  - 1024x576 (0.59 MP): ~$0.053
  - 576x1024 (0.59 MP): ~$0.053

### Cost Tracking
- Real-time cost calculation
- Per-generation cost logging
- Budget alerts and limits
- Usage analytics

## 🎨 Usage Examples

### Basic Generation
```typescript
const params: ImageGenerationParams = {
  prompt: "A modern logo design with clean typography",
  aspectRatio: "1:1",
  quality: "standard",
  userId: "user123"
};

const result = await generateImageWithProviders(params, "fal-ideogram");
```

### Advanced Generation with Custom Settings
```typescript
const params: ImageGenerationParams = {
  prompt: "Professional business card design",
  aspectRatio: "16:9",
  quality: "high",
  userId: "user123",
  providerOptions: {
    renderingSpeed: "QUALITY",
    style: "DESIGN",
    negativePrompt: "blurry, low quality, amateur",
    expandPrompt: true,
    numImages: 2
  }
};
```

## 🔍 API Reference

### Fal-AI Ideogram V3 Parameters

#### Required Parameters
- `prompt` (string): Text description of the image to generate

#### Optional Parameters
- `image_size` (string): Output image size
- `rendering_speed` (string): TURBO, BALANCED, or QUALITY
- `expand_prompt` (boolean): Use MagicPrompt enhancement
- `style` (string): AUTO, GENERAL, REALISTIC, or DESIGN
- `negative_prompt` (string): Content to exclude
- `num_images` (number): Number of images to generate (1-4)
- `seed` (number): Random seed for reproducibility
- `sync_mode` (boolean): Wait for completion vs queue

#### Advanced Parameters
- `style_codes` (string[]): 8-character hexadecimal style codes
- `color_palette` (object): Custom color palette definition
- `image_urls` (string[]): Style reference images

## 🚀 Performance Optimization

### Best Practices
1. **Use BALANCED rendering speed** for most use cases
2. **Enable expand_prompt** for better results
3. **Use negative prompts** to avoid unwanted elements
4. **Set appropriate image sizes** to control costs
5. **Use seeds** for reproducible results

### Performance Tips
- **Fast Generation**: Use TURBO speed for quick iterations
- **High Quality**: Use QUALITY speed for final outputs
- **Cost Control**: Monitor image sizes and generation count
- **Batch Processing**: Use multiple images for variety

## 🔒 Security & Compliance

### API Key Security
- Store `FAL_KEY` in environment variables only
- Never expose API keys in client-side code
- Use server-side proxy for all API calls

### Content Safety
- Ideogram handles content filtering internally
- No additional safety checker needed
- Automatic NSFW content detection

## 🐛 Troubleshooting

### Common Issues

#### Provider Not Available
```
Error: Provider fal-ideogram is not configured
```
**Solution**: Check that `FAL_KEY` is set in environment variables

#### API Key Invalid
```
Error: Invalid API key for Fal-AI Ideogram
```
**Solution**: Verify your Fal-AI API key is correct and active

#### Generation Timeout
```
Error: Request timeout for Fal-AI Ideogram
```
**Solution**: 
- Use TURBO rendering speed for faster generation
- Check your internet connection
- Consider using sync_mode: false for queue-based generation

#### Quota Exceeded
```
Error: Quota exceeded for Fal-AI Ideogram
```
**Solution**: 
- Check your Fal-AI account balance
- Monitor usage in Fal-AI dashboard
- Implement cost controls in settings

### Health Check
Run the health check to diagnose issues:
```bash
npx tsx scripts/test-fal-ideogram-provider.ts
```

## 📈 Monitoring & Analytics

### Provider Health
- Automatic health checks every 5 minutes
- Circuit breaker pattern for fault tolerance
- Real-time status monitoring

### Usage Analytics
- Generation success/failure rates
- Average response times
- Cost per generation tracking
- Popular settings analysis

### Alerts
- Budget threshold alerts
- Provider downtime notifications
- Error rate monitoring
- Cost spike detection

## 🔄 Migration from Other Providers

### From Original Ideogram
- **API**: Different endpoint (Fal-AI vs direct Ideogram)
- **Cost**: Similar pricing structure
- **Features**: Enhanced with Fal-AI queue system
- **Settings**: Compatible parameter mapping

### From Other Providers
- **Parameters**: Standardized across all providers
- **Settings**: Unified configuration interface
- **Cost**: Transparent pricing per megapixel
- **Quality**: Exceptional typography handling

## 🎯 Future Enhancements

### Planned Features
- **Style Code Management**: UI for managing style codes
- **Color Palette Editor**: Visual color palette creation
- **Batch Processing**: Bulk image generation
- **Template System**: Pre-configured settings templates

### Integration Opportunities
- **Design Tools**: Integration with design software
- **Content Management**: Automated content generation
- **E-commerce**: Product image generation
- **Marketing**: Campaign asset creation

## 📞 Support

### Documentation
- [Fal-AI Ideogram V3 API Docs](https://fal.ai/models/fal-ai/ideogram/v3/api)
- [Advanced Provider System Guide](../ADVANCED_PROVIDER_SYSTEM_GUIDE.md)
- [Provider Settings Documentation](../lib/types/provider-settings.ts)

### Testing
- Test script: `scripts/test-fal-ideogram-provider.ts`
- Health check: Provider health monitoring
- Validation: Parameter validation and error handling

### Monitoring
- Provider status: Real-time health monitoring
- Cost tracking: Usage and spending analytics
- Performance: Response time and success rate tracking

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Provider**: Fal-AI Ideogram V3  
**Status**: ✅ Production Ready
