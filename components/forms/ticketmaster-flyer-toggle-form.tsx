"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ticket, Sparkles, AlertTriangle } from "lucide-react";

export function TicketmasterFlyerToggleForm() {
  const [ticketmasterFlyerEnabled, setTicketmasterFlyerEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadTicketmasterFlyerToggle() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/ticketmaster-flyer-toggle');
        if (response.ok) {
          const data = await response.json();
          setTicketmasterFlyerEnabled(data.ticketmasterFlyerEnabled);
        }
      } catch (error) {
        console.error('Error loading Ticketmaster flyer toggle:', error);
        toast.error('Failed to load Ticketmaster flyer toggle setting');
      } finally {
        setIsLoading(false);
      }
    }

    loadTicketmasterFlyerToggle();
  }, []);

  const handleToggle = async () => {
    try {
      setIsSaving(true);
      const newValue = !ticketmasterFlyerEnabled;
      
      const response = await fetch('/api/settings/ticketmaster-flyer-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketmasterFlyerEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to save Ticketmaster flyer toggle setting');
      }

      setTicketmasterFlyerEnabled(newValue);
      toast.success(
        newValue 
          ? 'Ticketmaster flyer generation enabled successfully' 
          : 'Ticketmaster flyer generation disabled successfully'
      );
    } catch (error) {
      toast.error('Failed to save Ticketmaster flyer toggle setting');
      console.error('Error saving Ticketmaster flyer toggle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/50">
              <Ticket className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Ticketmaster Flyer Generation
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                  Experimental
                </Badge>
              </CardTitle>
              <CardDescription>
                Enable automatic flyer generation from Ticketmaster events for your account
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="ticketmaster-flyer-toggle" className="text-base font-medium">
              Generate Flyers from Ticketmaster Events
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, you can click on Ticketmaster events in the calendar to automatically generate flyers using the Event Generator
            </p>
          </div>
          <Switch
            id="ticketmaster-flyer-toggle"
            checked={ticketmasterFlyerEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Experimental Warning */}
        <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="size-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Experimental Feature
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              This feature is in experimental phase. It may have bugs or unexpected behavior. 
              You can enable this feature to try Ticketmaster flyer generation.
            </p>
          </div>
        </div>

        {/* Feature Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">What this feature does:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Maps Ticketmaster events to appropriate Event Generator event types
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Pre-populates Event Generator with event details (venue, date, time, etc.)
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Provides intelligent event type detection based on classification and genre
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Seamless integration between calendar events and flyer generation
            </li>
          </ul>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Current Status:</span>
          <Badge 
            variant={ticketmasterFlyerEnabled ? "default" : "secondary"}
            className={ticketmasterFlyerEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {ticketmasterFlyerEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 