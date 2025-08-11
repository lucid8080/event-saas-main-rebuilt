// Enhanced Hugging Face provider using Inference API instead of Space API
// This respects Pro plan quotas better than Space API

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
 * Hugging Face provider using standard Inference API (better for Pro plans)
 */
export class HuggingFaceInferenceProvider extends BaseImageProvider {
  private readonly models = {
    "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-base-1.0",
    "flux-schnell": "black-forest-labs/FLUX.1-schnell",
    "stable-diffusion-21": "runwayml/stable-diffusion-v1-5" // Fallback
  };
  
  private defaultModel = this.models["stable-diffusion-xl"];
  
  getProviderType(): ProviderType {
    return "huggingface";
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportedAspectRatios: [
        "1:1",
        "16:9", 
        "9:16",
        "4:3",
        "3:4",
        "3:2",
        "2:3"
        // Note: Inference API models support these common ratios
      ],
      supportedQualities: ["fast", "standard", "high"],
      maxPromptLength: 500, // Conservative for most models
      supportsSeeds: false, // Most Inference API models don't support custom seeds
      supportsStyleImages: false, // Not supported in Inference API
      supportsImageEditing: false, // Not supported in basic Inference API
      rateLimits: {
        requestsPerMinute: 100, // Much higher with Pro plan
        requestsPerHour: 1000,
        requestsPerDay: 10000 // Pro plan quotas
      },
      pricing: {
        costPerImage: 0.01, // Pro plan cost per image
        currency: "USD",
        freeQuota: 0 // No free quota, but Pro plan covers it
      }
    };
  }
  
  /**
   * Override validateParams to ignore seed parameters
   */
  protected async validateParams(params: ImageGenerationParams): Promise<void> {
    // Call parent validation but catch seed-related errors
    try {
      await super.validateParams(params);
    } catch (error: any) {
      // Allow seed-related errors to pass through - we'll just ignore the seed
      if (error?.message?.includes('seed') || error?.message?.includes('Custom seeds')) {
        console.warn('[HuggingFaceInference] Ignoring seed parameter (not supported by Inference API)');
        return;
      }
      // Re-throw other validation errors
      throw error;
    }
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Validate parameters (gracefully handles seed params)
      await this.validateParams(params);
      
      // Convert parameters to Inference API format
      const inferenceParams = this.convertParams(params);
      
      this.logMetrics("generation_start", params);
      
      // Make the API call
      const response = await fetch(`https://api-inference.huggingface.co/models/${this.defaultModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inferenceParams)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Inference API error: ${response.status} - ${errorText}`);
      }
      
      // Check if response is an image
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('image')) {
        const text = await response.text();
        throw new Error(`Expected image, got: ${text}`);
      }
      
      // Convert response to buffer
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      
      // Convert to base64 for consistency with our system
      const base64Image = `data:${contentType};base64,${imageBuffer.toString('base64')}`;
      
      // Convert response to standard format
      const standardResponse = await this.convertResponse(base64Image, params, startTime);
      
      this.logMetrics("generation_success", params, standardResponse);
      
      return standardResponse;
      
    } catch (error) {
      const generationError = this.handleError(error, "generateImage");
      this.logMetrics("generation_error", params, undefined, generationError);
      throw generationError;
    }
  }
  
  /**
   * Convert standard parameters to Inference API format
   */
  private convertParams(params: ImageGenerationParams): any {
    // Convert quality to inference steps
    const qualityToSteps = {
      fast: 10,
      standard: 20,
      high: 30,
      ultra: 40
    };
    
    const inferenceSteps = qualityToSteps[params.quality || "standard"];
    
    // Create optimized prompt
    let enhancedPrompt = params.prompt;
    
    // Add quality modifiers based on the quality setting
    if (params.quality === "high" || params.quality === "ultra") {
      enhancedPrompt += ", high quality, detailed, professional";
    }
    
    return {
      inputs: enhancedPrompt,
      parameters: {
        guidance_scale: 7.5, // Good default for most models
        num_inference_steps: inferenceSteps,
        // Note: Most Inference API models don't support aspect ratio control
        // The image will be generated in the model's default size
      }
    };
  }
  
  /**
   * Convert Inference API response to standard format
   */
  private async convertResponse(
    imageData: string, 
    params: ImageGenerationParams, 
    startTime: number
  ): Promise<ImageGenerationResponse> {
    
    // Default dimensions for SDXL (we can't control aspect ratio in Inference API)
    const dimensions = { width: 1024, height: 1024 };
    
    return {
      imageData,
      mimeType: "image/png",
      seed: undefined, // Inference API doesn't return seeds
      provider: "huggingface",
      cost: 0.01, // Pro plan cost
      generationTime: Date.now() - startTime,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: params.aspectRatio,
        prompt: params.prompt,
        quality: params.quality || "standard"
      },
      providerData: {
        model: this.defaultModel,
        inferenceApi: true,
        guidanceScale: 7.5,
        inferenceSteps: this.convertQuality(params.quality || "standard")
      }
    };
  }
  
  /**
   * Convert quality to inference steps
   */
  protected convertQuality(quality: ImageQuality): number {
    const qualityMap = {
      fast: 10,
      standard: 20,
      high: 30,
      ultra: 40
    };
    
    return qualityMap[quality] || 20;
  }
  
  /**
   * Handle Inference API specific errors
   */
  protected handleError(error: any, operation: string): ImageGenerationError {
    // Handle Inference API specific errors
    if (error && typeof error === 'object') {
      const message = error.message || '';
      
      // Rate limiting
      if (message.includes('rate limit') || message.includes('429')) {
        return new ImageGenerationError(
          `Rate limit exceeded: ${message}`,
          ErrorCodes.RATE_LIMITED,
          "huggingface",
          true // retryable
        );
      }
      
      // Model loading
      if (message.includes('loading') || message.includes('503')) {
        return new ImageGenerationError(
          `Model is loading: ${message}`,
          ErrorCodes.SERVICE_UNAVAILABLE,
          "huggingface",
          true // retryable
        );
      }
      
      // Authentication errors
      if (message.includes('401') || message.includes('403')) {
        return new ImageGenerationError(
          `Authentication failed: ${message}`,
          ErrorCodes.UNAUTHORIZED,
          "huggingface"
        );
      }
    }
    
    // Fall back to base error handling
    return super.handleError(error, operation);
  }
  
  /**
   * Health check specific to Inference API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${this.defaultModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: "test",
          parameters: {
            num_inference_steps: 1 // Minimal for health check
          }
        })
      });
      
      return response.status === 200;
      
    } catch (error) {
      console.warn(`[HuggingFaceInference] Health check failed: ${error}`);
      return false;
    }
  }
  
  /**
   * Switch to a different model
   */
  setModel(modelName: keyof typeof this.models): void {
    this.defaultModel = this.models[modelName];
    console.log(`[HuggingFaceInference] Switched to model: ${this.defaultModel}`);
  }
  
  /**
   * Get available models
   */
  getAvailableModels(): Record<string, string> {
    return { ...this.models };
  }
}
