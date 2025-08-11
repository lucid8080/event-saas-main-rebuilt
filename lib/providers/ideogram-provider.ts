// Ideogram API provider implementation

import { ImageGenerationProvider } from "./base";
import { 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ProviderType, 
  AspectRatio,
  ImageQuality,
  ProviderCapabilities,
  ProviderConfig,
  ImageGenerationError,
  ErrorCodes
} from "./types";

/**
 * Ideogram provider for image generation
 */
export class IdeogramProvider implements ImageGenerationProvider {
  private config: ProviderConfig;
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.ideogram.ai";
    
    if (!config.apiKey) {
      throw new ImageGenerationError(
        "Ideogram API key is required",
        ErrorCodes.INVALID_API_KEY,
        "ideogram"
      );
    }
  }

  getProviderType(): ProviderType {
    return "ideogram";
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    try {
      // Validate parameters
      this.validateParams(params);
      
      // Convert aspect ratio to Ideogram format
      const aspectRatio = this.convertAspectRatio(params.aspectRatio);
      
      // Map quality to rendering speed with aspect ratio compensation
      const renderingSpeed = this.mapQualityToSpeedWithCompensation(params.quality || "standard", params.aspectRatio);
      
      // Create FormData for Ideogram API
      const formData = new FormData();
      formData.append("prompt", params.prompt);
      formData.append("aspect_ratio", aspectRatio);
      formData.append("rendering_speed", renderingSpeed);
      
      // Add seed if provided and supported
      if (params.seed !== undefined) {
        formData.append("seed", params.seed.toString());
      }
      
      console.log(`[IdeogramProvider] Generating image with prompt: ${params.prompt.substring(0, 100)}...`);
      
      // Make API request
      const response = await fetch(`${this.baseUrl}/v1/ideogram-v3/generate`, {
        method: "POST",
        headers: {
          "Api-Key": this.config.apiKey
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw this.handleApiError(response.status, errorText);
      }

      const data = await response.json();
      const generationTime = Date.now() - startTime;
      
      // Extract image URL from response
      let imageUrl: string;
      if (data.data && data.data[0]?.url) {
        imageUrl = data.data[0].url;
      } else if (data.url) {
        imageUrl = data.url;
      } else {
        throw new ImageGenerationError(
          "Invalid response format from Ideogram API",
          ErrorCodes.GENERATION_FAILED,
          "ideogram"
        );
      }
      
      // Download image data
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new ImageGenerationError(
          "Failed to download generated image",
          ErrorCodes.NETWORK_ERROR,
          "ideogram",
          true
        );
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const mimeType = imageResponse.headers.get('content-type') || 'image/png';
      
      // Calculate dimensions from aspect ratio
      const dimensions = this.calculateDimensions(params.aspectRatio);
      
      return {
        imageData: Buffer.from(imageBuffer),
        mimeType,
        seed: params.seed,
        provider: "ideogram",
        cost: this.calculateCost(params),
        generationTime,
        metadata: {
          width: dimensions.width,
          height: dimensions.height,
          aspectRatio: params.aspectRatio,
          prompt: params.prompt,
          quality: params.quality || "standard"
        },
        providerData: {
          apiVersion: "v3",
          renderingSpeed,
          originalResponse: data
        }
      };
      
    } catch (error) {
      if (error instanceof ImageGenerationError) {
        throw error;
      }
      
      throw this.handleError(error, 'generateImage');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - just verify API key is valid
      const response = await fetch(`${this.baseUrl}/v1/health`, {
        method: "GET",
        headers: {
          "Api-Key": this.config.apiKey
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportedAspectRatios: [
        "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", 
        "10:16", "16:10", "1:3", "3:1"
      ],
      supportedQualities: ["fast", "standard", "high"],
      maxPromptLength: 2000,
      supportsSeeds: true,
      supportsStyleImages: true,
      supportsImageEditing: true,
      rateLimits: {
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000
      },
      pricing: {
        costPerImage: 0.08,
        currency: "USD",
        freeQuota: 25
      }
    };
  }

  async estimateCost(params: ImageGenerationParams): Promise<number> {
    return this.calculateCost(params);
  }

  async validateParams(params: ImageGenerationParams): Promise<void> {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new ImageGenerationError(
        "Prompt is required",
        ErrorCodes.INVALID_PARAMETERS,
        "ideogram"
      );
    }

    if (params.prompt.length > this.getCapabilities().maxPromptLength) {
      throw new ImageGenerationError(
        `Prompt too long. Maximum length is ${this.getCapabilities().maxPromptLength} characters`,
        ErrorCodes.PROMPT_TOO_LONG,
        "ideogram"
      );
    }

    const capabilities = this.getCapabilities();
    if (!capabilities.supportedAspectRatios.includes(params.aspectRatio)) {
      throw new ImageGenerationError(
        `Unsupported aspect ratio: ${params.aspectRatio}`,
        ErrorCodes.UNSUPPORTED_ASPECT_RATIO,
        "ideogram"
      );
    }
  }

  private convertAspectRatio(aspectRatio: AspectRatio): string {
    // Ideogram uses "x" format instead of ":"
    return aspectRatio.replace(':', 'x');
  }

  private mapQualityToSpeed(quality: ImageQuality): string {
    switch (quality) {
      case "fast":
        return "TURBO";
      case "standard":
        return "BALANCED";
      case "high":
        return "QUALITY";
      case "ultra":
        return "QUALITY";
      default:
        return "BALANCED";
    }
  }

  private mapQualityToSpeedWithCompensation(quality: ImageQuality, aspectRatio: AspectRatio): string {
    // Base quality mapping
    const baseSpeed = this.mapQualityToSpeed(quality);
    
    // Quality compensation for portrait aspect ratios that tend to appear blurrier
    // For Ideogram, we upgrade the rendering speed for portrait ratios
    const needsCompensation = aspectRatio === "9:16" || aspectRatio === "3:4" || aspectRatio === "2:3" || aspectRatio === "5:7";
    
    if (needsCompensation) {
      // Upgrade rendering speed for portrait ratios
      switch (baseSpeed) {
        case "TURBO":
          console.log(`[IdeogramProvider] Quality compensation: Upgrading ${aspectRatio} from TURBO to BALANCED`);
          return "BALANCED";
        case "BALANCED":
          console.log(`[IdeogramProvider] Quality compensation: Upgrading ${aspectRatio} from BALANCED to QUALITY`);
          return "QUALITY";
        case "QUALITY":
          console.log(`[IdeogramProvider] Quality compensation: ${aspectRatio} already at QUALITY (no upgrade available)`);
          return "QUALITY";
        default:
          return baseSpeed;
      }
    }
    
    console.log(`[IdeogramProvider] No quality compensation needed for ${aspectRatio}, using ${baseSpeed}`);
    return baseSpeed;
  }

  private calculateDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
    // Normalized dimensions targeting ~1.75 MP for consistent quality across all aspect ratios
    // All dimensions are divisible by 8 for optimal AI model compatibility
    const dimensionMap: Record<AspectRatio, { width: number; height: number }> = {
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

    return dimensionMap[aspectRatio] || { width: 1320, height: 1320 };
  }

  private calculateCost(params: ImageGenerationParams): number {
    const baseCost = this.getCapabilities().pricing.costPerImage;
    
    // Adjust cost based on quality
    const qualityMultiplier = {
      fast: 0.8,
      standard: 1.0,
      high: 1.5,
      ultra: 2.0
    }[params.quality || "standard"];
    
    return baseCost * qualityMultiplier;
  }

  private handleApiError(status: number, errorText: string): ImageGenerationError {
    switch (status) {
      case 401:
        return new ImageGenerationError(
          "Invalid Ideogram API key",
          ErrorCodes.INVALID_API_KEY,
          "ideogram"
        );
      case 402:
        return new ImageGenerationError(
          "Insufficient credits in Ideogram account",
          ErrorCodes.QUOTA_EXCEEDED,
          "ideogram"
        );
      case 429:
        return new ImageGenerationError(
          "Rate limit exceeded for Ideogram API",
          ErrorCodes.RATE_LIMITED,
          "ideogram",
          true
        );
      case 503:
        return new ImageGenerationError(
          "Ideogram service temporarily unavailable",
          ErrorCodes.SERVICE_UNAVAILABLE,
          "ideogram",
          true
        );
      default:
        return new ImageGenerationError(
          `Ideogram API error (${status}): ${errorText}`,
          ErrorCodes.GENERATION_FAILED,
          "ideogram",
          status >= 500
        );
    }
  }

  private handleError(error: any, operation: string): ImageGenerationError {
    if (error instanceof ImageGenerationError) {
      return error;
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ImageGenerationError(
        "Network error connecting to Ideogram API",
        ErrorCodes.NETWORK_ERROR,
        "ideogram",
        true,
        error
      );
    }

    // Handle timeout errors
    if (error.name === 'AbortError') {
      return new ImageGenerationError(
        "Request to Ideogram API timed out",
        ErrorCodes.TIMEOUT,
        "ideogram",
        true,
        error
      );
    }

    // Generic error
    return new ImageGenerationError(
      `Unknown error in ${operation}: ${error.message}`,
      ErrorCodes.UNKNOWN_ERROR,
      "ideogram",
      false,
      error
    );
  }
}
