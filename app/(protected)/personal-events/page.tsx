"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Edit, Trash2, Gift, Heart, Star, Users, Home, GraduationCap, Briefcase, Plane, Camera, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PersonalEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string;
  recurring: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

interface UpcomingPersonalEvent extends PersonalEvent {
  displayDate: Date;
}

const eventTypes = [
  { value: "birthday", label: "Birthday", icon: Gift, color: "bg-pink-100 text-pink-800" },
  { value: "anniversary", label: "Anniversary", icon: Heart, color: "bg-red-100 text-red-800" },
  { value: "graduation", label: "Graduation", icon: GraduationCap, color: "bg-blue-100 text-blue-800" },
  { value: "work", label: "Work Event", icon: Briefcase, color: "bg-gray-100 text-gray-800" },
  { value: "travel", label: "Travel", icon: Plane, color: "bg-green-100 text-green-800" },
  { value: "celebration", label: "Celebration", icon: Star, color: "bg-yellow-100 text-yellow-800" },
  { value: "family", label: "Family Event", icon: Users, color: "bg-purple-100 text-purple-800" },
  { value: "home", label: "Home Event", icon: Home, color: "bg-orange-100 text-orange-800" },
  { value: "photo", label: "Photo Event", icon: Camera, color: "bg-indigo-100 text-indigo-800" },
];

const colorOptions = [
  { value: "pink", label: "Pink", class: "bg-pink-100 text-pink-800" },
  { value: "red", label: "Red", class: "bg-red-100 text-red-800" },
  { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-800" },
  { value: "green", label: "Green", class: "bg-green-100 text-green-800" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-100 text-yellow-800" },
  { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-800" },
  { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-800" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-100 text-indigo-800" },
  { value: "gray", label: "Gray", class: "bg-gray-100 text-gray-800" },
];

export default function PersonalEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "birthday",
    description: "",
    recurring: true,
    color: "pink",
  });

  // Load events from database on mount
  useEffect(() => {
    console.log("🔄 Component mounted - loading events from database");
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/personal-events');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Events loaded from database:", data.length, "events");
        setEvents(data);
      } catch (error) {
        console.error("Failed to load personal events from database:", error);
        toast.error("Failed to load events. Please try again.");
        setEvents([]);
      } finally {
        setIsLoading(false);
        console.log("✅ Loading complete");
      }
    };

    loadEvents();
  }, []);

  // No longer need to save to localStorage - events are saved to database via API calls

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      type: "birthday",
      description: "",
      recurring: true,
      color: "pink",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Immediate visual feedback
    toast.info("Processing event submission...");
    
    if (!formData.title || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Validate and format the date
      if (!formData.date) {
        toast.error("Please select a date");
        return;
      }

      const eventData = {
        title: formData.title,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        recurring: formData.recurring,
        color: formData.color,
      };

      console.log("Form submitted. Current events count:", events.length);
      console.log("Event data:", eventData);
      console.log("Date value:", formData.date);
      console.log("Date type:", typeof formData.date);

      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/personal-events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedEvent = await response.json();
        const updatedEvents = events.map(event => event.id === editingEvent.id ? updatedEvent : event);
        setEvents(updatedEvents);
        toast.success("Event updated successfully");
      } else {
        // Create new event
        const response = await fetch('/api/personal-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newEvent = await response.json();
        setEvents([...events, newEvent]);
        toast.success("Event added successfully");
      }

      setIsAddDialogOpen(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event. Please try again.");
    }
  };

  const handleEdit = (event: PersonalEvent) => {
    setEditingEvent(event);
    // Convert date to YYYY-MM-DD format for HTML date input
    const dateForInput = new Date(event.date).toISOString().split('T')[0];
    setFormData({
      title: event.title,
      date: dateForInput,
      type: event.type,
      description: event.description || "",
      recurring: event.recurring,
      color: event.color,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/personal-events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const filteredEvents = events.filter(event => event.id !== eventId);
      console.log("Deleting event:", eventId, "Remaining events count:", filteredEvents.length);
      setEvents(filteredEvents);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    }
  };

  // Function to navigate to Event Generator with personal event data
  const handleGenerateFlyer = (event: PersonalEvent) => {
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
      eventDate: event.date,
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
        date: event.date,
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

  // Database storage functions - no longer need localStorage functions

  // Debug: Log every events state change
  useEffect(() => {
    console.log("🔄 Events state changed:", {
      count: events.length,
      events: events,
      timestamp: new Date().toISOString()
    });
  }, [events]);

  // Debug: Log component lifecycle
  useEffect(() => {
    console.log("🔄 Personal Events component mounted");
    
    // Listen for storage events (when localStorage is modified by other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "personalEvents") {
        console.log("🔄 Storage event detected:", {
          key: e.key,
          oldValue: e.oldValue,
          newValue: e.newValue,
          url: e.url
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      console.log("🔄 Personal Events component unmounting");
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getEventTypeIcon = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.icon : Calendar;
  };

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.color : "bg-slate-100 text-slate-800";
  };

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(co => co.value === color);
    return colorOption ? colorOption.class : "bg-pink-100 text-pink-800";
  };

  // Helper function to format dates consistently
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    // Ensure we're working with the date in local timezone
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const localDate = new Date(year, month, day);
    return format(localDate, 'EEEE, MMMM d, yyyy');
  };

  const upcomingEvents: UpcomingPersonalEvent[] = events
    .filter(event => {
      const originalDate = new Date(event.date);
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Create a new date object for comparison using UTC to avoid timezone issues
      const year = originalDate.getUTCFullYear();
      const month = originalDate.getUTCMonth();
      const day = originalDate.getUTCDate();
      const eventDate = new Date(year, month, day);
      eventDate.setFullYear(currentYear);
      
      // If event date has passed this year, set it to next year
      if (eventDate < today) {
        eventDate.setFullYear(currentYear + 1);
      }
      
      return eventDate >= today;
    })
    .map(event => {
      const originalDate = new Date(event.date);
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Create a new date object for display using UTC to avoid timezone issues
      const year = originalDate.getUTCFullYear();
      const month = originalDate.getUTCMonth();
      const day = originalDate.getUTCDate();
      const displayDate = new Date(year, month, day);
      displayDate.setFullYear(currentYear);
      
      // If event date has passed this year, set it to next year
      if (displayDate < today) {
        displayDate.setFullYear(currentYear + 1);
      }
      
      console.log(`Event: ${event.title}`, {
        originalDate: originalDate.toISOString(),
        displayDate: displayDate.toISOString(),
        currentYear,
        hasPassed: displayDate < today
      });
      
      return {
        ...event,
        displayDate: displayDate
      };
    })
    .sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime())
    .slice(0, 5);

  return (
    <div className="container p-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personal Events</h1>
          <p className="text-muted-foreground">
            Manage your important dates and celebrations
          </p>
          <p className="text-sm text-muted-foreground">
            Current events: {events.length} | Loading: {isLoading ? "Yes" : "No"}
          </p>
        </div>
        {/* Debug buttons removed - now using database storage */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEvent(null);
                resetForm();
              }}>
                <Plus className="size-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mom's Birthday"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="size-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`size-4 rounded-full ${color.class.split(' ')[0]}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="recurring">Recurring event (yearly)</Label>
              </div>

              <div className="flex pt-4 gap-2">
                <Button type="submit" className="flex-1">
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const Icon = getEventTypeIcon(event.type);
                const eventDate = event.displayDate || new Date(event.date);
                const today = new Date();

                const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={event.id}
                    className="flex p-3 rounded-lg transition-colors hover:bg-muted/50 items-center justify-between border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getColorClass(event.color)}`}>
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(eventDate, 'EEEE, MMMM d, yyyy')}
                          {daysUntil === 0 && " (Today!)"}
                          {daysUntil === 1 && " (Tomorrow!)"}
                          {daysUntil > 1 && ` (in ${daysUntil} days)`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                        {eventTypes.find(et => et.value === event.type)?.label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateFlyer(event);
                        }}
                      >
                        <Sparkles className="size-4 mr-2" />
                        Generate Flyer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle>All Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="size-12 mx-auto mb-4 opacity-50" />
              <p>No personal events yet</p>
              <p className="text-sm">Add your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => {
                  const Icon = getEventTypeIcon(event.type);
                  return (
                    <div
                      key={event.id}
                      className="flex p-4 rounded-lg transition-colors hover:bg-muted/50 items-center justify-between border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getColorClass(event.color)}`}>
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatEventDate(event.date)}
                          </div>
                          {event.description && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                          {eventTypes.find(et => et.value === event.type)?.label}
                        </Badge>
                        {event.recurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateFlyer(event);
                          }}
                        >
                          <Sparkles className="size-4 mr-2" />
                          Generate Flyer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{event.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(event.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 