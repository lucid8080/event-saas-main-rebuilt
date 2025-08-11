// Core types and interfaces for the Image Generation API Abstraction Layer

import { EventDetails } from "../prompt-generator";

/**
 * Standard aspect ratios supported across all providers
 */
export type AspectRatio = 
  | "1:1"    // Square
  | "16:9"   // Widescreen
  | "9:16"   // Portrait
  | "4:3"    // Standard
  | "3:4"    // Portrait standard
  | "4:5"    // Instagram portrait
  | "5:7"    // Greeting card
  | "3:2"    // Classic photo
  | "2:3"    // Portrait photo
  | "10:16"  // Extended portrait
  | "16:10"  // Extended landscape
  | "1:3"    // Ultra portrait
  | "3:1";   // Ultra landscape

/**
 * Quality levels for image generation
 */
export type ImageQuality = "fast" | "standard" | "high" | "ultra";

/**
 * Available image generation providers
 */
export type ProviderType = "ideogram" | "huggingface" | "stability" | "midjourney" | "qwen" | "fal-qwen" | "fal-ideogram";

/**
 * Standard parameters for image generation requests
 */
export interface ImageGenerationParams {
  /** The text prompt for image generation */
  prompt: string;
  
  /** Desired aspect ratio */
  aspectRatio: AspectRatio;
  
  /** Quality/speed tradeoff */
  quality?: ImageQuality;
  
  /** Random seed for reproducible results */
  seed?: number;
  
  /** Whether to randomize the seed */
  randomizeSeed?: boolean;
  
  /** Event type for context-aware generation */
  eventType?: string;
  
  /** Event details for enhanced prompts */
  eventDetails?: EventDetails;
  
  /** Style name for styling */
  styleName?: string;
  
  /** Custom style prompt */
  customStyle?: string;
  
  /** Style reference images for V3 generation */
  styleReferenceImages?: File[];
  
  /** User ID for credit tracking and personalization */
  userId: string;
  
  /** Whether to apply watermark */
  watermarkEnabled?: boolean;
  
  /** Additional provider-specific options */
  providerOptions?: Record<string, any>;
}

/**
 * Standard response from image generation
 */
export interface ImageGenerationResponse {
  /** The generated image data (URL, base64, or buffer) */
  imageData: string | Buffer;
  
  /** Image format/mime type */
  mimeType: string;
  
  /** Seed used for generation */
  seed?: number;
  
  /** Provider that generated the image */
  provider: ProviderType;
  
  /** Generation cost in credits or dollars */
  cost: number;
  
  /** Generation time in milliseconds */
  generationTime: number;
  
  /** Image metadata */
  metadata: {
    width: number;
    height: number;
    aspectRatio: AspectRatio;
    prompt: string;
    enhancedPrompt?: string;
    quality: ImageQuality;
  };
  
  /** Provider-specific response data */
  providerData?: Record<string, any>;
}

/**
 * Provider capabilities and limitations
 */
export interface ProviderCapabilities {
  /** Supported aspect ratios */
  supportedAspectRatios: AspectRatio[];
  
  /** Supported quality levels */
  supportedQualities: ImageQuality[];
  
  /** Maximum prompt length */
  maxPromptLength: number;
  
  /** Whether the provider supports seeds */
  supportsSeeds: boolean;
  
  /** Whether the provider supports style reference images */
  supportsStyleImages: boolean;
  
  /** Whether the provider supports image editing */
  supportsImageEditing: boolean;
  
  /** Rate limits */
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  
  /** Cost information */
  pricing: {
    costPerImage: number;
    currency: string;
    freeQuota?: number;
  };
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Provider type */
  type: ProviderType;
  
  /** API key or token */
  apiKey: string;
  
  /** API base URL (if applicable) */
  baseUrl?: string;
  
  /** Whether this provider is enabled */
  enabled: boolean;
  
  /** Priority for fallback scenarios (higher = preferred) */
  priority: number;
  
  /** Provider-specific configuration */
  options?: Record<string, any>;
}

/**
 * Error types that can occur during image generation
 */
export class ImageGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: ProviderType,
    public retryable: boolean = false,
    public originalError?: any
  ) {
    super(message);
    this.name = "ImageGenerationError";
  }
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication errors
  INVALID_API_KEY: "INVALID_API_KEY",
  UNAUTHORIZED: "UNAUTHORIZED",
  
  // Request errors
  INVALID_PARAMETERS: "INVALID_PARAMETERS",
  PROMPT_TOO_LONG: "PROMPT_TOO_LONG",
  UNSUPPORTED_ASPECT_RATIO: "UNSUPPORTED_ASPECT_RATIO",
  
  // Quota/rate limiting
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  RATE_LIMITED: "RATE_LIMITED",
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",
  
  // Service errors
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",
  GENERATION_FAILED: "GENERATION_FAILED",
  
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  
  // Unknown errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR"
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
