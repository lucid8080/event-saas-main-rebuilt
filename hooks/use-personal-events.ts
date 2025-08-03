import { useState, useEffect } from 'react';

export interface PersonalEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string;
  recurring: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarPersonalEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  description?: string;
  recurring: boolean;
  color: string;
  isPersonal: true;
}

export function usePersonalEvents() {
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events from database API on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/personal-events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load personal events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const addEvent = async (event: Omit<PersonalEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/personal-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newEvent = await response.json();
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error("Failed to add personal event:", error);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<PersonalEvent>) => {
    try {
      const response = await fetch(`/api/personal-events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (error) {
      console.error("Failed to update personal event:", error);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/personal-events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error("Failed to delete personal event:", error);
      throw error;
    }
  };

  const getEventsForDate = (date: Date): CalendarPersonalEvent[] => {
    const targetDate = new Date(date);
    const targetMonth = targetDate.getMonth();
    const targetDay = targetDate.getDate();
    const targetYear = targetDate.getFullYear();

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        const eventMonth = eventDate.getMonth();
        const eventDay = eventDate.getDate();

        // For recurring events, check if month and day match
        if (event.recurring) {
          return eventMonth === targetMonth && eventDay === targetDay;
        }

        // For non-recurring events, check if year, month, and day match
        const eventYear = eventDate.getFullYear();
        return eventYear === targetYear && eventMonth === targetMonth && eventDay === targetDay;
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        type: event.type,
        description: event.description,
        recurring: event.recurring,
        color: event.color,
        isPersonal: true,
      }));
  };

  const getUpcomingEvents = (days: number = 30): CalendarPersonalEvent[] => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    const upcoming: CalendarPersonalEvent[] = [];

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const currentYear = today.getFullYear();
      
      // For recurring events, check next occurrence
      if (event.recurring) {
        // Set event date to current year
        eventDate.setFullYear(currentYear);
        
        // If event date has passed this year, set it to next year
        if (eventDate < today) {
          eventDate.setFullYear(currentYear + 1);
        }
        
        if (eventDate >= today && eventDate <= endDate) {
          upcoming.push({
            id: event.id,
            title: event.title,
            date: new Date(eventDate),
            type: event.type,
            description: event.description,
            recurring: event.recurring,
            color: event.color,
            isPersonal: true,
          });
        }
      } else {
        // For non-recurring events, check if within range
        if (eventDate >= today && eventDate <= endDate) {
          upcoming.push({
            id: event.id,
            title: event.title,
            date: new Date(eventDate),
            type: event.type,
            description: event.description,
            recurring: event.recurring,
            color: event.color,
            isPersonal: true,
          });
        }
      }
    });

    return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getUpcomingEvents,
  };
} 