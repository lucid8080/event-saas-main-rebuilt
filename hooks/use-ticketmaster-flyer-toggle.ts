import { useState, useEffect } from 'react';

export function useTicketmasterFlyerToggle() {
  const [ticketmasterFlyerEnabled, setTicketmasterFlyerEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkTicketmasterFlyerToggle() {
      try {
        const response = await fetch('/api/settings/ticketmaster-flyer-toggle');
        if (response.ok) {
          const data = await response.json();
          setTicketmasterFlyerEnabled(data.ticketmasterFlyerEnabled);
        }
      } catch (error) {
        console.error('Error checking Ticketmaster flyer toggle:', error);
        // Default to disabled if there's an error
        setTicketmasterFlyerEnabled(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkTicketmasterFlyerToggle();
  }, []);

  return { ticketmasterFlyerEnabled, isLoading };
} 