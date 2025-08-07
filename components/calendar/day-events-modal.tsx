import { CalendarEvent } from '@/hooks/use-ticketmaster-events';
import { CalendarPersonalEvent } from '@/hooks/use-personal-events';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Calendar as CalendarIcon,
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { EventDetailModal } from './event-detail-modal';
import { mapTicketmasterEvent } from '@/lib/ticketmaster-event-mapper';
import { useTicketmasterFlyerToggle } from '@/hooks/use-ticketmaster-flyer-toggle';
import { getHolidayTypeColor } from '@/lib/holidays';

interface DayEventsModalProps {
  date: Date;
  events: CalendarEvent[];
  holidays: any[];
  personalEvents: CalendarPersonalEvent[];
  isOpen: boolean;
  onClose: () => void;
}

export function DayEventsModal({ date, events, holidays, personalEvents, isOpen, onClose }: DayEventsModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const { ticketmasterFlyerEnabled, isLoading: toggleLoading } = useTicketmasterFlyerToggle();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
    setSelectedEvent(null);
  };

  const formatTime = (time: string) => {
    if (!time) return 'Time TBA';
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

  const getEventTypeColor = (classification: string) => {
    const type = classification.toLowerCase();
    if (type.includes('concert') || type.includes('music')) return 'bg-purple-600 text-white';
    if (type.includes('sport')) return 'bg-green-600 text-white';
    if (type.includes('theatre') || type.includes('arts')) return 'bg-blue-600 text-white';
    if (type.includes('family')) return 'bg-pink-600 text-white';
    if (type.includes('comedy')) return 'bg-orange-600 text-white';
    return 'bg-slate-600 text-white';
  };



  const allItems = [
    ...events.map(event => ({ type: 'event', data: event })),
    ...holidays.map(holiday => ({ type: 'holiday', data: holiday })),
    ...personalEvents.map(event => ({ type: 'personal', data: event }))
  ];

  // Sort by time (events with times first, then holidays, then events without times)
  allItems.sort((a, b) => {
    if (a.type === 'event' && b.type === 'event') {
      const aTime = a.data.time;
      const bTime = b.data.time;
      if (aTime && bTime) {
        return aTime.localeCompare(bTime);
      }
      if (aTime && !bTime) return -1;
      if (!aTime && bTime) return 1;
      return 0;
    }
    if (a.type === 'holiday' && b.type === 'holiday') {
      return 0;
    }
    if (a.type === 'event' && b.type === 'holiday') {
      return a.data.time ? -1 : 1;
    }
    return 1;
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {allItems.length} item{allItems.length !== 1 ? 's' : ''} on this date
            </p>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {allItems.map((item, index) => (
                <div key={`${item.type}-${index}`}>
                  {item.type === 'event' ? (
                    <div
                      className="p-4 rounded-lg transition-colors hover:bg-muted/50 border cursor-pointer"
                      onClick={() => handleEventClick(item.data)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex mb-2 items-center gap-2">
                            <Ticket className="size-4 text-primary" />
                            <h3 className="font-medium truncate">{item.data.name}</h3>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-3" />
                              <span className="truncate">{item.data.venue}</span>
                            </div>
                            
                            {item.data.time && (
                              <div className="flex items-center gap-2">
                                <Clock className="size-3" />
                                <span>{formatTime(item.data.time)}</span>
                              </div>
                            )}
                            
                            {item.data.city && item.data.state && (
                              <div className="text-xs">
                                {item.data.city}, {item.data.state}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getEventTypeColor(item.data.classification)}`}
                          >
                            {item.data.classification}
                          </Badge>
                          
                          {item.data.priceRange && (
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(item.data.priceRange)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                                     ) : item.type === 'personal' ? (
                     <div className="p-4 bg-muted/30 rounded-lg border">
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex-1 min-w-0">
                           <div className="flex mb-2 items-center gap-2">
                             <Calendar className="size-4 text-primary" />
                             <h3 className="font-medium truncate">{item.data.title}</h3>
                           </div>
                           
                           <div className="space-y-1 text-sm text-muted-foreground">
                             <div className="text-xs">
                               {item.data.description}
                             </div>
                             {item.data.recurring && (
                               <div className="text-xs">
                                 Recurring yearly
                               </div>
                             )}
                           </div>
                         </div>
                         
                         <Badge
                           variant="secondary"
                           className={`text-xs ${getEventTypeColor(item.data.type)}`}
                         >
                           {item.data.type}
                         </Badge>
                       </div>
                     </div>
                   ) : (
                     <div className="p-4 bg-muted/30 rounded-lg border">
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex-1 min-w-0">
                           <div className="flex mb-2 items-center gap-2">
                             <Sparkles className="size-4 text-primary" />
                             <h3 className="font-medium truncate">{item.data.name}</h3>
                           </div>
                           
                           <div className="space-y-1 text-sm text-muted-foreground">
                             <div className="text-xs">
                               {item.data.description}
                             </div>
                             <div className="text-xs">
                               Regions: {item.data.region.join(', ')}
                             </div>
                           </div>
                         </div>
                         
                         <Badge
                           variant="secondary"
                           className={`text-xs ${getHolidayTypeColor(item.data.type)}`}
                         >
                           {item.data.type}
                         </Badge>
                       </div>
                     </div>
                   )}
                  
                  {index < allItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex pt-4 border-t justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {events.length} event{events.length !== 1 ? 's' : ''} • {holidays.length} holiday{holidays.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
              {events.length > 0 && !toggleLoading && ticketmasterFlyerEnabled && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Navigate to Event Generator with the first event
                    const firstEvent = events[0];
                    
                    // Map Ticketmaster event to Event Generator event type and details
                    const mapping = mapTicketmasterEvent(
                      firstEvent.name,
                      firstEvent.venue,
                      firstEvent.city,
                      firstEvent.state,
                      firstEvent.description,
                      firstEvent.classification,
                      firstEvent.genre,
                      firstEvent.priceRange
                    );

                    const params = new URLSearchParams({
                      eventType: mapping.eventType,
                      eventName: firstEvent.name,
                      eventDate: format(firstEvent.date, 'yyyy-MM-dd'),
                      eventTime: firstEvent.time,
                      eventVenue: firstEvent.venue,
                      eventCity: firstEvent.city,
                      eventState: firstEvent.state,
                      eventDescription: firstEvent.description,
                      eventClassification: firstEvent.classification,
                      eventGenre: firstEvent.genre,
                      sourceEventId: firstEvent.id,
                      // Add mapped event details
                      mappedEventType: mapping.eventType,
                      eventDetails: JSON.stringify(mapping.eventDetails),
                      styleSuggestions: JSON.stringify(mapping.styleSuggestions),
                    });
                    
                    window.location.href = `/dashboard?${params.toString()}`;
                  }}
                >
                  <Sparkles className="size-4 mr-2" />
                  Generate Flyer
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={handleCloseEventDetail}
      />
    </>
  );
} 