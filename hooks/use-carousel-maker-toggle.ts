import { useState, useEffect } from 'react';

export function useCarouselMakerToggle() {
  const [carouselMakerEnabled, setCarouselMakerEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkCarouselMakerToggle() {
      try {
        const response = await fetch('/api/settings/carousel-maker-toggle');
        if (response.ok) {
          const data = await response.json();
          setCarouselMakerEnabled(data.carouselMakerEnabled);
        }
      } catch (error) {
        console.error('Error checking Carousel Maker toggle:', error);
        // Default to disabled if there's an error
        setCarouselMakerEnabled(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkCarouselMakerToggle();
  }, []);

  return { carouselMakerEnabled, isLoading };
} 