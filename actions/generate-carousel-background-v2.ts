"use server";

import { AspectRatio, ImageQuality, ProviderType } from "@/lib/providers";

// TODO: V2 implementation has API compatibility issues - temporarily disabled
// This file contains complex API incompatibilities that need to be resolved
// For now, using the working v1 implementation in generate-carousel-background.ts

export async function generateCarouselBackgroundV2(
  prompt: string, 
  aspectRatio: string,
  slideIndex: number,
  carouselTitle: string,
  preferredProvider?: ProviderType,
  quality?: ImageQuality
) {
  // TODO: Re-implement with correct API compatibility
  throw new Error("V2 implementation temporarily disabled - use generateCarouselBackground instead");
}

/**
 * Convert various aspect ratio formats to our standard format
 */
function convertToStandardAspectRatio(aspectRatio: string): AspectRatio {
  // Handle both "1:1" and "1x1" formats
  const normalized = aspectRatio.replace('x', ':');
  
  // Validate against supported ratios
  const supportedRatios: AspectRatio[] = [
    "1:1", "16:9", "9:16", "4:3", "3:4", "4:5", "5:7", "3:2", "2:3", "10:16", "16:10", "1:3", "3:1"
  ];
  
  if (supportedRatios.includes(normalized as AspectRatio)) {
    return normalized as AspectRatio;
  }
  
  // Default to 1:1 if not supported
  console.warn(`Unsupported aspect ratio: ${aspectRatio}, defaulting to 1:1`);
  return "1:1";
}

/**
 * Generate a consistent seed from prompt and slide index for reproducibility
 */
function generateSeedFromPrompt(prompt: string, slideIndex: number): number {
  let hash = 0;
  const combinedInput = `${prompt}_slide_${slideIndex}`;
  
  for (let i = 0; i < combinedInput.length; i++) {
    const char = combinedInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash) % 1000000; // Keep it reasonable
}
