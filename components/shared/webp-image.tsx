"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface WebPImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackFormat?: 'jpeg' | 'png' | 'webp';
  onLoad?: () => void;
  onError?: () => void;
}

export function WebPImage({
  src,
  webpSrc,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  fallbackFormat = 'jpeg',
  onLoad,
  onError
}: WebPImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine if we should use WebP
  const shouldUseWebP = webpSrc && !hasError;
  
  // If no dimensions provided, use regular img element
  if (!width || !height) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {shouldUseWebP ? (
          <picture>
            <source srcSet={webpSrc} type="image/webp" />
            <img
              src={src}
              alt={alt}
              className={cn(
                "duration-700 ease-in-out",
                isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"
              )}
              onLoad={() => {
                setIsLoading(false);
                onLoad?.();
              }}
              onError={() => {
                setHasError(true);
                onError?.();
              }}
            />
          </picture>
        ) : (
          <img
            src={src}
            alt={alt}
            className={cn(
              "duration-700 ease-in-out",
              isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"
            )}
            onLoad={() => {
              setIsLoading(false);
              onLoad?.();
            }}
            onError={() => {
              setHasError(true);
              onError?.();
            }}
          />
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  // With dimensions, use Next.js Image component
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {shouldUseWebP ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              "duration-700 ease-in-out",
              isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"
            )}
            onLoad={() => {
              setIsLoading(false);
              onLoad?.();
            }}
            onError={() => {
              setHasError(true);
              onError?.();
            }}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
          />
        </picture>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "duration-700 ease-in-out",
            isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"
          )}
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Hook to detect WebP support
export function useWebPSupport() {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  useState(() => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const dataURL = ctx.canvas.toDataURL('image/webp');
        setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
      } else {
        setSupportsWebP(false);
      }
    }
  });

  return supportsWebP;
}

// Utility function to get WebP URL from R2 key
export function getWebPUrl(r2Key: string, webpKey?: string): string | undefined {
  if (!webpKey) return undefined;
  
  // If the webpKey is different from r2Key, it means WebP conversion was successful
  if (webpKey !== r2Key) {
    // Generate signed URL for WebP version
    // This would typically call your R2 signed URL generation function
    return webpKey; // For now, return the key - you'll need to implement signed URL generation
  }
  
  return undefined;
}

// Utility function to determine if an image should use WebP
export function shouldUseWebP(
  originalFormat?: string,
  webpEnabled?: boolean,
  webpKey?: string
): boolean {
  // Don't use WebP if it's not enabled
  if (!webpEnabled) return false;
  
  // Don't use WebP if no WebP key is available
  if (!webpKey) return false;
  
  // Don't use WebP if the original is already WebP
  if (originalFormat === 'webp') return false;
  
  return true;
} 