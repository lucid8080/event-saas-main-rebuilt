import { CalendarEvent } from '@/hooks/use-ticketmaster-events';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Calendar as CalendarIcon,
  Sparkles,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { mapTicketmasterEvent } from '@/lib/ticketmaster-event-mapper';
import { useTicketmasterFlyerToggle } from '@/hooks/use-ticketmaster-flyer-toggle';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const router = useRouter();
  const { ticketmasterFlyerEnabled, isLoading: toggleLoading } = useTicketmasterFlyerToggle();

  if (!event) return null;

  const formatTime = (time: string) => {
    if (!time || event.isTBA) return 'Time TBA';
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
    if (!priceRange) return 'Price not available';
    const { min, max, currency } = priceRange;
    if (min === max) {
      return `${currency}${min}`;
    }
    return `${currency}${min} - ${currency}${max}`;
  };

  const handleViewTickets = () => {
    window.open(event.url, '_blank');
  };

  const handleGenerateFlyer = () => {
    // Map Ticketmaster event to Event Generator event type and details
    const mapping = mapTicketmasterEvent(
      event.name,
      event.venue,
      event.city,
      event.state,
      event.description,
      event.classification,
      event.genre,
      event.priceRange
    );

    // Navigate to Event Generator with enhanced event data
    const params = new URLSearchParams({
      eventType: mapping.eventType,
      eventName: event.name,
      eventDate: format(event.date, 'yyyy-MM-dd'),
      eventTime: event.time,
      eventVenue: event.venue,
      eventCity: event.city,
      eventState: event.state,
      eventDescription: event.description,
      eventClassification: event.classification,
      eventGenre: event.genre,
      sourceEventId: event.id,
      // Add mapped event details
      mappedEventType: mapping.eventType,
      eventDetails: JSON.stringify(mapping.eventDetails),
      styleSuggestions: JSON.stringify(mapping.styleSuggestions),
    });
    
    router.push(`/dashboard?${params.toString()}`);
    onClose();
  };

  const handleGetDirections = () => {
    const address = `${event.venue}, ${event.city}, ${event.state}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `${event.name} at ${event.venue} on ${format(event.date, 'MMM d, yyyy')}`,
          url: event.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${event.name} at ${event.venue} on ${format(event.date, 'MMM d, yyyy')} - ${event.url}`;
      await navigator.clipboard.writeText(shareText);
      // You could add a toast notification here
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Image */}
          {event.image && (
            <div className="relative rounded-lg aspect-video overflow-hidden">
              <img
                src={event.image}
                alt={event.name}
                className="size-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  {event.classification}
                </Badge>
              </div>
            </div>
          )}

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(event.date, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-sm">{formatTime(event.time)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm">{event.venue}</span>
              </div>
              
              {event.city && event.state && (
                <div className="ml-6 text-sm text-muted-foreground">
                  {event.city}, {event.state}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {event.priceRange && (
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-muted-foreground" />
                  <span className="text-sm">{formatPrice(event.priceRange)}</span>
                </div>
              )}
              
              {event.genre && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Genre: </span>
                  <span>{event.genre}</span>
                </div>
              )}
              
              {event.status && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant="outline" className="text-xs">
                    {event.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div>
                <h4 className="mb-2 font-medium">About this event</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleViewTickets} className="flex-1">
              <Ticket className="size-4 mr-2" />
              View Tickets
            </Button>
            
            {!toggleLoading && ticketmasterFlyerEnabled && (
              <Button onClick={handleGenerateFlyer} variant="outline" className="flex-1">
                <Sparkles className="size-4 mr-2" />
                Generate Flyer
              </Button>
            )}
            
            <Button onClick={handleGetDirections} variant="outline" size="sm">
              <MapPin className="size-4 mr-2" />
              Directions
            </Button>
            
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="size-4 mr-2" />
              Share
            </Button>
          </div>

          {/* External Link */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewTickets}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4 mr-2" />
              View on Ticketmaster
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 