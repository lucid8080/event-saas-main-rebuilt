import { CalendarEvent } from '@/hooks/use-ticketmaster-events';
import { Badge } from '@/components/ui/badge';
import { Ticket, MapPin, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface EventBadgeProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function EventBadge({ event, onClick, compact = false }: EventBadgeProps) {
  const getEventTypeColor = (classification: string) => {
    const type = classification.toLowerCase();
    if (type.includes('concert') || type.includes('music')) return 'bg-purple-600 text-white hover:bg-purple-700';
    if (type.includes('sport')) return 'bg-green-600 text-white hover:bg-green-700';
    if (type.includes('theatre') || type.includes('arts')) return 'bg-blue-600 text-white hover:bg-blue-700';
    if (type.includes('family')) return 'bg-pink-600 text-white hover:bg-pink-700';
    if (type.includes('comedy')) return 'bg-orange-600 text-white hover:bg-orange-700';
    return 'bg-slate-600 text-white hover:bg-slate-700';
  };

  const formatTime = (time: string) => {
    if (!time || event.isTBA) return 'TBA';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatPrice = (priceRange?: { min: number; max: number; currency: string }) => {
    if (!priceRange) return '';
    const { min, max, currency } = priceRange;
    if (min === max) {
      return `${currency}${min}`;
    }
    return `${currency}${min}-${max}`;
  };

  if (compact) {
    return (
      <Badge
        variant="secondary"
        className={`px-1 py-0.5 text-xs cursor-pointer transition-colors ${getEventTypeColor(event.classification)}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
      >
        <div className="flex items-center gap-1">
          <Ticket className="size-3" />
          <span className="max-w-20 truncate">{event.name}</span>
        </div>
      </Badge>
    );
  }

  return (
    <div
      className={`p-2 rounded-md border cursor-pointer transition-colors hover:bg-muted/50 ${getEventTypeColor(event.classification)}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{event.name}</h4>
            <div className="flex mt-1 text-xs text-muted-foreground items-center gap-1">
              <MapPin className="size-3" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {event.classification}
          </Badge>
        </div>
        
        <div className="flex text-xs text-muted-foreground items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{formatTime(event.time)}</span>
          </div>
          {event.priceRange && (
            <div className="flex items-center gap-1">
              <DollarSign className="size-3" />
              <span>{formatPrice(event.priceRange)}</span>
            </div>
          )}
        </div>
        
        {event.city && event.state && (
          <div className="text-xs text-muted-foreground">
            {event.city}, {event.state}
          </div>
        )}
      </div>
    </div>
  );
}

interface EventListProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  maxDisplay?: number;
}

export function EventList({ events, onEventClick, maxDisplay = 3 }: EventListProps) {
  const displayEvents = events.slice(0, maxDisplay);
  const remainingCount = events.length - maxDisplay;

  return (
    <div className="space-y-1">
      {displayEvents.map((event) => (
        <EventBadge
          key={event.id}
          event={event}
          onClick={onEventClick}
          compact={true}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="px-1 py-0.5 text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
} 