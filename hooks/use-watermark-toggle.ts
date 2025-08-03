import { useState, useEffect } from 'react';

export function useWatermarkToggle() {
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkWatermarkToggle() {
      try {
        console.log('Checking watermark toggle status...');
        const response = await fetch('/api/settings/watermark-toggle');
        console.log('Watermark toggle response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Watermark toggle data:', data);
          setWatermarkEnabled(data.watermarkEnabled);
        } else {
          console.error('Watermark toggle response not ok:', response.status);
        }
      } catch (error) {
        console.error('Error checking watermark toggle:', error);
        // Default to disabled if there's an error
        setWatermarkEnabled(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkWatermarkToggle();
  }, []);

  return { watermarkEnabled, isLoading };
} 