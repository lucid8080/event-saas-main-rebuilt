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
}

export function LazyImage({
  src,
  webpSrc,
  alt,
  className,
  placeholder = '/placeholder-image.png',
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { isVisible, hasLoaded, isLoading, ref } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
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
      {/* Loading placeholder */}
      {!hasLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="size-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500">Loading...</p>
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