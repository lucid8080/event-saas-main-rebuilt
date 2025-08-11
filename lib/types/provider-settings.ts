/**
 * Advanced provider settings types and interfaces
 * For admin-only management of AI provider parameters
 */

export type ProviderType = "ideogram" | "huggingface" | "stability" | "midjourney" | "qwen" | "fal-qwen" | "fal-ideogram";

/**
 * Base provider settings that apply to most providers
 */
export interface BaseProviderSettings {
  // Generation Quality Settings
  inferenceSteps?: number;
  guidanceScale?: number;
  temperature?: number;
  
  // Quality Management
  defaultQuality?: 'fast' | 'standard' | 'high' | 'ultra';
  qualityPresets?: {
    fast?: {
      inferenceSteps?: number;
      guidanceScale?: number;
    };
    standard?: {
      inferenceSteps?: number;
      guidanceScale?: number;
    };
    high?: {
      inferenceSteps?: number;
      guidanceScale?: number;
    };
    ultra?: {
      inferenceSteps?: number;
      guidanceScale?: number;
    };
  };
  
  // Reproducibility Settings
  seed?: number;
  randomizeSeed?: boolean;
  
  // Output Settings
  imageSize?: string;
  numImages?: number;
  
  // Safety and Content Settings
  enableSafetyChecker?: boolean;
  contentFilter?: boolean;
  
  // Performance Settings
  syncMode?: boolean;
  priority?: 'low' | 'normal' | 'high';
  
  // Cost Management
  maxDailyCost?: number;
  costPerImage?: number;
  budgetAlert?: boolean;
}

/**
 * Provider-specific settings for each AI provider
 */
export interface ProviderSpecificSettings {
  // Ideogram specific
  ideogram?: {
    renderingSpeed?: 'TURBO' | 'BALANCED' | 'QUALITY';
    magicPromptOption?: 'ON' | 'OFF' | 'AUTO';
    styleType?: 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'RENDER_3D' | 'ANIME';
    colorPalette?: string;
    negativePrompt?: string;
  };
  
  // HuggingFace specific
  huggingface?: {
    model?: string;
    schedulerType?: string;
    clipSkip?: number;
    strengthParameter?: number;
    eta?: number;
  };
  
  // Fal-AI Qwen specific
  'fal-qwen'?: {
    imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
    enableSafetyChecker?: boolean;
    syncMode?: boolean;
    // Qwen supports guidance scale range: 0.0-20.0, default: 3.0
    guidanceScale?: number;
    // Qwen supports inference steps range: 1-50, default: 25
    numInferenceSteps?: number;
    // Max 4 images per generation
    numImages?: number;
  };
  
  // Fal-AI Ideogram specific
  'fal-ideogram'?: {
    renderingSpeed?: 'TURBO' | 'BALANCED' | 'QUALITY';
    expandPrompt?: boolean;
    style?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN';
    styleCodes?: string[];
    colorPalette?: {
      name?: string;
      members?: Array<{
        color: string;
        weight?: number;
      }>;
    };
    negativePrompt?: string;
    imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
    customImageSize?: {
      width: number;
      height: number;
    };
    syncMode?: boolean;
    numImages?: number;
    seed?: number;
  };
  
  // Stability AI specific (for future)
  stability?: {
    engineId?: string;
    stylePreset?: string;
    steps?: number;
    cfgScale?: number;
    sampler?: string;
  };
}

/**
 * Complete provider settings combining base and specific settings
 */
export interface ProviderSettings {
  id: string;
  providerId: ProviderType;
  name: string;
  description?: string;
  
  // Base settings that apply to most providers
  baseSettings: BaseProviderSettings;
  
  // Provider-specific settings
  specificSettings: ProviderSpecificSettings;
  
  // Metadata
  isActive: boolean;
  isDefault: boolean;
  
  // Admin metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
  
  // Usage and cost tracking
  usageStats?: {
    totalGenerations: number;
    totalCost: number;
    averageCostPerImage: number;
    lastUsed: Date;
  };
}

/**
 * Provider capabilities - what parameters each provider supports
 */
export interface ProviderCapabilities {
  providerId: ProviderType;
  name: string;
  description: string;
  
  // Supported parameter ranges
  inferenceSteps?: {
    min: number;
    max: number;
    default: number;
    step?: number;
  };
  
  guidanceScale?: {
    min: number;
    max: number;
    default: number;
    step?: number;
  };
  
  temperature?: {
    min: number;
    max: number;
    default: number;
    step?: number;
  };
  
  // Supported features
  supportsSeeds: boolean;
  supportsMultipleImages: boolean;
  supportsSafetyChecker: boolean;
  supportsNegativePrompts: boolean;
  supportsStylePresets: boolean;
  
  // Cost information
  costPerMegapixel?: number;
  costPerImage?: number;
  freeQuota?: number;
  
  // Image size options
  supportedImageSizes: string[];
  defaultImageSize: string;
  
  // Quality options
  supportedQualities: ('fast' | 'standard' | 'high' | 'ultra')[];
  defaultQuality: 'fast' | 'standard' | 'high' | 'ultra';
}

/**
 * Settings validation result
 */
export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedSettings?: ProviderSettings;
}

/**
 * Settings update request
 */
export interface SettingsUpdateRequest {
  providerId: ProviderType;
  baseSettings?: Partial<BaseProviderSettings>;
  specificSettings?: Partial<ProviderSpecificSettings>;
  metadata?: {
    description?: string;
    isActive?: boolean;
    isDefault?: boolean;
  };
}

/**
 * Cost tracking record
 */
export interface CostTrackingRecord {
  id: string;
  providerId: ProviderType;
  userId: string;
  generationId: string;
  cost: number;
  imageSize: string;
  parameters: Record<string, any>;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

/**
 * Provider usage analytics
 */
export interface ProviderUsageAnalytics {
  providerId: ProviderType;
  period: 'hour' | 'day' | 'week' | 'month';
  
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  
  totalCost: number;
  averageCostPerImage: number;
  
  averageResponseTime: number;
  
  popularSettings: {
    parameter: string;
    value: any;
    usage: number;
  }[];
  
  costTrends: {
    date: Date;
    cost: number;
    generations: number;
  }[];
}
