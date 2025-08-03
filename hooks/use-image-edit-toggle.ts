import { useState, useEffect } from 'react';

export function useImageEditToggle() {
  const [imageEditEnabled, setImageEditEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkImageEditToggle() {
      try {
        const response = await fetch('/api/settings/image-edit-toggle');
        if (response.ok) {
          const data = await response.json();
          setImageEditEnabled(data.imageEditEnabled);
        }
      } catch (error) {
        console.error('Error checking image edit toggle:', error);
        // Default to enabled if there's an error
        setImageEditEnabled(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkImageEditToggle();
  }, []);

  return { imageEditEnabled, isLoading };
} 