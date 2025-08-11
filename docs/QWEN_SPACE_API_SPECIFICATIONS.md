# Qwen/Qwen-Image Space API Specifications

## Overview

Based on the [Qwen/Qwen-Image model](https://huggingface.co/Qwen/Qwen-Image) and testing, this document outlines the complete API specifications for integrating with the Qwen Space API.

## API Access Method

**Space API via @gradio/client** (Recommended for JavaScript/TypeScript applications)

```javascript
import { Client } from "@gradio/client";
const client = await Client.connect("Qwen/Qwen-Image");
```

## API Endpoint

**Endpoint**: `/infer`  
**Method**: Space API prediction call  
**Purpose**: Generates an image using the Qwen-Image diffusion pipeline

## Request Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `prompt` | string | - | ✅ Yes | Text description for image generation |
| `seed` | number | 0 | ❌ No | Random seed for reproducible results |
| `randomize_seed` | boolean | true | ❌ No | Whether to randomize the seed |
| `aspect_ratio` | string | "16:9" | ❌ No | Image aspect ratio (see supported ratios below) |
| `guidance_scale` | number | 4 | ❌ No | How closely to follow the prompt (0-20) |
| `num_inference_steps` | number | 50 | ❌ No | Number of denoising steps (1-100) |
| `prompt_enhance` | boolean | true | ❌ No | Whether to enhance the prompt automatically |

## Supported Aspect Ratios

- `"1:1"` - Square (1328×1328)
- `"16:9"` - Widescreen (1664×928)
- `"9:16"` - Portrait (928×1664)
- `"4:3"` - Standard (1472×1140)
- `"3:4"` - Portrait standard (1140×1472)
- `"3:2"` - Classic photo (1584×1056)
- `"2:3"` - Portrait photo (1056×1584)

## Response Format

The API returns an array with 2 elements:

```javascript
[
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // Base64 image data
  42 // Used seed value
]
```

**Response Elements:**
1. **`[0]`** - Base64 encoded image data with MIME type prefix
2. **`[1]`** - The actual seed used for generation

## Usage Example

```javascript
import { Client } from "@gradio/client";

async function generateImage() {
  const client = await Client.connect("Qwen/Qwen-Image");
  
  const result = await client.predict("/infer", {
    prompt: "A beautiful sunset over mountains, high quality, detailed",
    seed: 42,
    randomize_seed: false,
    aspect_ratio: "16:9",
    guidance_scale: 4,
    num_inference_steps: 25,
    prompt_enhance: true,
  });
  
  const [imageBase64, usedSeed] = result.data;
  
  // Convert base64 to buffer for saving
  const base64Data = imageBase64.split(',')[1];
  const imageBuffer = Buffer.from(base64Data, 'base64');
  
  return {
    imageBuffer,
    seed: usedSeed,
    mimeType: 'image/png'
  };
}
```

## Model Capabilities

### ✅ **Strengths**
- **Exceptional text rendering** - especially Chinese characters
- **High-quality general image generation**
- **Multiple aspect ratio support**
- **Image editing capabilities** (advanced operations)
- **Style versatility** - photorealistic to artistic styles
- **Professional-grade editing** - style transfer, object manipulation

### ⚠️ **Limitations**
- **GPU quota limits** on free tier (120s/day typically)
- **Processing time** varies based on complexity and steps
- **Queue-based processing** during high usage
- **No direct image editing API** (requires separate workflow)

## Cost Structure

### Free Tier
- **GPU Time**: ~120 seconds per day
- **Reset**: Daily quota reset
- **Usage**: Suitable for testing and light usage

### Hugging Face Pro
- **Higher quotas** for GPU time
- **Priority access** during peak usage
- **Cost**: Check Hugging Face pricing page

### Self-Hosting Options
- **Deploy via Diffusers**: Use the Python pipeline directly
- **Custom deployment**: Host on your own infrastructure
- **Inference providers**: Use third-party providers like fal-ai

## Error Handling

Common error scenarios:

### Quota Exceeded
```javascript
{
  type: 'status',
  endpoint: '/infer',
  title: 'ZeroGPU quota exceeded',
  message: 'You have exceeded your GPU quota (120s requested vs. 47s left). Try again in 17:25:53'
}
```

### Space Unavailable
- Space is loading/restarting
- Space is in queue
- Network connectivity issues

### Invalid Parameters
- Unsupported aspect ratio
- Out of range guidance_scale or num_inference_steps

## Performance Recommendations

### For Production Use
1. **Implement retry logic** for quota/queue errors
2. **Cache results** where possible
3. **Consider Hugging Face Pro** for higher quotas
4. **Monitor quota usage** to prevent service interruptions
5. **Implement fallback providers** for redundancy

### Parameter Optimization
- **num_inference_steps**: 
  - Fast: 15-25 steps
  - Quality: 30-50 steps
- **guidance_scale**: 
  - Creative: 2-4
  - Precise: 4-8
- **prompt_enhance**: Usually keep `true` for better results

## Integration with Existing Codebase

To integrate with your current Ideogram setup:

1. **Create HuggingFaceProvider class** matching your existing provider pattern
2. **Map parameters** from your current format to Qwen API format
3. **Handle response conversion** from base64 to your expected format
4. **Implement error handling** for quota and queue scenarios
5. **Add configuration** for API switching between providers

## Next Steps

1. ✅ **Space API connection tested and working**
2. 🔄 **Create provider abstraction layer**
3. 🔄 **Implement Hugging Face provider class**
4. 🔄 **Test with existing application prompts**
5. 🔄 **Compare quality and performance with Ideogram**
