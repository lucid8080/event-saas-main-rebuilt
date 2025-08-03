import Image from 'next/image';
import { useState } from 'react';

// Optimized image component with lazy loading
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Lazy loaded image component
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  threshold = 0.1,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  threshold?: number;
}) {
  const [isInView, setIsInView] = useState(false);

  // Simple intersection observer for lazy loading
  const handleRef = (node: HTMLDivElement) => {
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      observer.observe(node);
    }
  };

  return (
    <div ref={handleRef} className={className}>
      {isInView ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      ) : (
        <div 
          className={`bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
    </div>
  );
}

// Progressive image loading with multiple sizes
export function ProgressiveImage({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: { width: number; height: number; src: string }[];
  className?: string;
}) {
  const [currentSize, setCurrentSize] = useState(0);

  const handleLoad = () => {
    if (currentSize < sizes.length - 1) {
      setCurrentSize(prev => prev + 1);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {sizes.map((size, index) => (
        <Image
          key={index}
          src={size.src}
          alt={alt}
          width={size.width}
          height={size.height}
          className={`
            absolute inset-0
            ${index === currentSize ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300
          `}
          onLoad={handleLoad}
          priority={index === 0}
        />
      ))}
    </div>
  );
} 