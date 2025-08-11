/**
 * Fal-AI Ideogram Provider
 * Implements image generation using Fal-AI's ideogram/v3 model
 */

import { fal } from "@fal-ai/client";
import { BaseImageProvider } from "./base";
import { 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ProviderType, 
  ProviderCapabilities,
  ImageGenerationError,
  AspectRatio,
  ImageQuality
} from "./types";

export class FalIdeogramProvider extends BaseImageProvider {
  constructor(config: any) {
    super(config);
    
    // Configure Fal-AI client with API key
    if (config.apiKey) {
      fal.config({ credentials: config.apiKey });
    }
  }
  
  getProviderType(): ProviderType {
    return "fal-ideogram";
  }

  /**
   * Convert aspect ratio to Ideogram format
   */
  protected convertAspectRatio(aspectRatio: AspectRatio): string {
    const ratioMap: Record<AspectRatio, string> = {
      "1:1": "square_hd",
      "16:9": "landscape_16_9",
      "9:16": "portrait_16_9",
      "4:3": "landscape_4_3",
      "3:4": "portrait_4_3",
      "4:5": "portrait_4_3", // Closest match
      "5:7": "portrait_4_3", // Closest match
      "3:2": "landscape_4_3", // Closest match
      "2:3": "portrait_4_3", // Closest match
      "10:16": "portrait_16_9", // Closest match
      "16:10": "landscape_16_9", // Closest match
      "1:3": "portrait_16_9", // Closest match
      "3:1": "landscape_16_9" // Closest match
    };
    
    return ratioMap[aspectRatio] || "square_hd";
  }

  /**
   * Map quality to rendering speed
   */
  private mapQualityToSpeed(quality: ImageQuality): "TURBO" | "BALANCED" | "QUALITY" {
    switch (quality) {
      case "fast":
        return "TURBO";
      case "standard":
        return "BALANCED";
      case "high":
      case "ultra":
        return "QUALITY";
      default:
        return "BALANCED";
    }
  }

  /**
   * Get optimized parameters based on aspect ratio
   */
  private getOptimizedParams(params: ImageGenerationParams): any {
    const isPortrait = params.aspectRatio === "9:16" || params.aspectRatio === "3:4" || params.aspectRatio === "2:3";
    
    // Base parameters
    const baseParams: any = {
      prompt: params.prompt,
      image_size: this.convertAspectRatio(params.aspectRatio),
      rendering_speed: params.providerOptions?.renderingSpeed || this.mapQualityToSpeed(params.quality || "standard"),
      expand_prompt: true,
      num_images: 1,
      sync_mode: false
    };

    // Add seed if provided
    if (params.seed !== undefined) {
      baseParams.seed = params.seed;
    }

    // Add negative prompt if provided
    if (params.providerOptions?.negativePrompt) {
      baseParams.negative_prompt = params.providerOptions.negativePrompt;
    }

    // Add style if provided
    if (params.providerOptions?.style) {
      baseParams.style = params.providerOptions.style;
    }

    // Add style codes if provided
    if (params.providerOptions?.styleCodes && Array.isArray(params.providerOptions.styleCodes)) {
      baseParams.style_codes = params.providerOptions.styleCodes;
    }

    // Add color palette if provided
    if (params.providerOptions?.colorPalette) {
      baseParams.color_palette = params.providerOptions.colorPalette;
    }

    // Add expand prompt setting if provided
    if (params.providerOptions?.expandPrompt !== undefined) {
      baseParams.expand_prompt = params.providerOptions.expandPrompt;
    }

    // Add custom image size if provided
    if (params.providerOptions?.customImageSize) {
      baseParams.image_size = params.providerOptions.customImageSize;
    }

    // Add number of images if provided
    if (params.providerOptions?.numImages) {
      baseParams.num_images = Math.min(params.providerOptions.numImages, 4); // Max 4 images
    }

    // Add sync mode if provided
    if (params.providerOptions?.syncMode !== undefined) {
      baseParams.sync_mode = params.providerOptions.syncMode;
    }

    // Add seed if provided
    if (params.providerOptions?.seed !== undefined) {
      baseParams.seed = params.providerOptions.seed;
    }

    return baseParams;
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      supportedAspectRatios: [
        "1:1", "16:9", "9:16", "4:3", "3:4", "4:5", "5:7", "3:2", "2:3", "10:16", "16:10", "1:3", "3:1"
      ],
      supportedQualities: ["fast", "standard", "high", "ultra"],
      maxPromptLength: 1000,
      supportsSeeds: true,
      supportsStyleImages: true,
      supportsImageEditing: false,
      rateLimits: {
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000
      },
      pricing: {
        costPerImage: 0.06, // $0.06 per image (BALANCED speed - default)
        currency: "USD"
      }
    };
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Validate parameters
      this.validateParams(params);
      
      // Get optimized parameters
      const ideogramParams = this.getOptimizedParams(params);
      
      console.log(`[FalIdeogramProvider] Generating image with prompt: ${params.prompt.substring(0, 100)}...`);
      console.log(`[FalIdeogramProvider] Parameters:`, ideogramParams);
      
      // Generate image using Fal-AI Ideogram
      const result = await fal.subscribe("fal-ai/ideogram/v3", {
        input: ideogramParams,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      const generationTime = Date.now() - startTime;
      
      // Convert response to standard format
      return await this.convertResponse(result, params, startTime);
      
    } catch (error) {
      console.error("[FalIdeogramProvider] Generation failed:", error);
      throw this.handleError(error, "image generation");
    }
  }

  private async convertResponse(
    result: any, 
    params: ImageGenerationParams, 
    startTime: number
  ): Promise<ImageGenerationResponse> {
    const generationTime = Date.now() - startTime;
    
    // Extract image data from result
    let imageData: string;
    let mimeType: string = "image/png";
    
    if (result.data && result.data.images && result.data.images.length > 0) {
      // Get the first image
      const image = result.data.images[0];
      
      if (typeof image === "string") {
        // Image is a URL
        imageData = image;
      } else if (image.url) {
        // Image has a URL property
        imageData = image.url;
      } else {
        throw new ImageGenerationError(
          "Invalid image data format in response",
          "GENERATION_FAILED",
          "fal-ideogram"
        );
      }
    } else {
      throw new ImageGenerationError(
        "No images found in response",
        "GENERATION_FAILED",
        "fal-ideogram"
      );
    }

    // Download image data if it's a URL
    let imageBuffer: Buffer;
    if (imageData.startsWith("http")) {
      const imageResponse = await fetch(imageData);
      if (!imageResponse.ok) {
        throw new ImageGenerationError(
          "Failed to download generated image",
          "GENERATION_FAILED",
          "fal-ideogram"
        );
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      // Assume it's base64 data
      imageBuffer = Buffer.from(imageData, "base64");
    }

    // Calculate dimensions
    const dimensions = this.calculateDimensions(params.aspectRatio);
    
    // Calculate cost based on rendering speed
    const renderingSpeed = params.providerOptions?.renderingSpeed || 'BALANCED';
    const cost = this.calculateCost(dimensions.width, dimensions.height, renderingSpeed);

    return {
      imageData: imageBuffer,
      mimeType,
      seed: result.data?.seed,
      provider: "fal-ideogram",
      cost,
      generationTime,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: params.aspectRatio,
        prompt: params.prompt,
        quality: params.quality || "standard"
      },
      providerData: {
        requestId: result.requestId,
        ideogramData: result.data
      }
    };
  }

  private calculateDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
    const ratioMap: Record<AspectRatio, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1024, height: 576 },
      "9:16": { width: 576, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 },
      "4:5": { width: 1024, height: 1280 },
      "5:7": { width: 1024, height: 1434 },
      "3:2": { width: 1024, height: 683 },
      "2:3": { width: 683, height: 1024 },
      "10:16": { width: 640, height: 1024 },
      "16:10": { width: 1024, height: 640 },
      "1:3": { width: 341, height: 1024 },
      "3:1": { width: 1024, height: 341 }
    };
    
    return ratioMap[aspectRatio] || { width: 1024, height: 1024 };
  }

  private calculateCost(width: number, height: number, renderingSpeed?: 'TURBO' | 'BALANCED' | 'QUALITY'): number {
    const megapixels = (width * height) / 1000000;
    
    // Dynamic cost based on rendering speed (from Fal-AI Ideogram playground)
    let costPerMegapixel: number;
    switch (renderingSpeed) {
      case 'TURBO':
        costPerMegapixel = 0.03;
        break;
      case 'BALANCED':
        costPerMegapixel = 0.06;
        break;
      case 'QUALITY':
        costPerMegapixel = 0.09;
        break;
      default:
        costPerMegapixel = 0.06; // Default to BALANCED
    }
    
    return megapixels * costPerMegapixel;
  }

  getCostEstimate(params: ImageGenerationParams): number {
    const dimensions = this.calculateDimensions(params.aspectRatio);
    const renderingSpeed = params.providerOptions?.renderingSpeed || 'BALANCED';
    return this.calculateCost(dimensions.width, dimensions.height, renderingSpeed);
  }

  async validateParams(params: ImageGenerationParams): Promise<void> {
    if (!params.prompt || params.prompt.trim() === "") {
      throw new ImageGenerationError(
        "Prompt is required",
        "INVALID_PARAMETERS",
        "fal-ideogram"
      );
    }

    if (params.prompt.length > 1000) {
      throw new ImageGenerationError(
        "Prompt is too long (max 1000 characters)",
        "PROMPT_TOO_LONG",
        "fal-ideogram"
      );
    }

    // Validate aspect ratio
    const supportedRatios = this.getCapabilities().supportedAspectRatios;
    if (!supportedRatios.includes(params.aspectRatio)) {
      throw new ImageGenerationError(
        `Unsupported aspect ratio: ${params.aspectRatio}`,
        "UNSUPPORTED_ASPECT_RATIO",
        "fal-ideogram"
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Try a simple API call to check if the service is available
      const result = await fal.subscribe("fal-ai/ideogram/v3", {
        input: {
          prompt: "test",
          image_size: "square_hd",
          rendering_speed: "TURBO",
          expand_prompt: false,
          num_images: 1,
          sync_mode: false
        },
        logs: false
      });
      
      return !!result.data;
    } catch (error) {
      console.error("[FalIdeogramProvider] Health check failed:", error);
      return false;
    }
  }

  protected handleError(error: any, operation: string): ImageGenerationError {
    console.error(`[FalIdeogramProvider] Error during ${operation}:`, error);
    
    if (error instanceof ImageGenerationError) {
      return error;
    }

    // Handle specific error types
    if (error.message?.includes("API key")) {
      return new ImageGenerationError(
        "Invalid API key for Fal-AI Ideogram",
        "INVALID_API_KEY",
        "fal-ideogram"
      );
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return new ImageGenerationError(
        "Quota exceeded for Fal-AI Ideogram",
        "QUOTA_EXCEEDED",
        "fal-ideogram"
      );
    }

    if (error.message?.includes("timeout")) {
      return new ImageGenerationError(
        "Request timeout for Fal-AI Ideogram",
        "TIMEOUT",
        "fal-ideogram",
        true
      );
    }

    return new ImageGenerationError(
      `Fal-AI Ideogram ${operation} failed: ${error.message || "Unknown error"}`,
      "GENERATION_FAILED",
      "fal-ideogram",
      false,
      error
    );
  }
}
