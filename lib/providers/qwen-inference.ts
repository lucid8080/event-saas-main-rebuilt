// Qwen-Image provider using Hugging Face Inference Providers
// This bypasses Space API quotas and uses Pro plan quotas properly

import { 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ProviderCapabilities, 
  ProviderType,
  AspectRatio,
  ImageQuality,
  ImageGenerationError,
  ErrorCodes
} from "./types";
import { BaseImageProvider } from "./base";

/**
 * Qwen-Image provider using Hugging Face Inference Providers
 * Uses Pro plan quotas and bypasses Space API limitations
 */
export class QwenInferenceProvider extends BaseImageProvider {
  
  getProviderType(): ProviderType {
    return "qwen";
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportedAspectRatios: [
        "1:1",
        "16:9", 
        "9:16",
        "4:3",
        "3:4",
        "4:5", // Instagram Portrait
        "5:7", // Greeting Card  
        "3:2",
        "2:3",
        "10:16",
        "16:10",
        "1:3",
        "3:1"
        // Qwen supports many aspect ratios via prompt enhancement
      ],
      supportedQualities: ["fast", "standard", "high", "ultra"],
      maxPromptLength: 1000, // Qwen supports longer prompts
      supportsSeeds: false, // Inference Provider doesn't expose seeds directly
      supportsStyleImages: false, // Not supported in Inference Provider
      supportsImageEditing: false, // Not supported in Inference Provider
      rateLimits: {
        requestsPerMinute: 100, // Pro plan limits
        requestsPerHour: 1000,
        requestsPerDay: 10000 // Much higher with Pro plan
      },
      pricing: {
        costPerImage: 0.02, // Inference Provider cost
        currency: "USD",
        freeQuota: 0 // Uses Pro plan
      }
    };
  }
  
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Validate parameters
      await this.validateParams(params);
      
      // Convert parameters to Inference Provider format
      const inferenceParams = this.convertParams(params);
      
      this.logMetrics("generation_start", params);
      
      // Import Hugging Face Inference Client
      const { InferenceClient } = await import("@huggingface/inference");
      
      // Create client with API token
      const client = new InferenceClient(this.config.apiKey);
      
      console.log('📸 Generating image with Qwen-Image via Inference Providers...');
      
      // Make the API call with explicit dimensions
      const image = await client.textToImage({
        provider: "auto", // Let HF choose the best provider (fal-ai, etc.)
        model: "Qwen/Qwen-Image",
        inputs: params.prompt, // Use original prompt without aspect ratio hints
        parameters: inferenceParams, // Includes width/height
      });
      
      console.log(`✅ Qwen-Image generation successful!`);
      
      // Handle the response - assume it's a string for now
      let dataUrl: string;
      let mimeType = "image/png";
      
      if (typeof image === 'string') {
        // If it's already a data URL
        dataUrl = image;
        mimeType = image.startsWith('data:image/') ? image.split(';')[0].split(':')[1] : "image/png";
      } else {
        // Assume it's some other format, convert to string
        dataUrl = String(image);
        mimeType = "image/png";
      }
      
      // Convert response to standard format
      const standardResponse = await this.convertResponse(dataUrl, mimeType, params, startTime);
      
      this.logMetrics("generation_success", params, standardResponse);
      
      return standardResponse;
      
    } catch (error) {
      const generationError = this.handleError(error, "generateImage");
      this.logMetrics("generation_error", params, undefined, generationError);
      throw generationError;
    }
  }
  
  /**
   * Convert standard parameters to Inference Provider format
   */
  private convertParams(params: ImageGenerationParams): any {
    // Convert quality to inference steps
    const qualityToSteps = {
      fast: 15,
      standard: 25,
      high: 35,
      ultra: 50
    };
    
    const inferenceSteps = qualityToSteps[params.quality || "standard"];
    
    // Get exact dimensions for the aspect ratio
    const dimensions = this.estimateQwenDimensions(params.aspectRatio);
    
    // Build parameters object with explicit dimensions
    // Using official Qwen-Image parameters from Quick Start guide
    const inferenceParams: any = {
      num_inference_steps: inferenceSteps,
      true_cfg_scale: 4.0,       // Official Qwen parameter (not guidance_scale)
      width: dimensions.width,   // Official Qwen width control
      height: dimensions.height, // Official Qwen height control
      negative_prompt: " "       // Empty string as recommended in Quick Start
    };
    
    console.log(`[QwenInference] Using dimensions: ${dimensions.width}x${dimensions.height} for ${params.aspectRatio}`);
    
    return inferenceParams;
  }
  
  /**
   * Get aspect ratio hint for prompt enhancement
   */
  private getAspectRatioHint(aspectRatio: string): string {
    const hints: Record<string, string> = {
      "16:9": "wide landscape format, cinematic aspect ratio",
      "9:16": "tall portrait format, vertical mobile screen", 
      "4:3": "standard landscape format, traditional photo",
      "3:4": "portrait orientation, vertical format",
      "4:5": "tall portrait format, Instagram portrait style",
      "5:7": "vertical greeting card format, tall narrow",
      "1:1": "square format, Instagram post style",
      "3:2": "photo landscape format, DSLR camera ratio",
      "2:3": "photo portrait format, vertical photo style",
      "10:16": "very tall portrait, story format",
      "16:10": "wide landscape, monitor aspect ratio",
      "1:3": "extremely tall format, banner style",
      "3:1": "extremely wide format, panoramic banner"
    };
    
    return hints[aspectRatio] || "";
  }
  
  /**
   * Convert Inference Provider response to standard format
   */
  private async convertResponse(
    imageData: string,
    mimeType: string, 
    params: ImageGenerationParams, 
    startTime: number
  ): Promise<ImageGenerationResponse> {
    
    // Estimate dimensions based on aspect ratio (Qwen typically generates high-res)
    const dimensions = this.estimateQwenDimensions(params.aspectRatio);
    
    return {
      imageData,
      mimeType,
      seed: undefined, // Inference Provider doesn't expose seeds
      provider: "qwen",
      cost: 0.02, // Inference Provider cost
      generationTime: Date.now() - startTime,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: params.aspectRatio,
        prompt: params.prompt,
        quality: params.quality || "standard"
      },
      providerData: {
        model: "Qwen/Qwen-Image",
        inferenceProvider: true,
        provider: "auto", // HF auto-selects (usually fal-ai)
        guidanceScale: 4.0,
        inferenceSteps: this.convertQuality(params.quality || "standard")
      }
    };
  }
  
  /**
   * Estimate Qwen output dimensions based on aspect ratio
   * Using official Qwen-Image dimensions from the Quick Start guide
   */
  private estimateQwenDimensions(aspectRatio: string): { width: number; height: number } {
    // Normalized dimensions targeting ~1.75 MP for consistent quality across all aspect ratios
    // All dimensions are divisible by 8 for optimal AI model compatibility
    const normalizedQwenRatios: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1320, height: 1320 },   // 1.74 MP - Square
      "16:9": { width: 1768, height: 992 },   // 1.75 MP - Widescreen
      "9:16": { width: 992, height: 1768 },   // 1.75 MP - Portrait
      "4:3": { width: 1528, height: 1144 },   // 1.75 MP - Standard
      "3:4": { width: 1144, height: 1528 },   // 1.75 MP - Portrait standard
      "4:5": { width: 1184, height: 1480 },   // 1.75 MP - Instagram portrait
      "5:7": { width: 1120, height: 1568 },   // 1.76 MP - Greeting card
      "3:2": { width: 1624, height: 1080 },   // 1.75 MP - Classic photo
      "2:3": { width: 1080, height: 1624 },   // 1.75 MP - Portrait photo
      "10:16": { width: 1048, height: 1672 }, // 1.75 MP - Story format
      "16:10": { width: 1672, height: 1048 }, // 1.75 MP - Wide format
      "1:3": { width: 768, height: 2288 },    // 1.76 MP - Banner tall
      "3:1": { width: 2288, height: 768 }     // 1.76 MP - Banner wide
    };
    
    // Return normalized dimensions or fallback to square
    return normalizedQwenRatios[aspectRatio] || normalizedQwenRatios["1:1"];
  }
  
  /**
   * Convert quality to inference steps
   */
  protected convertQuality(quality: ImageQuality): number {
    const qualityMap = {
      fast: 15,
      standard: 25,
      high: 35,
      ultra: 50
    };
    
    return qualityMap[quality] || 25;
  }
  
  /**
   * Handle Inference Provider specific errors
   */
  protected handleError(error: any, operation: string): ImageGenerationError {
    if (error && typeof error === 'object') {
      const message = error.message || '';
      
      // Rate limiting from Inference Provider
      if (message.includes('rate limit') || message.includes('429') || error.status === 429) {
        return new ImageGenerationError(
          `Qwen Inference rate limit: ${message}`,
          ErrorCodes.RATE_LIMITED,
          "qwen",
          true // retryable
        );
      }
      
      // Model loading/unavailable
      if (message.includes('loading') || message.includes('503') || error.status === 503) {
        return new ImageGenerationError(
          `Qwen model loading: ${message}`,
          ErrorCodes.SERVICE_UNAVAILABLE,
          "qwen",
          true // retryable
        );
      }
      
      // Authentication errors
      if (message.includes('401') || message.includes('403') || error.status === 401 || error.status === 403) {
        return new ImageGenerationError(
          `Qwen authentication failed: ${message}`,
          ErrorCodes.UNAUTHORIZED,
          "qwen"
        );
      }
      
      // Quota exceeded (less likely with Inference Provider)
      if (message.includes('quota') || message.includes('exceeded')) {
        return new ImageGenerationError(
          `Qwen quota exceeded: ${message}`,
          ErrorCodes.QUOTA_EXCEEDED,
          "qwen",
          true // retryable
        );
      }
    }
    
    // Fall back to base error handling
    return super.handleError(error, operation);
  }
  
  /**
   * Health check specific to Inference Provider
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { InferenceClient } = await import("@huggingface/inference");
      const client = new InferenceClient(this.config.apiKey);
      
      // Simple test request
      await client.textToImage({
        provider: "auto",
        model: "Qwen/Qwen-Image",
        inputs: "test",
        parameters: { num_inference_steps: 1 }
      });
      
      return true;
      
    } catch (error) {
      console.warn(`[QwenInference] Health check failed: ${error}`);
      return false;
    }
  }
}
