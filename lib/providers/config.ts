// Configuration management for image generation providers

import { ProviderConfig, ProviderType } from "./types";

/**
 * Provider configuration manager
 */
export class ProviderConfigManager {
  private configs: Map<ProviderType, ProviderConfig> = new Map();
  private defaultProvider: ProviderType = "ideogram";
  
  constructor() {
    this.loadConfigurations();
  }
  
  /**
   * Reload configurations (useful when environment variables change)
   */
  reloadConfigurations(): void {
    this.configs.clear();
    this.loadConfigurations();
  }
  
  /**
   * Load provider configurations from environment variables
   */
  private loadConfigurations(): void {
    // Ideogram configuration
    const ideogramKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
    if (ideogramKey) {
      this.configs.set("ideogram", {
        type: "ideogram",
        apiKey: ideogramKey,
        baseUrl: "https://api.ideogram.ai",
        enabled: true,
        priority: 100,
        options: {
          version: "v3", // Use V3 API by default
          renderingSpeed: "TURBO"
        }
      });
    }
    
    // Hugging Face configuration (Inference API)
    const huggingFaceToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
    if (huggingFaceToken) {
      this.configs.set("huggingface", {
        type: "huggingface",
        apiKey: huggingFaceToken,
        baseUrl: "https://api-inference.huggingface.co",
        enabled: true,
        priority: 90,
        options: {
          model: "stabilityai/stable-diffusion-xl-base-1.0"
        }
      });
    }
    
    // Qwen-Image configuration (Space API)
    if (huggingFaceToken) {
      this.configs.set("qwen", {
        type: "qwen",
        apiKey: huggingFaceToken,
        baseUrl: "https://huggingface.co/spaces/Qwen/Qwen-Image",
        enabled: true,
        priority: 95, // Higher priority - user prefers Qwen
        options: {
          model: "Qwen/Qwen-Image",
          spaceUrl: "Qwen/Qwen-Image"
        }
      });
    }
    
    // Stability AI configuration (for future use)
    const stabilityKey = process.env.STABILITY_API_KEY;
    if (stabilityKey) {
      this.configs.set("stability", {
        type: "stability",
        apiKey: stabilityKey,
        baseUrl: "https://api.stability.ai",
        enabled: false, // Disabled by default until implemented
        priority: 80,
        options: {
          model: "stable-diffusion-xl-1024-v1-0"
        }
      });
    }
    
    // Fal-AI Qwen configuration
    const falKey = process.env.FAL_KEY;
    if (falKey) {
      this.configs.set("fal-qwen", {
        type: "fal-qwen",
        apiKey: falKey,
        baseUrl: "https://queue.fal.run",
        enabled: true,
        priority: 101, // Highest priority - user specifically requested this provider
        options: {
          model: "fal-ai/qwen-image",
          imageSize: "square_hd",
          syncMode: false
        }
      });
      
      // Also configure Fal-AI Ideogram with the same API key
      this.configs.set("fal-ideogram", {
        type: "fal-ideogram",
        apiKey: falKey,
        baseUrl: "https://queue.fal.run",
        enabled: true,
        priority: 102, // Higher priority than Qwen - user specifically requested Ideogram
        options: {
          model: "fal-ai/ideogram/v3",
          imageSize: "square_hd",
          syncMode: false,
          renderingSpeed: "BALANCED"
        }
      });
    }
    
    // Set default provider based on environment or availability
    const preferredProvider = process.env.IMAGE_GENERATION_PROVIDER as ProviderType;
    if (preferredProvider && this.configs.has(preferredProvider)) {
      this.defaultProvider = preferredProvider;
    } else {
      // Fallback to first available provider
      const availableProviders = Array.from(this.configs.keys())
        .filter(provider => this.configs.get(provider)?.enabled);
      
      if (availableProviders.length > 0) {
        // Sort by priority (highest first)
        availableProviders.sort((a, b) => {
          const priorityA = this.configs.get(a)?.priority || 0;
          const priorityB = this.configs.get(b)?.priority || 0;
          return priorityB - priorityA;
        });
        this.defaultProvider = availableProviders[0];
      }
    }
  }
  
  /**
   * Ensure configurations are loaded
   */
  ensureInitialized(): void {
    // If no configs are loaded, reload them
    if (this.configs.size === 0) {
      console.log("[ProviderConfigManager] No configs loaded, reloading...");
      this.reloadConfigurations();
    }
  }

  /**
   * Get configuration for a specific provider
   */
  getProviderConfig(provider: ProviderType): ProviderConfig | undefined {
    this.ensureInitialized();
    return this.configs.get(provider);
  }
  
  /**
   * Get the default provider
   */
  getDefaultProvider(): ProviderType {
    return this.defaultProvider;
  }
  
  /**
   * Set the default provider
   */
  setDefaultProvider(provider: ProviderType): void {
    if (!this.configs.has(provider)) {
      throw new Error(`Provider ${provider} is not configured`);
    }
    
    const config = this.configs.get(provider);
    if (!config?.enabled) {
      throw new Error(`Provider ${provider} is not enabled`);
    }
    
    this.defaultProvider = provider;
  }
  
  /**
   * Get all available (enabled) providers sorted by priority
   */
  getAvailableProviders(): ProviderType[] {
    this.ensureInitialized();
    return Array.from(this.configs.entries())
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => (b.priority || 0) - (a.priority || 0))
      .map(([provider, _]) => provider);
  }
  
  /**
   * Get fallback providers for a given provider (in priority order)
   */
  getFallbackProviders(primaryProvider: ProviderType): ProviderType[] {
    return this.getAvailableProviders()
      .filter(provider => provider !== primaryProvider);
  }
  
  /**
   * Check if a provider is configured and enabled
   */
  isProviderAvailable(provider: ProviderType): boolean {
    const config = this.configs.get(provider);
    return config?.enabled === true && !!config.apiKey;
  }
  
  /**
   * Enable or disable a provider
   */
  setProviderEnabled(provider: ProviderType, enabled: boolean): void {
    const config = this.configs.get(provider);
    if (config) {
      config.enabled = enabled;
    }
  }
  
  /**
   * Update provider configuration
   */
  updateProviderConfig(provider: ProviderType, updates: Partial<ProviderConfig>): void {
    const config = this.configs.get(provider);
    if (config) {
      Object.assign(config, updates);
    }
  }
  
  /**
   * Add a new provider configuration
   */
  addProviderConfig(config: ProviderConfig): void {
    this.configs.set(config.type, config);
  }
  
  /**
   * Get summary of all provider configurations
   */
  getConfigSummary(): Array<{
    provider: ProviderType;
    enabled: boolean;
    configured: boolean;
    priority: number;
    isDefault: boolean;
  }> {
    const allProviders: ProviderType[] = ["ideogram", "huggingface", "qwen", "stability", "midjourney", "fal-qwen", "fal-ideogram"];
    
    return allProviders.map(provider => {
      const config = this.configs.get(provider);
      return {
        provider,
        enabled: config?.enabled || false,
        configured: !!config?.apiKey,
        priority: config?.priority || 0,
        isDefault: provider === this.defaultProvider
      };
    });
  }
  
  /**
   * Validate all configurations
   */
  validateConfigurations(): Array<{ provider: ProviderType; valid: boolean; error?: string }> {
    const results: Array<{ provider: ProviderType; valid: boolean; error?: string }> = [];
    
    for (const [provider, config] of Array.from(this.configs.entries())) {
      let valid = true;
      let error: string | undefined;
      
      if (!config.apiKey) {
        valid = false;
        error = "API key is missing";
      } else if (!config.baseUrl && provider !== "huggingface") {
        // Hugging Face uses Space API, so baseUrl is optional
        valid = false;
        error = "Base URL is missing";
      }
      
      results.push({ provider, valid, error });
    }
    
    return results;
  }
  
  /**
   * Get environment variable names for provider configuration
   */
  static getRequiredEnvironmentVariables(): Record<ProviderType, string[]> {
    return {
      ideogram: ["NEXT_PUBLIC_IDEOGRAM_API_KEY"],
      huggingface: ["NEXT_PUBLIC_HUGGING_FACE_API_TOKEN"],
      qwen: ["NEXT_PUBLIC_HUGGING_FACE_API_TOKEN"],
      stability: ["STABILITY_API_KEY"],
      midjourney: ["MIDJOURNEY_API_KEY"], // For future use
      "fal-qwen": ["FAL_KEY"],
      "fal-ideogram": ["FAL_KEY"]
    };
  }
}

// Global instance
export const providerConfig = new ProviderConfigManager();
