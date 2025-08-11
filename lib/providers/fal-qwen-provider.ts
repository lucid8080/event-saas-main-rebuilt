/**
 * Fal-AI Qwen-Image Provider
 * Implements image generation using Fal-AI's qwen-image model
 */

import { fal } from "@fal-ai/client";
import { BaseImageProvider } from "./base";
import { 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ProviderType, 
  ProviderCapabilities,
  ImageGenerationError
} from "./types";

export class FalQwenProvider extends BaseImageProvider {
  constructor(config: any) {
    super(config);
    
    // Configure Fal-AI client with API key
    if (config.apiKey) {
      fal.config({ credentials: config.apiKey });
    }
  }
  
  getProviderType(): ProviderType {
    return "fal-qwen";
  }

  /**
   * Enhance prompt for better quality, especially for portrait ratios
   */
  private enhancePromptForQuality(originalPrompt: string, aspectRatio: string): string {
    const isPortrait = aspectRatio === "9:16" || aspectRatio === "3:4" || aspectRatio === "2:3" || aspectRatio === "5:7";
    
    if (isPortrait) {
      // Add quality-enhancing keywords for portrait images
      const qualityEnhancements = [
        "highly detailed",
        "sharp focus", 
        "professional photography",
        "high resolution",
        "crisp details"
      ];
      
      // Add negative prompts to avoid blur
      const negativePrompts = [
        "blurry",
        "out of focus", 
        "low quality",
        "pixelated",
        "distorted"
      ];
      
      let enhanced = originalPrompt;
      
      // Add quality keywords if not already present
      qualityEnhancements.forEach(keyword => {
        if (!enhanced.toLowerCase().includes(keyword.toLowerCase())) {
          enhanced = `${enhanced}, ${keyword}`;
        }
      });
      
      console.log(`[FalQwenProvider] Enhanced prompt for ${aspectRatio} with quality keywords`);
      return enhanced;
    }
    
    return originalPrompt;
  }

  /**
   * Get optimized guidance scale based on aspect ratio
   */
  private getOptimizedGuidanceScale(aspectRatio: string): number {
    const isPortrait = aspectRatio === "9:16" || aspectRatio === "3:4" || aspectRatio === "2:3" || aspectRatio === "5:7";
    
    if (isPortrait) {
      // Higher guidance scale for portrait ratios to improve detail adherence
      console.log(`[FalQwenProvider] Using optimized guidance scale 4.5 for ${aspectRatio} (vs default 3.0)`);
      return 4.5;
    }
    
    // Default guidance scale for other ratios
    return 3.0;
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportsSeeds: true,
      supportsMultipleImages: true,
      supportsSafetyChecker: true,
      supportsNegativePrompts: false,
      supportsStylePresets: false,
      maxConcurrentRequests: 3,
      averageResponseTime: 15000, // 15 seconds average
      supportedQualities: ["fast", "standard", "high", "ultra"],
      supportedAspectRatios: [
        "1:1", "16:9", "9:16", "4:3", "3:4", "4:5", "5:7", "3:2", "2:3"
      ],
      costEstimate: {
        basePrice: 0.05, // $0.05 per megapixel
        currency: "USD",
        freeQuota: 0
      }
    };
  }
  
  /**
   * Generate image using Fal-AI qwen-image model
   */
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Convert our parameters to Fal-AI format
      const falParams = this.convertParams(params);
      
      console.log('[FalQwen] Generating image with parameters:', {
        prompt: falParams.prompt.substring(0, 100) + '...',
        image_size: falParams.image_size,
        num_inference_steps: falParams.num_inference_steps,
        guidance_scale: falParams.guidance_scale,
        num_images: falParams.num_images
      });
      
      // Generate image using Fal-AI subscribe API
      const result = await fal.subscribe("fal-ai/qwen-image", {
        input: falParams,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log('[FalQwen] Generation in progress:', 
              update.logs?.map(log => log.message).join(', ') || 'Processing...'
            );
          }
        },
      });
      
      console.log('[FalQwen] Generation completed:', {
        images: result.data?.images?.length || 0,
        timings: result.data?.timings
      });
      
      return this.convertResponse(result.data, params, startTime);
      
    } catch (error: any) {
      console.error('[FalQwen] Generation failed:', error);
      
      const generationError = new ImageGenerationError(
        `Fal-AI generation failed: ${error.message || 'Unknown error'}`,
        error.code || 'FAL_GENERATION_ERROR',
        "fal-qwen",
        true, // Most Fal-AI errors are retryable
        error
      );
      
      throw generationError;
    }
  }
  
  /**
   * Convert standard parameters to Fal-AI qwen-image format
   */
  private convertParams(params: ImageGenerationParams): any {
    // Convert quality to inference steps with aspect ratio compensation
    const baseQualityToSteps = {
      fast: 15,     // Faster generation
      standard: 25, // Default quality
      high: 35,     // Higher quality
      ultra: 50     // Maximum quality
    };
    
    // Convert aspect ratio to Fal-AI image size
    // Use proper aspect ratio sizes but with enhanced quality compensation
    const aspectRatioToImageSize = {
      "1:1": "square_hd",
      "16:9": "landscape_16_9", 
      "9:16": "portrait_16_9",
      "4:3": "landscape_4_3",
      "3:4": "portrait_4_3",
      "4:5": "portrait_4_3",   // Closest available: 3:4 is similar to 4:5
      "5:7": "portrait_16_9",  // Closest available: 9:16 is similar to 5:7
      "3:2": "landscape_4_3",  // Fallback to closest
      "2:3": "portrait_4_3"    // Fallback to closest
    };
    
    // Quality compensation for lower resolution aspect ratios
    // Fal-AI's predefined sizes provide lower resolution, so we increase inference steps
    const aspectRatioCompensation = {
      "1:1": 1.0,     // square_hd is typically highest quality
      "16:9": 1.3,    // landscape_16_9 needs moderate boost
      "9:16": 1.5,    // portrait_16_9 needs significant boost for sharpness
      "4:3": 1.2,     // landscape_4_3 needs slight boost
      "3:4": 1.3,     // portrait_4_3 needs moderate boost
      "4:5": 1.3,     // Uses portrait_4_3
      "5:7": 1.5,     // Uses portrait_16_9 
      "3:2": 1.2,     // Uses landscape_4_3
      "2:3": 1.3      // Uses portrait_4_3
    };
    
    const baseSteps = baseQualityToSteps[params.quality || "standard"];
    const compensation = aspectRatioCompensation[params.aspectRatio as keyof typeof aspectRatioCompensation] || 1.0;
    const inferenceSteps = Math.min(Math.round(baseSteps * compensation), 50); // Cap at 50 steps
    
    const imageSize = aspectRatioToImageSize[params.aspectRatio as keyof typeof aspectRatioToImageSize] || "square_hd";
    
    console.log(`[FalQwenProvider] Converting aspect ratio "${params.aspectRatio}" to Fal-AI image size: "${imageSize}"`);
    console.log(`[FalQwenProvider] Quality compensation: ${baseSteps} base steps × ${compensation} = ${inferenceSteps} final steps`);
    
    // Enhanced prompt for better quality and sharpness
    const enhancedPrompt = this.enhancePromptForQuality(params.prompt, params.aspectRatio);
    
    // Optimized guidance scale for portrait ratios
    const optimizedGuidanceScale = this.getOptimizedGuidanceScale(params.aspectRatio);
    
    // Build Fal-AI compatible parameters
    const falParams: any = {
      prompt: enhancedPrompt,
      image_size: imageSize,
      num_inference_steps: inferenceSteps,
      guidance_scale: optimizedGuidanceScale,
      num_images: 1,       // Start with single image
      enable_safety_checker: true,
      sync_mode: false     // Use async mode for better performance
    };
    
    // Add seed if provided
    if (params.seed) {
      falParams.seed = parseInt(params.seed.toString());
    }
    
    // Override with provider-specific options if provided
    if (params.providerOptions) {
      // Apply any Fal-AI specific overrides
      if (params.providerOptions.numInferenceSteps) {
        falParams.num_inference_steps = Math.min(Math.max(params.providerOptions.numInferenceSteps, 1), 50);
      }
      if (params.providerOptions.guidanceScale !== undefined) {
        falParams.guidance_scale = Math.min(Math.max(params.providerOptions.guidanceScale, 0.0), 20.0);
      }
      if (params.providerOptions.numImages) {
        falParams.num_images = Math.min(Math.max(params.providerOptions.numImages, 1), 4);
      }
      if (params.providerOptions.enableSafetyChecker !== undefined) {
        falParams.enable_safety_checker = params.providerOptions.enableSafetyChecker;
      }
      if (params.providerOptions.syncMode !== undefined) {
        falParams.sync_mode = params.providerOptions.syncMode;
      }
    }
    
    console.log(`[FalQwen] Converted parameters - Size: ${imageSize}, Steps: ${inferenceSteps}, Guidance: ${falParams.guidance_scale}`);
    
    return falParams;
  }
  
  /**
   * Convert Fal-AI response to standard format
   */
  private async convertResponse(
    data: any, 
    params: ImageGenerationParams, 
    startTime: number
  ): Promise<ImageGenerationResponse> {
    
    if (!data || !data.images || !data.images.length) {
      throw new Error("No images generated from Fal-AI");
    }
    
    const responseTime = Date.now() - startTime;
    
    // Get the first image (Fal-AI returns array of images)
    const image = data.images[0];
    
    // Calculate cost based on image size
    // Fal-AI charges $0.05 per megapixel
    const cost = this.calculateCost(image.width || 1024, image.height || 1024);
    
    return {
      imageData: image.url, // Fal-AI returns URL - will be downloaded by caller
      mimeType: "image/png", // Fal-AI typically returns PNG
      seed: data.seed?.toString() || params.seed?.toString(),
      provider: "fal-qwen",
      aspectRatio: params.aspectRatio,
      generationTime: responseTime,
      cost,
      metadata: {
        provider: "fal-qwen",
        model: "qwen-image",
        inferenceSteps: data.num_inference_steps || 25,
        guidanceScale: data.guidance_scale || 3.0,
        imageSize: data.image_size,
        width: image.width,
        height: image.height,
        safetyChecked: data.enable_safety_checker !== false,
        timings: data.timings,
        // Additional Fal-AI specific metadata
        falRequestId: data.request_id,
        falModel: "fal-ai/qwen-image"
      }
    };
  }
  
  /**
   * Calculate cost based on image dimensions
   * Fal-AI charges $0.05 per megapixel
   */
  private calculateCost(width: number, height: number): number {
    const megapixels = (width * height) / 1_000_000;
    const costPerMegapixel = 0.05; // $0.05 per megapixel
    return Math.round(megapixels * costPerMegapixel * 10000) / 10000; // Round to 4 decimal places
  }
  
  /**
   * Get cost estimate for generation
   */
  getCostEstimate(params: ImageGenerationParams): number {
    // Default HD sizes for different aspect ratios
    const sizeMap = {
      "1:1": [1024, 1024],
      "16:9": [1344, 768],
      "9:16": [768, 1344],
      "4:3": [1152, 896],
      "3:4": [896, 1152],
      "3:2": [1216, 832],
      "2:3": [832, 1216]
    };
    
    const [width, height] = sizeMap[params.aspectRatio as keyof typeof sizeMap] || [1024, 1024];
    return this.calculateCost(width, height);
  }
  
  /**
   * Validate parameters for Fal-AI qwen-image
   */
  validateParams(params: ImageGenerationParams): void {
    super.validateParams(params);
    
    // Fal-AI specific validations
    if (params.providerOptions) {
      // Validate inference steps range (1-50)
      if (params.providerOptions.numInferenceSteps !== undefined) {
        const steps = params.providerOptions.numInferenceSteps;
        if (typeof steps !== 'number' || steps < 1 || steps > 50) {
          throw new Error("Fal-AI inference steps must be between 1 and 50");
        }
      }
      
      // Validate guidance scale range (0.0-20.0)
      if (params.providerOptions.guidanceScale !== undefined) {
        const scale = params.providerOptions.guidanceScale;
        if (typeof scale !== 'number' || scale < 0.0 || scale > 20.0) {
          throw new Error("Fal-AI guidance scale must be between 0.0 and 20.0");
        }
      }
      
      // Validate number of images (1-4)
      if (params.providerOptions.numImages !== undefined) {
        const numImages = params.providerOptions.numImages;
        if (typeof numImages !== 'number' || numImages < 1 || numImages > 4) {
          throw new Error("Fal-AI supports 1-4 images per generation");
        }
      }
    }
  }
  
  /**
   * Health check for Fal-AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple test generation to check if service is available
      const testResult = await fal.subscribe("fal-ai/qwen-image", {
        input: {
          prompt: "test",
          image_size: "square",
          num_inference_steps: 1,
          num_images: 1
        },
        timeout: 30000 // 30 second timeout
      });
      
      return !!(testResult && testResult.data);
    } catch (error) {
      console.error('[FalQwen] Health check failed:', error);
      return false;
    }
  }
}
