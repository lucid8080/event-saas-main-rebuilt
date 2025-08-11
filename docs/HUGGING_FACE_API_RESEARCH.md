# Hugging Face API Research for Image Generation

## Executive Summary

This document outlines the research findings for transitioning from Ideogram API to Hugging Face API for image generation in our event SaaS application.

## Current Ideogram Integration Analysis

### Current API Usage Patterns
- **Main Endpoint**: `https://api.ideogram.ai/v1/ideogram-v3/generate`
- **Authentication**: API Key via `Api-Key` header
- **Request Format**: FormData with prompt, aspect_ratio, rendering_speed
- **Response Format**: JSON with image URL in `data[0].url` or `url` field
- **Aspect Ratios**: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 10:16, 16:10, 1:3, 3:1
- **Features**: Text-to-image generation, image editing, style reference images

### Current Integration Points
1. `actions/generate-image.ts` - Main image generation
2. `actions/generate-image-v3.ts` - V3 image generation  
3. `actions/generate-carousel-background.ts` - Carousel backgrounds
4. `actions/generate-carousel-long-image.ts` - Long carousel images
5. `components/dashboard/image-editor-modal.tsx` - Image editing
6. `app/api/test-ideogram-v3/route.ts` - API testing

## Hugging Face API Research

### Recommended Models for Image Generation

#### 1. **Qwen/Qwen-Image** (RECOMMENDED)
- **Model Type**: Text-to-Image generation
- **License**: Apache 2.0 (commercial use allowed)
- **Strengths**:
  - Excellent text rendering (especially Chinese)
  - High-quality image generation
  - Multiple aspect ratios supported
  - Image editing capabilities
  - Recent release (August 2025)
- **Aspect Ratios**: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3
- **API Access**: Via Hugging Face Inference API
- **Cost**: Free tier available, paid plans for higher usage

#### 2. **stabilityai/stable-diffusion-xl-base-1.0**
- **Model Type**: Text-to-Image generation
- **License**: CreativeML Open RAIL-M (commercial use with restrictions)
- **Strengths**:
  - High-quality image generation
  - Wide range of styles
  - Good text rendering
- **Limitations**: License restrictions for commercial use

#### 3. **runwayml/stable-diffusion-v1-5**
- **Model Type**: Text-to-Image generation
- **License**: CreativeML Open RAIL-M
- **Strengths**:
  - Stable and reliable
  - Good performance
- **Limitations**: Older model, license restrictions

### Hugging Face API Options

#### Option 1: Hugging Face Inference API (RECOMMENDED)
- **Endpoint**: `https://api-inference.huggingface.co/models/{model_name}`
- **Authentication**: API Token via `Authorization: Bearer {token}` header
- **Request Format**: JSON with prompt and parameters
- **Response Format**: Binary image data or JSON with image URL
- **Cost**: Free tier (30,000 requests/month), then $0.06/hour for inference
- **Rate Limits**: 30 requests/minute on free tier

#### Option 2: Hugging Face Spaces API
- **Endpoint**: Varies by space
- **Authentication**: API Token
- **Request Format**: Depends on space implementation
- **Response Format**: Depends on space implementation
- **Cost**: Free for basic usage
- **Rate Limits**: Varies by space

#### Option 3: Self-Hosted Inference
- **Endpoint**: Local server
- **Authentication**: None (local)
- **Request Format**: HTTP requests to local endpoint
- **Response Format**: Binary image data
- **Cost**: Server hosting costs only
- **Rate Limits**: None (limited by hardware)

## API Integration Comparison

### Ideogram vs Hugging Face Qwen-Image

| Feature | Ideogram | Hugging Face Qwen-Image |
|---------|----------|-------------------------|
| **Text Rendering** | Good | Excellent (especially Chinese) |
| **Image Quality** | High | High |
| **Aspect Ratios** | 10+ ratios | 7 standard ratios |
| **Image Editing** | Yes | Yes |
| **Style Reference** | Yes | Limited |
| **API Cost** | $0.10-0.20/image | Free tier + $0.06/hour |
| **Rate Limits** | Varies by plan | 30 req/min (free) |
| **License** | Commercial | Apache 2.0 |
| **Response Time** | Fast | Variable (depends on model) |

### Parameter Mapping

#### Ideogram Parameters → Hugging Face Qwen-Image
```typescript
// Ideogram
{
  prompt: string,
  aspect_ratio: "1x1" | "16x9" | "9x16" | ...,
  rendering_speed: "TURBO"
}

// Hugging Face Qwen-Image
{
  prompt: string,
  width: number,
  height: number,
  num_inference_steps: number,
  true_cfg_scale: number
}
```

#### Aspect Ratio Conversion
```typescript
const aspectRatioMap = {
  '1:1': { width: 1328, height: 1328 },
  '16:9': { width: 1664, height: 928 },
  '9:16': { width: 928, height: 1664 },
  '4:3': { width: 1472, height: 1140 },
  '3:4': { width: 1140, height: 1472 },
  '3:2': { width: 1584, height: 1056 },
  '2:3': { width: 1056, height: 1584 }
};
```

## Implementation Strategy

### Phase 1: Hugging Face Inference API Integration
1. **Set up Hugging Face account** and obtain API token
2. **Test Qwen-Image model** with current prompts
3. **Implement parameter mapping** and conversion functions
4. **Create Hugging Face provider** class
5. **Test all aspect ratios** and features

### Phase 2: API Abstraction Layer
1. **Design abstract interface** for image generation
2. **Create provider pattern** for multiple APIs
3. **Implement fallback mechanisms** between providers
4. **Add configuration management** for API selection

### Phase 3: Migration and Testing
1. **Gradual migration** from Ideogram to Hugging Face
2. **A/B testing** of image quality and performance
3. **User feedback collection** and optimization
4. **Full migration** with Ideogram as backup

## Cost Analysis

### Hugging Face Pricing (Inference API)
- **Free Tier**: 30,000 requests/month
- **Paid Tier**: $0.06/hour for inference
- **Estimated Cost**: $0.002-0.005 per image (much cheaper than Ideogram)

### Ideogram Pricing
- **Estimated Cost**: $0.10-0.20 per image
- **Monthly Cost**: $100-200 for 1,000 images

### Potential Savings
- **Cost Reduction**: 80-90% savings with Hugging Face
- **Monthly Savings**: $80-180 for 1,000 images

## Risk Assessment

### Low Risk
- **API Stability**: Hugging Face is well-established
- **Model Quality**: Qwen-Image is high-quality
- **License**: Apache 2.0 allows commercial use

### Medium Risk
- **Response Time**: May be slower than Ideogram
- **Rate Limits**: Free tier has limitations
- **Feature Parity**: Some features may differ

### Mitigation Strategies
- **Fallback to Ideogram**: Keep as backup during transition
- **Caching**: Implement image caching for performance
- **Gradual Migration**: Test thoroughly before full switch

## Next Steps

1. **Set up Hugging Face account** and obtain API token
2. **Test Qwen-Image model** with sample prompts
3. **Compare image quality** with current Ideogram outputs
4. **Implement basic integration** for testing
5. **Design API abstraction layer** architecture

## Conclusion

Hugging Face Qwen-Image via the Inference API is the recommended choice for replacing Ideogram. It offers:
- **Significant cost savings** (80-90% reduction)
- **Excellent text rendering** capabilities
- **High-quality image generation**
- **Flexible licensing** (Apache 2.0)
- **Reliable API** with good documentation

The transition should be implemented gradually with proper testing and fallback mechanisms to ensure service continuity. 