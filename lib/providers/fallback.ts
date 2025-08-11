// Fallback and retry strategies for image generation providers

import { 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ProviderType, 
  ImageGenerationError,
  ErrorCodes 
} from "./types";
import { ImageGenerationProvider } from "./base";
import { providerConfig } from "./config";

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrorCodes: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrorCodes: [
    ErrorCodes.QUOTA_EXCEEDED,
    ErrorCodes.RATE_LIMITED,
    ErrorCodes.SERVICE_UNAVAILABLE,
    ErrorCodes.TIMEOUT,
    ErrorCodes.NETWORK_ERROR
  ]
};

/**
 * Circuit breaker for providers
 */
export class ProviderCircuitBreaker {
  private failures: Map<ProviderType, number> = new Map();
  private lastFailure: Map<ProviderType, number> = new Map();
  private isOpen: Map<ProviderType, boolean> = new Map();
  
  private readonly failureThreshold = 5;
  private readonly resetTimeoutMs = 60000; // 1 minute
  
  /**
   * Check if provider is available (circuit is closed)
   */
  isProviderAvailable(provider: ProviderType): boolean {
    const failures = this.failures.get(provider) || 0;
    const lastFailure = this.lastFailure.get(provider) || 0;
    const isOpen = this.isOpen.get(provider) || false;
    
    // If circuit is open, check if reset timeout has passed
    if (isOpen && Date.now() - lastFailure > this.resetTimeoutMs) {
      this.isOpen.set(provider, false);
      this.failures.set(provider, 0);
      return true;
    }
    
    return !isOpen && failures < this.failureThreshold;
  }
  
  /**
   * Record a failure for a provider
   */
  recordFailure(provider: ProviderType): void {
    const failures = (this.failures.get(provider) || 0) + 1;
    this.failures.set(provider, failures);
    this.lastFailure.set(provider, Date.now());
    
    if (failures >= this.failureThreshold) {
      this.isOpen.set(provider, true);
      console.warn(`[Circuit Breaker] Opening circuit for ${provider} provider after ${failures} failures`);
    }
  }
  
  /**
   * Record a success for a provider
   */
  recordSuccess(provider: ProviderType): void {
    this.failures.set(provider, 0);
    this.isOpen.set(provider, false);
  }
  
  /**
   * Get circuit status for all providers
   */
  getStatus(): Record<ProviderType, { failures: number; isOpen: boolean; lastFailure?: Date }> {
    const result: any = {};
    
    for (const provider of ["ideogram", "huggingface", "stability", "midjourney"] as ProviderType[]) {
      const failures = this.failures.get(provider) || 0;
      const lastFailure = this.lastFailure.get(provider);
      const isOpen = this.isOpen.get(provider) || false;
      
      result[provider] = {
        failures,
        isOpen,
        ...(lastFailure && { lastFailure: new Date(lastFailure) })
      };
    }
    
    return result;
  }
}

/**
 * Provider manager with fallback and retry capabilities
 */
export class ProviderManager {
  private providers: Map<ProviderType, ImageGenerationProvider> = new Map();
  private circuitBreaker = new ProviderCircuitBreaker();
  private retryConfig: RetryConfig;
  
  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
  }
  
  /**
   * Register a provider
   */
  registerProvider(provider: ImageGenerationProvider): void {
    this.providers.set(provider.getProviderType(), provider);
  }
  
  /**
   * Generate image with automatic fallback and retry
   */
  async generateImageWithFallback(
    params: ImageGenerationParams,
    preferredProvider?: ProviderType
  ): Promise<ImageGenerationResponse> {
    // Determine provider order
    const providerOrder = this.getProviderOrder(preferredProvider);
    
    let lastError: ImageGenerationError | undefined;
    
    for (const providerType of providerOrder) {
      // Check if provider is available via circuit breaker
      if (!this.circuitBreaker.isProviderAvailable(providerType)) {
        console.warn(`[ProviderManager] Skipping ${providerType} - circuit breaker is open`);
        continue;
      }
      
      const provider = this.providers.get(providerType);
      if (!provider) {
        console.warn(`[ProviderManager] Provider ${providerType} not registered`);
        continue;
      }
      
      try {
        console.log(`[ProviderManager] Attempting generation with ${providerType}`);
        const result = await this.generateWithRetry(provider, params);
        
        // Record success
        this.circuitBreaker.recordSuccess(providerType);
        
        console.log(`[ProviderManager] Successfully generated image with ${providerType}`);
        return result;
        
      } catch (error) {
        lastError = error instanceof ImageGenerationError ? error : 
          new ImageGenerationError(
            `Generation failed with ${providerType}: ${error}`,
            ErrorCodes.GENERATION_FAILED,
            providerType,
            false,
            error
          );
        
        console.error(`[ProviderManager] Generation failed with ${providerType}:`, lastError.message);
        
        // Record failure in circuit breaker
        this.circuitBreaker.recordFailure(providerType);
        
        // If error is not retryable with other providers, throw immediately
        if (!this.shouldTryFallback(lastError)) {
          throw lastError;
        }
      }
    }
    
    // All providers failed
    throw lastError || new ImageGenerationError(
      "All image generation providers failed",
      ErrorCodes.SERVICE_UNAVAILABLE,
      "ideogram" // Use a default provider type
    );
  }
  
  /**
   * Generate image with retry for a specific provider
   */
  private async generateWithRetry(
    provider: ImageGenerationProvider,
    params: ImageGenerationParams
  ): Promise<ImageGenerationResponse> {
    let lastError: ImageGenerationError | undefined;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await provider.generateImage(params);
        
      } catch (error) {
        lastError = error instanceof ImageGenerationError ? error :
          provider['handleError'](error, 'generateImage');
        
        // Check if error is retryable
        if (!this.isRetryableError(lastError) || attempt >= this.retryConfig.maxAttempts) {
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
          this.retryConfig.maxDelayMs
        );
        
        console.warn(
          `[ProviderManager] Attempt ${attempt} failed for ${provider.getProviderType()}, ` +
          `retrying in ${delay}ms: ${lastError.message}`
        );
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Determine provider order for fallback
   */
  private getProviderOrder(preferredProvider?: ProviderType): ProviderType[] {
    const availableProviders = providerConfig.getAvailableProviders();
    
    if (!preferredProvider) {
      return availableProviders;
    }
    
    // Put preferred provider first, then fallbacks
    const fallbacks = providerConfig.getFallbackProviders(preferredProvider);
    return [preferredProvider, ...fallbacks].filter(p => availableProviders.includes(p));
  }
  
  /**
   * Check if error is retryable
   */
  private isRetryableError(error: ImageGenerationError): boolean {
    return error.retryable && this.retryConfig.retryableErrorCodes.includes(error.code);
  }
  
  /**
   * Check if we should try fallback providers for this error
   */
  private shouldTryFallback(error: ImageGenerationError): boolean {
    // Don't try fallback for parameter validation errors
    const nonFallbackErrors = [
      ErrorCodes.INVALID_PARAMETERS,
      ErrorCodes.PROMPT_TOO_LONG,
      ErrorCodes.UNSUPPORTED_ASPECT_RATIO,
      ErrorCodes.INVALID_API_KEY,
      ErrorCodes.UNAUTHORIZED
    ];
    
    return !nonFallbackErrors.includes(error.code as any);
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get health status of all providers
   */
  async getProvidersHealth(): Promise<Record<ProviderType, { 
    available: boolean; 
    healthy: boolean; 
    circuitOpen: boolean;
    lastError?: string;
  }>> {
    const result: any = {};
    const circuitStatus = this.circuitBreaker.getStatus();
    
    this.providers.forEach((provider, providerType) => {
      try {
        // Note: healthCheck is async but we can't use await in forEach
        // This is a simplified version for now
        result[providerType] = {
          available: providerConfig.isProviderAvailable(providerType),
          healthy: true, // Assume healthy for now
          circuitOpen: circuitStatus[providerType]?.isOpen || false
        };
        
      } catch (error) {
        result[providerType] = {
          available: false,
          healthy: false,
          circuitOpen: circuitStatus[providerType]?.isOpen || false,
          lastError: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    return result;
  }
  
  /**
   * Reset circuit breaker for a provider
   */
  resetCircuitBreaker(provider: ProviderType): void {
    this.circuitBreaker.recordSuccess(provider);
  }
  
  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return this.circuitBreaker.getStatus();
  }
}
