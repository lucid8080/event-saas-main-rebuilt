// Main provider factory and exports for image generation API abstraction layer

import { ImageGenerationProvider } from "./base";
import { HuggingFaceInferenceProvider } from "./huggingface-inference";
import { QwenInferenceProvider } from "./qwen-inference";
import { IdeogramProvider } from "./ideogram-provider";
import { FalQwenProvider } from "./fal-qwen-provider";
import { FalIdeogramProvider } from "./fal-ideogram-provider";
import { ProviderManager } from "./fallback";
import { providerConfig } from "./config";
import { 
  ProviderType, 
  ImageGenerationParams, 
  ImageGenerationResponse, 
  ImageGenerationError,
  ErrorCodes
} from "./types";

// Re-export types for easy importing
export * from "./types";
export * from "./base";
export * from "./config";
export * from "./fallback";
export { HuggingFaceInferenceProvider } from "./huggingface-inference";

/**
 * Provider factory for creating image generation providers
 */
export class ProviderFactory {
  private static instance: ProviderFactory;
  private providers: Map<ProviderType, ImageGenerationProvider> = new Map();
  private manager: ProviderManager;
  
  private constructor() {
    this.manager = new ProviderManager();
    this.initializeProviders();
  }
  
  /**
   * Reload providers (useful when environment variables change)
   */
  reloadProviders(): void {
    // Clear existing providers
    this.providers.clear();
    
    // Reload configurations
    providerConfig.reloadConfigurations();
    
    // Reinitialize providers
    this.initializeProviders();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  /**
   * Ensure providers are properly initialized
   */
  ensureInitialized(): void {
    // Check if we have all expected providers
    const expectedProviders = ['fal-ideogram', 'fal-qwen', 'ideogram', 'qwen', 'huggingface'];
    const missingProviders = expectedProviders.filter(provider => !this.providers.has(provider as any));
    
    if (missingProviders.length > 0) {
      console.log(`[ProviderFactory] Missing providers: ${missingProviders.join(', ')}, reinitializing...`);
      this.reloadProviders();
    }
  }
  
  /**
   * Initialize available providers
   */
  private initializeProviders(): void {
    // Initialize Fal-AI Qwen provider (NEW - High Priority)
    const falQwenConfig = providerConfig.getProviderConfig("fal-qwen");
    if (falQwenConfig && falQwenConfig.enabled) {
      try {
        const falQwenProvider = new FalQwenProvider(falQwenConfig);
        this.providers.set("fal-qwen", falQwenProvider);
        this.manager.registerProvider(falQwenProvider);
        console.log("[ProviderFactory] Initialized Fal-AI Qwen provider (NEW - $0.05/megapixel)");
      } catch (error) {
        console.error("[ProviderFactory] Failed to initialize Fal-AI Qwen provider:", error);
      }
    }

    // Initialize Fal-AI Ideogram provider (NEW - Highest Priority)
    const falIdeogramConfig = providerConfig.getProviderConfig("fal-ideogram");
    if (falIdeogramConfig && falIdeogramConfig.enabled) {
      try {
        const falIdeogramProvider = new FalIdeogramProvider(falIdeogramConfig);
        this.providers.set("fal-ideogram", falIdeogramProvider);
        this.manager.registerProvider(falIdeogramProvider);
        console.log("[ProviderFactory] Initialized Fal-AI Ideogram provider (NEW - $0.08/megapixel)");
      } catch (error) {
        console.error("[ProviderFactory] Failed to initialize Fal-AI Ideogram provider:", error);
      }
    }

    // Initialize Qwen provider (Inference Provider - bypasses quota limits)
    const qwenConfig = providerConfig.getProviderConfig("qwen");
    if (qwenConfig && qwenConfig.enabled) {
      try {
        const qwenProvider = new QwenInferenceProvider(qwenConfig);
        this.providers.set("qwen", qwenProvider);
        this.manager.registerProvider(qwenProvider);
        console.log("[ProviderFactory] Initialized Qwen-Image provider (Inference Provider - Real Qwen!)");
      } catch (error) {
        console.error("[ProviderFactory] Failed to initialize Qwen provider:", error);
      }
    }

    // Initialize Hugging Face provider (using Inference API for fallback)
    const hfConfig = providerConfig.getProviderConfig("huggingface");
    if (hfConfig && hfConfig.enabled) {
      try {
        // Use Inference API provider for better Pro plan support
        const hfProvider = new HuggingFaceInferenceProvider(hfConfig);
        this.providers.set("huggingface", hfProvider);
        this.manager.registerProvider(hfProvider);
        console.log("[ProviderFactory] Initialized Hugging Face Inference provider (Pro plan fallback)");
      } catch (error) {
        console.error("[ProviderFactory] Failed to initialize Hugging Face provider:", error);
      }
    }
    
    // Initialize Ideogram provider
    const ideogramConfig = providerConfig.getProviderConfig("ideogram");
    if (ideogramConfig && ideogramConfig.enabled) {
      try {
        const ideogramProvider = new IdeogramProvider(ideogramConfig);
        this.providers.set("ideogram", ideogramProvider);
        this.manager.registerProvider(ideogramProvider);
        console.log("[ProviderFactory] Initialized Ideogram provider (Premium image generation)");
      } catch (error) {
        console.error("[ProviderFactory] Failed to initialize Ideogram provider:", error);
      }
    }
    
    // TODO: Initialize other providers (Stability AI, etc.) when implemented
  }
  
  /**
   * Get a specific provider
   */
  getProvider(providerType: ProviderType): ImageGenerationProvider {
    // Ensure providers are initialized
    this.ensureInitialized();
    
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new ImageGenerationError(
        `Provider ${providerType} is not available`,
        ErrorCodes.SERVICE_UNAVAILABLE,
        providerType
      );
    }
    return provider;
  }
  
  /**
   * Get the default provider
   */
  getDefaultProvider(): ImageGenerationProvider {
    // Ensure providers are initialized
    this.ensureInitialized();
    
    const defaultType = providerConfig.getDefaultProvider();
    return this.getProvider(defaultType);
  }
  
  /**
   * Generate image with automatic fallback
   */
  async generateImage(
    params: ImageGenerationParams, 
    preferredProvider?: ProviderType
  ): Promise<ImageGenerationResponse> {
    return this.manager.generateImageWithFallback(params, preferredProvider);
  }
  
  /**
   * Get available providers
   */
  getAvailableProviders(): ProviderType[] {
    // Ensure providers are initialized
    this.ensureInitialized();
    
    return Array.from(this.providers.keys());
  }
  
  /**
   * Get provider health status
   */
  async getProvidersHealth() {
    return this.manager.getProvidersHealth();
  }
  
  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return this.manager.getCircuitBreakerStatus();
  }
  
  /**
   * Reset circuit breaker for a provider
   */
  resetCircuitBreaker(provider: ProviderType): void {
    this.manager.resetCircuitBreaker(provider);
  }
  
  /**
   * Add a new provider at runtime
   */
  addProvider(provider: ImageGenerationProvider): void {
    this.providers.set(provider.getProviderType(), provider);
    this.manager.registerProvider(provider);
  }
  
  /**
   * Remove a provider
   */
  removeProvider(providerType: ProviderType): void {
    this.providers.delete(providerType);
    // Note: ProviderManager doesn't have removeProvider method yet
    // This would need to be implemented if dynamic provider removal is needed
  }
}

/**
 * Global provider factory instance
 */
export const imageProviders = ProviderFactory.getInstance();

/**
 * Convenience function for generating images with fallback
 */
export async function generateImageWithProviders(
  params: ImageGenerationParams,
  preferredProvider?: ProviderType
): Promise<ImageGenerationResponse> {
  return imageProviders.generateImage(params, preferredProvider);
}

/**
 * Convenience function for getting a specific provider
 */
export function getImageProvider(providerType?: ProviderType): ImageGenerationProvider {
  if (providerType) {
    return imageProviders.getProvider(providerType);
  }
  return imageProviders.getDefaultProvider();
}

/**
 * Convenience function for checking provider health
 */
export async function checkProvidersHealth() {
  return imageProviders.getProvidersHealth();
}

/**
 * Convenience function for getting provider configuration summary
 */
export function getProviderConfigSummary() {
  return providerConfig.getConfigSummary();
}

/**
 * Validate provider setup on startup
 */
export function validateProviderSetup(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if at least one provider is available
  const availableProviders = imageProviders.getAvailableProviders();
  if (availableProviders.length === 0) {
    errors.push("No image generation providers are available");
  }
  
  // Validate configurations
  const configValidations = providerConfig.validateConfigurations();
  for (const validation of configValidations) {
    if (!validation.valid) {
      errors.push(`${validation.provider}: ${validation.error}`);
    }
  }
  
  // Check required environment variables
  const requiredVars = {
    ideogram: ["NEXT_PUBLIC_IDEOGRAM_API_KEY"],
    huggingface: ["NEXT_PUBLIC_HUGGING_FACE_API_TOKEN"],
    qwen: ["NEXT_PUBLIC_HUGGING_FACE_API_TOKEN"],
    stability: ["STABILITY_API_KEY"],
    midjourney: ["MIDJOURNEY_API_KEY"]
  };
  
  for (const [provider, vars] of Object.entries(requiredVars)) {
    if (providerConfig.isProviderAvailable(provider as ProviderType)) {
      for (const varName of vars) {
        if (!process.env[varName]) {
          errors.push(`Missing environment variable for ${provider}: ${varName}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate setup on module load (in development)
if (process.env.NODE_ENV === 'development') {
  const validation = validateProviderSetup();
  if (!validation.valid) {
    console.warn("[ProviderFactory] Setup validation warnings:");
    validation.errors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log("[ProviderFactory] Provider setup validation passed");
  }
}
