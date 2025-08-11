"use client";

import { useState } from 'react';
import { useLazyLoading } from '@/hooks/use-lazy-loading';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // Add priority prop for first batch images
}

export function LazyImage({
  src,
  webpSrc,
  alt,
  className,
  placeholder = '/placeholder-image.png',
  onLoad,
  onError,
  priority = false, // Add priority prop for first batch images
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { isVisible, hasLoaded, isLoading, ref } = useLazyLoading({
    threshold: 0.1,
    rootMargin: priority ? '300px' : '100px', // More aggressive preloading for priority images
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        className
      )}
    >
      {/* Loading placeholder with progressive effect */}
      {!hasLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center space-y-2">
            <div className="size-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isVisible && hasLoaded && (
        <picture>
          {webpSrc && (
            <source srcSet={webpSrc} type="image/webp" />
          )}
          <img
            src={imageError ? placeholder : src}
            alt={alt}
            className={cn(
              'w-full h-auto transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </picture>
      )}

      {/* Fallback for browsers without IntersectionObserver */}
      {!('IntersectionObserver' in window) && (
        <picture>
          {webpSrc && (
            <source srcSet={webpSrc} type="image/webp" />
          )}
          <img
            src={imageError ? placeholder : src}
            alt={alt}
            className={cn(
              'w-full h-auto transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </picture>
      )}
    </div>
  );
} 