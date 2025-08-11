// Qwen-Image provider using Hugging Face Space API
// Note: This provider has independent quotas that may not respect Pro plan limits

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
 * Qwen-Image provider using Hugging Face Space API
 * Provides high-quality image generation but has separate quota limits
 */
export class QwenImageProvider extends BaseImageProvider {
  
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
        "4:5",
        "5:7",
        "3:2",
        "2:3",
        "10:16",
        "16:10",
        "1:3",
        "3:1"
        // Qwen supports many aspect ratios
      ],
      supportedQualities: ["fast", "standard", "high"],
      maxPromptLength: 1000, // Qwen supports longer prompts
      supportsSeeds: true, // Qwen supports custom seeds
      supportsStyleImages: false, // Not supported in basic Space API
      supportsImageEditing: false, // Not supported in basic Space API
      rateLimits: {
        requestsPerMinute: 5, // Conservative for Space API
        requestsPerHour: 30,
        requestsPerDay: 120 // Space quota limits
      },
      pricing: {
        costPerImage: 0.00, // Free but quota limited
        currency: "USD",
        freeQuota: 120 // Daily quota
      }
    };
  }
  
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Validate parameters
      await this.validateParams(params);
      
      // Convert parameters to Qwen Space API format
      const qwenParams = this.convertParams(params);
      
      this.logMetrics("generation_start", params);
      
      // Import Gradio client dynamically
      const { Client } = await import("@gradio/client");
      
      // Connect to Qwen Space
      console.log('🔗 Connecting to Qwen/Qwen-Image Space...');
      const client = await Client.connect("Qwen/Qwen-Image");
      
      // Make the API call
      console.log('📸 Generating image with Qwen-Image...');
      const result = await client.predict("/infer", qwenParams);
      
      // Extract image data from result
      const imageUrl = result.data[0]; // First element is the image URL
      const usedSeed = result.data[1]; // Second element is the seed
      
      // Download the image to get buffer data
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download generated image: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
      
      // Convert response to standard format
      const standardResponse = await this.convertResponse(base64Image, params, startTime, usedSeed);
      
      this.logMetrics("generation_success", params, standardResponse);
      
      return standardResponse;
      
    } catch (error) {
      const generationError = this.handleError(error, "generateImage");
      this.logMetrics("generation_error", params, undefined, generationError);
      throw generationError;
    }
  }
  
  /**
   * Convert standard parameters to Qwen Space API format
   */
  private convertParams(params: ImageGenerationParams): any {
    // Convert quality to inference steps (reduced for quota efficiency)
    const qualityToSteps = {
      fast: 10,   // Reduced from 20
      standard: 20, // Reduced from 35
      high: 30,   // Reduced from 50
      ultra: 40   // Reduced from 75
    };
    
    const inferenceSteps = qualityToSteps[params.quality || "standard"];
    
    // Use seed if provided, otherwise generate random
    const seed = params.seed || Math.floor(Math.random() * 1000000);
    
    return {
      prompt: params.prompt,
      seed: seed,
      randomize_seed: !params.seed, // Only randomize if no seed provided
      aspect_ratio: params.aspectRatio,
      guidance_scale: 4, // Qwen's default
      num_inference_steps: inferenceSteps,
      prompt_enhance: true // Enable Qwen's prompt enhancement
    };
  }
  
  /**
   * Convert Qwen Space API response to standard format
   */
  private async convertResponse(
    imageData: string, 
    params: ImageGenerationParams, 
    startTime: number,
    usedSeed?: number
  ): Promise<ImageGenerationResponse> {
    
    // Qwen generates images in various sizes based on aspect ratio
    const dimensions = this.getQwenDimensions(params.aspectRatio);
    
    return {
      imageData,
      mimeType: "image/jpeg",
      seed: usedSeed,
      provider: "qwen",
      cost: 0.00, // Free but quota limited
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
        spaceApi: true,
        guidanceScale: 4,
        inferenceSteps: this.convertQuality(params.quality || "standard"),
        promptEnhance: true
      }
    };
  }
  
  /**
   * Get dimensions for Qwen based on aspect ratio
   */
  private getQwenDimensions(aspectRatio: string): { width: number; height: number } {
    const ratioMap: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1024, height: 576 },
      "9:16": { width: 576, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 },
      "4:5": { width: 819, height: 1024 },
      "5:7": { width: 731, height: 1024 },
      "3:2": { width: 1024, height: 683 },
      "2:3": { width: 683, height: 1024 },
      "10:16": { width: 640, height: 1024 },
      "16:10": { width: 1024, height: 640 },
      "1:3": { width: 341, height: 1024 },
      "3:1": { width: 1024, height: 341 }
    };
    
    return ratioMap[aspectRatio] || ratioMap["1:1"];
  }
  
  /**
   * Convert quality to inference steps
   */
  protected convertQuality(quality: ImageQuality): number {
    const qualityMap = {
      fast: 20,
      standard: 35,
      high: 50,
      ultra: 75
    };
    
    return qualityMap[quality] || 35;
  }
  
  /**
   * Handle Qwen Space API specific errors
   */
  protected handleError(error: any, operation: string): ImageGenerationError {
    if (error && typeof error === 'object') {
      const message = error.message || '';
      
      // GPU quota exceeded (common with Space API)
      if (message.includes('quota') || message.includes('GPU quota exceeded')) {
        return new ImageGenerationError(
          `Qwen Space quota exceeded: ${message}`,
          ErrorCodes.QUOTA_EXCEEDED,
          "qwen",
          true // retryable
        );
      }
      
      // Space loading/busy
      if (message.includes('loading') || message.includes('busy')) {
        return new ImageGenerationError(
          `Qwen Space is loading: ${message}`,
          ErrorCodes.SERVICE_UNAVAILABLE,
          "qwen",
          true // retryable
        );
      }
      
      // Connection issues
      if (message.includes('connect') || message.includes('network')) {
        return new ImageGenerationError(
          `Qwen Space connection failed: ${message}`,
          ErrorCodes.SERVICE_UNAVAILABLE,
          "qwen",
          true // retryable
        );
      }
    }
    
    // Fall back to base error handling
    return super.handleError(error, operation);
  }
  
  /**
   * Health check specific to Qwen Space API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { Client } = await import("@gradio/client");
      const client = await Client.connect("Qwen/Qwen-Image");
      return true;
    } catch (error) {
      console.warn(`[QwenImage] Health check failed: ${error}`);
      return false;
    }
  }
}
