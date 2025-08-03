"use client";

import Image from 'next/image';
import { useWatermarkToggle } from '@/hooks/use-watermark-toggle';

interface WatermarkedImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function WatermarkedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false 
}: WatermarkedImageProps) {
  const { watermarkEnabled, isLoading: watermarkLoading } = useWatermarkToggle();

  console.log('WatermarkedImage render:', { 
    watermarkEnabled, 
    watermarkLoading, 
    src: src ? 'present' : 'missing',
    srcUrl: src?.substring(0, 50) + '...' // Log first 50 chars to avoid huge logs
  });

  // If no source, show placeholder
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className || ''}`}>
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  // Check if this is a data URL (watermarked image)
  const isDataUrl = src.startsWith('data:image/');

  // If it's a data URL, it's already watermarked, so display it normally
  if (isDataUrl) {
    console.log('Displaying watermarked data URL');
    if (!width || !height) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  // If watermark is not enabled, just show the original image
  if (!watermarkEnabled || watermarkLoading) {
    console.log('Watermark disabled, showing original image');
    if (!width || !height) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  // If watermark is enabled but we have an original URL, show with CSS overlay as fallback
  console.log('Watermark enabled, showing with CSS overlay (fallback)');
  if (!width || !height) {
    return (
      <div className="relative inline-block">
        <img
          src={src}
          alt={alt}
          className={className}
        />
        <div className="absolute bottom-4 right-4 text-white text-sm font-medium opacity-70 pointer-events-none select-none">
          <span className="drop-shadow-lg">Made using EventCraftAI.com</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
      <div className="absolute bottom-4 right-4 text-white text-sm font-medium opacity-70 pointer-events-none select-none">
        <span className="drop-shadow-lg">Made using EventCraftAI.com</span>
      </div>
    </div>
  );
} 