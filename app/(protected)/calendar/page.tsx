"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Settings, Sparkles, Ticket, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  holidays, 
  getHolidaysForDate, 
  getUpcomingHolidays, 
  getHolidayTypeColor, 
  type HolidayPreferences, 
  defaultHolidayPreferences 
} from "@/lib/holidays";
import { useTicketmasterEvents, type CalendarEvent } from "@/hooks/use-ticketmaster-events";
import { usePersonalEvents, type CalendarPersonalEvent } from "@/hooks/use-personal-events";
import { EventBadge, EventList } from "@/components/calendar/event-badge";
import { EventDetailModal } from "@/components/calendar/event-detail-modal";
import { DayEventsModal } from "@/components/calendar/day-events-modal";
import { TicketmasterSettings, defaultTicketmasterSettings, type TicketmasterSettings as TicketmasterSettingsType } from "@/components/calendar/ticketmaster-settings";

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidayPreferences, setHolidayPreferences] = useState<HolidayPreferences>(defaultHolidayPreferences);
  const [upcomingHolidays, setUpcomingHolidays] = useState(getUpcomingHolidays(defaultHolidayPreferences));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [ticketmasterSettings, setTicketmasterSettings] = useState<TicketmasterSettingsType>(defaultTicketmasterSettings);
  
  // Collapsible sidebar sections state
  const [isHolidaysCollapsed, setIsHolidaysCollapsed] = useState(false);
  const [isPersonalEventsCollapsed, setIsPersonalEventsCollapsed] = useState(false);
  const [isUpcomingEventsCollapsed, setIsUpcomingEventsCollapsed] = useState(false);
  const [isHolidayTypesCollapsed, setIsHolidayTypesCollapsed] = useState(false);
  
  // Ticketmaster events hook
  const {
    events: ticketmasterEvents,
    loading: eventsLoading,
    error: eventsError,
    getEventsForDateRange,
    getUpcomingEvents,
  } = useTicketmasterEvents();

  // Personal events hook
  const {
    events: personalEvents,
    getEventsForDate: getPersonalEventsForDate,
    getUpcomingEvents: getUpcomingPersonalEvents,
  } = usePersonalEvents();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('holidayPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setHolidayPreferences(preferences);
      setUpcomingHolidays(getUpcomingHolidays(preferences));
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('holidayPreferences', JSON.stringify(holidayPreferences));
    setUpcomingHolidays(getUpcomingHolidays(holidayPreferences));
  }, [holidayPreferences]);

  // Load Ticketmaster settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('ticketmasterSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTicketmasterSettings(settings);
      } catch (error) {
        console.error('Failed to parse Ticketmaster settings:', error);
      }
    }
  }, []);

  // Save Ticketmaster settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ticketmasterSettings', JSON.stringify(ticketmasterSettings));
  }, [ticketmasterSettings]);

  // Load events for current month
  useEffect(() => {
    if (!ticketmasterSettings.enabled) {
      console.log('Ticketmaster events disabled in settings');
      return;
    }

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get user's location from settings
    const userLocation = ticketmasterSettings.location;
    
    console.log('Loading events for date range:', {
      start: monthStart,
      end: monthEnd,
      location: userLocation,
      settings: ticketmasterSettings,
    });
    
    // Try to get events for the month, fallback to upcoming events if date range fails
    getEventsForDateRange(monthStart, monthEnd, userLocation).catch((error) => {
      console.log('Date range failed, trying upcoming events:', error);
      // Fallback to upcoming events
      getUpcomingEvents(userLocation, ticketmasterSettings.searchOptions.maxDaysAhead);
    });
  }, [currentDate, getEventsForDateRange, getUpcomingEvents, ticketmasterSettings]);

  // Debug logging for events
  useEffect(() => {
    console.log('Ticketmaster events state:', {
      eventsCount: ticketmasterEvents.length,
      events: ticketmasterEvents.slice(0, 3), // First 3 events
      loading: eventsLoading,
      error: eventsError,
    });
  }, [ticketmasterEvents, eventsLoading, eventsError]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleRegionToggle = (region: string) => {
    setHolidayPreferences(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleTypeToggle = (type: string) => {
    setHolidayPreferences(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handleHolidayClick = (holiday: any) => {
    // Navigate to Event Generator with holiday data
    const params = new URLSearchParams({
      eventType: 'HOLIDAY_CELEBRATION',
      holiday: holiday.name,
      holidayType: holiday.type,
      holidayDate: holiday.date,
      holidayRegions: holiday.region.join(','),
      holidayDescription: holiday.description
    });
    
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handlePersonalEventClick = (event: CalendarPersonalEvent) => {
    // Map personal event type to Event Generator event type
    const mapPersonalEventType = (type: string): string => {
      const typeMapping: Record<string, string> = {
        'birthday': 'BIRTHDAY_PARTY',
        'anniversary': 'WEDDING',
        'graduation': 'CORPORATE_EVENT',
        'work': 'CORPORATE_EVENT',
        'travel': 'OTHER',
        'celebration': 'BIRTHDAY_PARTY',
        'family': 'OTHER',
        'home': 'OTHER',
        'photo': 'OTHER'
      };
      return typeMapping[type] || 'OTHER';
    };

    // Navigate to Event Generator with personal event data
    const params = new URLSearchParams({
      eventType: mapPersonalEventType(event.type),
      eventName: event.title,
      eventDate: format(event.date, 'yyyy-MM-dd'),
      eventDescription: event.description || `${event.title} celebration`,
      personalEventType: event.type,
      personalEventColor: event.color,
      personalEventRecurring: event.recurring.toString(),
      sourceEventId: event.id,
      // Add personal event specific details
      mappedEventType: mapPersonalEventType(event.type),
      eventDetails: JSON.stringify({
        eventName: event.title,
        description: event.description || `${event.title} celebration`,
        date: format(event.date, 'yyyy-MM-dd'),
        type: event.type,
        color: event.color,
        recurring: event.recurring
      }),
      styleSuggestions: JSON.stringify([
        'Personal celebration style',
        'Intimate gathering aesthetic',
        'Warm and welcoming design'
      ]),
    });
    
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleDayClick = (day: Date, dayEvents: CalendarEvent[], dayHolidays: any[], dayPersonalEvents: CalendarPersonalEvent[]) => {
    const totalItems = dayEvents.length + dayHolidays.length + dayPersonalEvents.length;
    
    if (totalItems > 1) {
      // Show day events modal for multiple items
      setSelectedDate(day);
      setShowDayEventsModal(true);
    } else if (totalItems === 1) {
      // Show single event/holiday directly
      if (dayEvents.length === 1) {
        handleEventClick(dayEvents[0]);
      } else if (dayHolidays.length === 1) {
        handleHolidayClick(dayHolidays[0]);
      } else if (dayPersonalEvents.length === 1) {
        handlePersonalEventClick(dayPersonalEvents[0]);
      }
    }
  };

  const testTicketmasterConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/debug/ticketmaster-status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.apiTest?.success && data.dateRangeTest?.success) {
        return {
          success: true,
          message: `Connection successful! Found ${data.apiTest.eventsFound} events in test search.`
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${data.apiTest?.error || data.dateRangeTest?.error || 'Unknown error'}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to test connection'
      };
    }
  };

  const allRegions = Array.from(new Set(holidays.flatMap(h => h.region))).sort();
  const allTypes = Array.from(new Set(holidays.map(h => h.type))).sort();

  const getColorClass = (color: string) => {
    const colorOptions: Record<string, string> = {
      'pink': 'bg-pink-600 text-white',
      'red': 'bg-red-600 text-white',
      'blue': 'bg-blue-600 text-white',
      'green': 'bg-green-600 text-white',
      'yellow': 'bg-amber-600 text-white',
      'purple': 'bg-purple-600 text-white',
      'orange': 'bg-orange-600 text-white',
      'indigo': 'bg-indigo-600 text-white',
      'gray': 'bg-slate-600 text-white',
    };
    return colorOptions[color] || 'bg-pink-600 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View holidays and important dates
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Personal Events Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/personal-events')}
          >
            <Calendar className="size-4 mr-2" />
            Personal Events
          </Button>

          {/* Holiday Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="size-4 mr-2" />
                Holiday Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Holiday Preferences</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Regions</Label>
                  <div className="mt-2 space-y-2">
                    {allRegions.map((region) => (
                      <div key={region} className="flex space-x-2 items-center">
                        <Checkbox
                          id={`region-${region}`}
                          checked={holidayPreferences.regions.includes(region)}
                          onCheckedChange={() => handleRegionToggle(region)}
                        />
                        <Label htmlFor={`region-${region}`} className="text-sm">
                          {region}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-base font-medium">Holiday Types</Label>
                  <div className="mt-2 space-y-2">
                    {allTypes.map((type) => (
                      <div key={type} className="flex space-x-2 items-center">
                        <Checkbox
                          id={`type-${type}`}
                          checked={holidayPreferences.types.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Ticketmaster Settings */}
          <TicketmasterSettings
            settings={ticketmasterSettings}
            onSettingsChange={setTicketmasterSettings}
            onTestConnection={testTicketmasterConnection}
          />



          {/* Test Load Events */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              console.log('Manually triggering events load...');
              const startDate = new Date();
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + ticketmasterSettings.searchOptions.maxDaysAhead);
              
              try {
                await getEventsForDateRange(startDate, endDate, ticketmasterSettings.location);
                console.log('Manual events load completed');
              } catch (error) {
                console.error('Manual events load failed:', error);
              }
            }}
          >
            Load Events
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm text-muted-foreground font-medium">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    
                    // Get events for this day (respect settings)
                    const dayEvents = ticketmasterSettings.displayOptions.showEvents 
                      ? ticketmasterEvents.filter(event => isSameDay(event.date, day))
                      : [];
                    
                    // Get holidays for this day (respect settings)
                    const dayHolidays = ticketmasterSettings.displayOptions.showHolidays 
                      ? getHolidaysForDate(day, holidayPreferences)
                      : [];
                    
                    // Get personal events for this day
                    const dayPersonalEvents = getPersonalEventsForDate(day);
                    
                    const totalItems = dayEvents.length + dayHolidays.length + dayPersonalEvents.length;
                    const hasMultipleItems = totalItems > 1;
                    
                    return (
                      <Tooltip key={day.toISOString()}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              min-h-[80px] cursor-pointer rounded-md border p-2 transition-colors
                              ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                              ${isToday ? 'ring-2 ring-primary' : ''}
                              ${hasMultipleItems ? 'hover:bg-primary/10 hover:border-primary/50' : 'hover:bg-muted/80'}
                            `}
                            onClick={() => handleDayClick(day, dayEvents, dayHolidays, dayPersonalEvents)}
                          >
                            <div className="mb-1 text-sm font-medium">
                              {format(day, 'd')}
                            </div>
                            <div className="space-y-1">
                              {/* Holidays */}
                              {dayHolidays.slice(0, 1).map((holiday, index) => (
                                <Badge
                                  key={`holiday-${index}`}
                                  variant="secondary"
                                  className={`px-1 py-0.5 text-xs transition-colors ${getHolidayTypeColor(holiday.type)}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Sparkles className="size-3" />
                                    <span className="max-w-16 truncate">{holiday.name}</span>
                                  </div>
                                </Badge>
                              ))}
                              
                              {/* Events */}
                              {dayEvents.slice(0, 1).map((event, index) => (
                                <Badge
                                  key={`event-${index}`}
                                  variant="secondary"
                                  className="px-1 py-0.5 bg-purple-100 text-xs text-purple-800 transition-colors"
                                >
                                  <div className="flex items-center gap-1">
                                    <Ticket className="size-3" />
                                    <span className="max-w-16 truncate">{event.name}</span>
                                  </div>
                                </Badge>
                              ))}
                              
                              {/* Personal Events */}
                              {dayPersonalEvents.slice(0, 1).map((event, index) => (
                                <Badge
                                  key={`personal-${index}`}
                                  variant="secondary"
                                  className={`px-1 py-0.5 text-xs transition-colors ${getColorClass(event.color)}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    <span className="max-w-16 truncate">{event.title}</span>
                                  </div>
                                </Badge>
                              ))}
                              
                              {/* Show count for additional items */}
                              {((dayHolidays.length > 1) || (dayEvents.length > 1) || (dayPersonalEvents.length > 1) || 
                                (dayHolidays.length > 0 && dayEvents.length > 0) || 
                                (dayHolidays.length > 0 && dayPersonalEvents.length > 0) || 
                                (dayEvents.length > 0 && dayPersonalEvents.length > 0)) && (
                                <Badge variant="outline" className="px-1 py-0.5 text-xs">
                                  +{Math.max(0, dayHolidays.length - 1) + Math.max(0, dayEvents.length - 1) + Math.max(0, dayPersonalEvents.length - 1)} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-2">
                            <div className="font-medium">
                              {format(day, 'EEEE, MMMM d, yyyy')}
                            </div>
                            
                            {/* Holidays in tooltip */}
                            {dayHolidays.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">Holidays:</div>
                                {dayHolidays.map((holiday, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-medium">{holiday.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {holiday.type} • {holiday.region.join(', ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Events in tooltip */}
                            {dayEvents.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">Events:</div>
                                {dayEvents.map((event, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-medium">{event.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {event.venue} • {event.classification}
                                    </div>
                                    {event.time && (
                                      <div className="text-xs text-muted-foreground">
                                        {event.time}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Personal Events in tooltip */}
                            {dayPersonalEvents.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground font-medium">Personal Events:</div>
                                {dayPersonalEvents.map((event, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {event.type} • {event.recurring ? 'Recurring' : 'One-time'}
                                    </div>
                                    {event.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {event.description}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {dayHolidays.length === 0 && dayEvents.length === 0 && dayPersonalEvents.length === 0 && (
                              <div className="text-sm text-muted-foreground">
                                No events on this date
                              </div>
                            )}
                              
                              {hasMultipleItems && (
                                <div className="mt-2 text-xs text-primary font-medium">
                                  Click to view all {totalItems} items
                                </div>
                              )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Holidays */}
          <Card>
            <Collapsible open={!isHolidaysCollapsed} onOpenChange={(open) => setIsHolidaysCollapsed(!open)}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <CardTitle className="text-lg flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
                    <span>Upcoming Holidays</span>
                    {isHolidaysCollapsed ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronUp className="size-4" />
                    )}
                  </CardTitle>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingHolidays.length > 0 ? (
                      upcomingHolidays.map((holiday, index) => (
                        <div 
                          key={index} 
                          className="p-2 space-y-2 rounded-md transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleHolidayClick(holiday)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex text-sm font-medium items-center gap-2">
                                <Sparkles className="size-3 text-primary" />
                                {holiday.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(holiday.date), 'EEEE, MMMM d')}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getHolidayTypeColor(holiday.type)}`}
                            >
                              {holiday.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {holiday.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Regions: {holiday.region.join(', ')}
                          </div>
                          {index < upcomingHolidays.length - 1 && <Separator />}
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No upcoming holidays with current preferences
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Upcoming Personal Events */}
          <Card>
            <Collapsible open={!isPersonalEventsCollapsed} onOpenChange={(open) => setIsPersonalEventsCollapsed(!open)}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <CardTitle className="text-lg flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
                    <span>Upcoming Personal Events</span>
                    {isPersonalEventsCollapsed ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronUp className="size-4" />
                    )}
                  </CardTitle>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    {getUpcomingPersonalEvents().length > 0 ? (
                      getUpcomingPersonalEvents().slice(0, 5).map((event, index) => (
                        <div 
                          key={event.id} 
                          className="p-2 space-y-2 rounded-md transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => handlePersonalEventClick(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex text-sm font-medium items-center gap-2">
                                <Calendar className="size-3 text-primary" />
                                <span className="truncate">{event.title}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(event.date), 'EEEE, MMMM d')}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getColorClass(event.color)}`}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          {event.description && (
                            <div className="text-xs text-muted-foreground">
                              {event.description}
                            </div>
                          )}
                          {event.recurring && (
                            <div className="text-xs text-muted-foreground">
                              Recurring yearly
                            </div>
                          )}
                          {index < Math.min(getUpcomingPersonalEvents().length, 5) - 1 && <Separator />}
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No upcoming personal events
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <Collapsible open={!isUpcomingEventsCollapsed} onOpenChange={(open) => setIsUpcomingEventsCollapsed(!open)}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <CardTitle className="text-lg flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
                    <span>
                      {ticketmasterSettings.enabled ? 'Upcoming Events' : 'Upcoming Events (Disabled)'}
                      {eventsLoading && <span className="ml-2 text-sm text-muted-foreground">(Loading...)</span>}
                      {eventsError && <span className="ml-2 text-sm text-red-500">(Error: {eventsError})</span>}
                      {!eventsLoading && !eventsError && ticketmasterSettings.enabled && (
                        <span className="ml-2 text-sm text-muted-foreground">({ticketmasterEvents.length} events)</span>
                      )}
                    </span>
                    {isUpcomingEventsCollapsed ? (
                      <ChevronDown className="size-4 flex-shrink-0" />
                    ) : (
                      <ChevronUp className="size-4 flex-shrink-0" />
                    )}
                  </CardTitle>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  {!ticketmasterSettings.enabled ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Ticketmaster events are disabled. Enable them in settings to see upcoming events.
                    </div>
                  ) : eventsLoading ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Loading events...
                    </div>
                  ) : eventsError ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      {eventsError}
                    </div>
                  ) : ticketmasterEvents.length > 0 ? (
                    <div className="space-y-3">
                      {ticketmasterEvents.slice(0, 5).map((event, index) => (
                        <div 
                          key={event.id} 
                          className="p-2 space-y-2 rounded-md transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex text-sm font-medium items-center gap-2">
                                <Ticket className="size-3 text-primary" />
                                <span className="truncate">{event.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(event.date, 'EEEE, MMMM d')}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-xs text-purple-800"
                            >
                              {event.classification}
                            </Badge>
                          </div>
                          <div className="flex text-xs text-muted-foreground items-center gap-1">
                            <MapPin className="size-3" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          {event.time && (
                            <div className="text-xs text-muted-foreground">
                              {event.time}
                            </div>
                          )}
                          {index < Math.min(ticketmasterEvents.length, 5) - 1 && <Separator />}
                        </div>
                      ))}
                      {ticketmasterEvents.length > 5 && (
                        <div className="text-center">
                          <Button variant="ghost" size="sm" className="text-xs">
                            View all {ticketmasterEvents.length} events
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No upcoming events found
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Holiday Type Legend */}
          <Card>
            <Collapsible open={!isHolidayTypesCollapsed} onOpenChange={(open) => setIsHolidayTypesCollapsed(!open)}>
              <CardHeader>
                <CollapsibleTrigger asChild>
                  <CardTitle className="text-lg flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
                    <span>Holiday Types</span>
                    {isHolidayTypesCollapsed ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronUp className="size-4" />
                    )}
                  </CardTitle>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-2">
                    {allTypes.map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <div className={`size-3 rounded-full ${getHolidayTypeColor(type).split(' ')[0]}`} />
                        <span className="text-sm">{type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
      />

      {/* Day Events Modal */}
      {selectedDate && (
        <DayEventsModal
          date={selectedDate}
          events={ticketmasterEvents.filter(event => isSameDay(event.date, selectedDate))}
          holidays={getHolidaysForDate(selectedDate, holidayPreferences)}
          personalEvents={getPersonalEventsForDate(selectedDate)}
          isOpen={showDayEventsModal}
          onClose={() => {
            setShowDayEventsModal(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
} 