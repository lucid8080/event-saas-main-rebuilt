// Base interface and abstract class for image generation providers

import {
  ImageGenerationParams,
  ImageGenerationResponse,
  ProviderCapabilities,
  ProviderConfig,
  ProviderType,
  AspectRatio,
  ImageQuality,
  ImageGenerationError,
  ErrorCodes
} from "./types";

/**
 * Core interface that all image generation providers must implement
 */
export interface ImageGenerationProvider {
  /**
   * Generate an image based on the provided parameters
   */
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse>;
  
  /**
   * Get provider capabilities and limitations
   */
  getCapabilities(): ProviderCapabilities;
  
  /**
   * Get provider name/type
   */
  getProviderType(): ProviderType;
  
  /**
   * Check if the provider is healthy and available
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Validate parameters before generation
   */
  validateParams(params: ImageGenerationParams): Promise<void>;
  
  /**
   * Get estimated cost for generation
   */
  estimateCost(params: ImageGenerationParams): Promise<number>;
}

/**
 * Abstract base class that provides common functionality for all providers
 */
export abstract class BaseImageProvider implements ImageGenerationProvider {
  protected config: ProviderConfig;
  
  constructor(config: ProviderConfig) {
    this.config = config;
    
    if (!config.apiKey) {
      throw new ImageGenerationError(
        `API key is required for ${config.type} provider`,
        ErrorCodes.INVALID_API_KEY,
        config.type
      );
    }
  }
  
  // Abstract methods that must be implemented by concrete providers
  abstract generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse>;
  abstract getCapabilities(): ProviderCapabilities;
  abstract getProviderType(): ProviderType;
  
  /**
   * Default health check implementation
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try a minimal generation request
      await this.validateParams({
        prompt: "test",
        aspectRatio: "1:1",
        userId: "health-check"
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Common parameter validation
   */
  async validateParams(params: ImageGenerationParams): Promise<void> {
    const capabilities = this.getCapabilities();
    
    // Validate prompt
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new ImageGenerationError(
        "Prompt is required",
        ErrorCodes.INVALID_PARAMETERS,
        this.getProviderType()
      );
    }
    
    if (params.prompt.length > capabilities.maxPromptLength) {
      throw new ImageGenerationError(
        `Prompt too long. Maximum length is ${capabilities.maxPromptLength} characters`,
        ErrorCodes.PROMPT_TOO_LONG,
        this.getProviderType()
      );
    }
    
    // Validate aspect ratio
    if (!capabilities.supportedAspectRatios.includes(params.aspectRatio)) {
      throw new ImageGenerationError(
        `Unsupported aspect ratio: ${params.aspectRatio}. Supported ratios: ${capabilities.supportedAspectRatios.join(", ")}`,
        ErrorCodes.UNSUPPORTED_ASPECT_RATIO,
        this.getProviderType()
      );
    }
    
    // Validate quality
    if (params.quality && !capabilities.supportedQualities.includes(params.quality)) {
      throw new ImageGenerationError(
        `Unsupported quality: ${params.quality}. Supported qualities: ${capabilities.supportedQualities.join(", ")}`,
        ErrorCodes.INVALID_PARAMETERS,
        this.getProviderType()
      );
    }
    
    // Validate style images if provided
    if (params.styleReferenceImages && !capabilities.supportsStyleImages) {
      throw new ImageGenerationError(
        "Style reference images are not supported by this provider",
        ErrorCodes.INVALID_PARAMETERS,
        this.getProviderType()
      );
    }
    
    // Validate seed if provided
    if (params.seed !== undefined && !capabilities.supportsSeeds) {
      throw new ImageGenerationError(
        "Custom seeds are not supported by this provider",
        ErrorCodes.INVALID_PARAMETERS,
        this.getProviderType()
      );
    }
  }
  
  /**
   * Default cost estimation
   */
  async estimateCost(params: ImageGenerationParams): Promise<number> {
    const capabilities = this.getCapabilities();
    return capabilities.pricing.costPerImage;
  }
  
  /**
   * Convert standard aspect ratio to provider-specific format
   */
  protected convertAspectRatio(aspectRatio: AspectRatio): string {
    // Default implementation - can be overridden by providers
    return aspectRatio;
  }
  
  /**
   * Convert standard quality to provider-specific format
   */
  protected convertQuality(quality: ImageQuality = "standard"): any {
    // Default implementation - can be overridden by providers
    return quality;
  }
  
  /**
   * Handle and normalize errors from provider APIs
   */
  protected handleError(error: any, operation: string): ImageGenerationError {
    const providerType = this.getProviderType();
    
    // If it's already our error type, return as-is
    if (error instanceof ImageGenerationError) {
      return error;
    }
    
    // Handle common HTTP errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message || "Unknown error";
      
      switch (status) {
        case 401:
        case 403:
          return new ImageGenerationError(
            `Authentication failed: ${message}`,
            ErrorCodes.UNAUTHORIZED,
            providerType
          );
        case 429:
          return new ImageGenerationError(
            `Rate limit exceeded: ${message}`,
            ErrorCodes.RATE_LIMITED,
            providerType,
            true // retryable
          );
        case 503:
          return new ImageGenerationError(
            `Service unavailable: ${message}`,
            ErrorCodes.SERVICE_UNAVAILABLE,
            providerType,
            true // retryable
          );
        default:
          return new ImageGenerationError(
            `Provider error: ${message}`,
            ErrorCodes.GENERATION_FAILED,
            providerType
          );
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new ImageGenerationError(
        `Network error: ${error.message}`,
        ErrorCodes.NETWORK_ERROR,
        providerType,
        true // retryable
      );
    }
    
    // Handle timeout errors
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return new ImageGenerationError(
        `Request timeout: ${error.message}`,
        ErrorCodes.TIMEOUT,
        providerType,
        true // retryable
      );
    }
    
    // Default to unknown error
    return new ImageGenerationError(
      `Unknown error during ${operation}: ${error.message || error}`,
      ErrorCodes.UNKNOWN_ERROR,
      providerType,
      false,
      error
    );
  }
  
  /**
   * Log generation metrics and events
   */
  protected logMetrics(
    operation: string,
    params: ImageGenerationParams,
    response?: ImageGenerationResponse,
    error?: ImageGenerationError
  ): void {
    const logData = {
      provider: this.getProviderType(),
      operation,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      prompt: params.prompt.substring(0, 100), // Log first 100 chars
      aspectRatio: params.aspectRatio,
      quality: params.quality,
      success: !error,
      ...(response && {
        generationTime: response.generationTime,
        cost: response.cost,
        seed: response.seed
      }),
      ...(error && {
        errorCode: error.code,
        errorMessage: error.message
      })
    };
    
    console.log(`[${this.getProviderType().toUpperCase()}] ${operation}:`, logData);
  }
}
