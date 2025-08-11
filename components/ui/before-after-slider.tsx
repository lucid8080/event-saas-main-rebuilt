"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  alt?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  alt = "Before and after comparison",
  className
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
    e.stopPropagation(); // Prevent event from bubbling to parent
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    e.stopPropagation(); // Prevent event from bubbling to parent
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.stopPropagation(); // Prevent event from bubbling to parent
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
    e.stopPropagation(); // Prevent event from bubbling to parent
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    e.stopPropagation(); // Prevent event from bubbling to parent
  };

  // Prevent any mouse events on the container from bubbling up
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContainerMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContainerMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-auto overflow-hidden rounded-lg border shadow-lg",
        className
      )}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container for both images - both at full size */}
      <div className="relative w-full h-auto">
        {/* Before Image - positioned normally */}
        <img
          src={beforeImage}
          alt={`${alt} - Before`}
          className="w-full h-auto object-contain"
        />
        
        {/* After Image - positioned absolutely, clipped by slider */}
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
        >
          <img
            src={afterImage}
            alt={`${alt} - After`}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-1 h-1 bg-gray-400 rounded-full mb-0.5"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

             {/* Labels */}
       <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
         After
       </div>
       <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
         Before
       </div>
    </div>
  );
}
