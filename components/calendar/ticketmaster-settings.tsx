import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  MapPin, 
  Calendar, 
  Ticket, 
  Globe, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export interface TicketmasterSettings {
  enabled: boolean;
  location: {
    city: string;
    stateCode: string;
    countryCode: string;
  };
  displayOptions: {
    showEvents: boolean;
    showHolidays: boolean;
    maxEventsPerDay: number;
    showEventDetails: boolean;
    showPrices: boolean;
    showVenues: boolean;
  };
  searchOptions: {
    searchRadius: number; // in miles
    includeOnlineEvents: boolean;
    includeFreeEvents: boolean;
    maxDaysAhead: number;
  };
  notifications: {
    newEventsAlert: boolean;
    priceDropAlert: boolean;
    eventReminders: boolean;
  };
}

export const defaultTicketmasterSettings: TicketmasterSettings = {
  enabled: true,
  location: {
    city: "New York",
    stateCode: "NY",
    countryCode: "US",
  },
  displayOptions: {
    showEvents: true,
    showHolidays: true,
    maxEventsPerDay: 5,
    showEventDetails: true,
    showPrices: true,
    showVenues: true,
  },
  searchOptions: {
    searchRadius: 50,
    includeOnlineEvents: true,
    includeFreeEvents: true,
    maxDaysAhead: 90,
  },
  notifications: {
    newEventsAlert: false,
    priceDropAlert: false,
    eventReminders: false,
  },
};

interface TicketmasterSettingsProps {
  settings: TicketmasterSettings;
  onSettingsChange: (settings: TicketmasterSettings) => void;
  onTestConnection?: () => Promise<{ success: boolean; message: string }>;
}

export function TicketmasterSettings({ 
  settings, 
  onSettingsChange, 
  onTestConnection 
}: TicketmasterSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSettingChange = (path: string, value: any) => {
    const newSettings = { ...settings };
    const keys = path.split('.');
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onSettingsChange(newSettings);
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('ticketmasterSettings', JSON.stringify(settings));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="size-4" />
          Ticketmaster Settings
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-5" />
            Ticketmaster Event Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-4" />
                Enable Ticketmaster Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled" className="text-base font-medium">
                    Show Ticketmaster events on calendar
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, real-time events from Ticketmaster will appear on your calendar
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4" />
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.location.city}
                    onChange={(e) => handleSettingChange('location.city', e.target.value)}
                    placeholder="Enter city name"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={settings.location.stateCode}
                    onChange={(e) => handleSettingChange('location.stateCode', e.target.value)}
                    placeholder="State code (e.g., NY)"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={settings.location.countryCode}
                    onValueChange={(value) => handleSettingChange('location.countryCode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {onTestConnection && (
                <div className="flex pt-2 items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="gap-2"
                  >
                    {isTesting ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle className="size-4" />
                    )}
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>
                  
                  {testResult && (
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : (
                        <XCircle className="size-4 text-red-500" />
                      )}
                      <span className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResult.message}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-4" />
                Display Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEvents">Show events</Label>
                    <p className="text-sm text-muted-foreground">Display Ticketmaster events on calendar</p>
                  </div>
                  <Switch
                    id="showEvents"
                    checked={settings.displayOptions.showEvents}
                    onCheckedChange={(checked) => handleSettingChange('displayOptions.showEvents', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showHolidays">Show holidays</Label>
                    <p className="text-sm text-muted-foreground">Display holidays alongside events</p>
                  </div>
                  <Switch
                    id="showHolidays"
                    checked={settings.displayOptions.showHolidays}
                    onCheckedChange={(checked) => handleSettingChange('displayOptions.showHolidays', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEventDetails">Show event details</Label>
                    <p className="text-sm text-muted-foreground">Display venue, time, and other details</p>
                  </div>
                  <Switch
                    id="showEventDetails"
                    checked={settings.displayOptions.showEventDetails}
                    onCheckedChange={(checked) => handleSettingChange('displayOptions.showEventDetails', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showPrices">Show prices</Label>
                    <p className="text-sm text-muted-foreground">Display ticket price ranges</p>
                  </div>
                  <Switch
                    id="showPrices"
                    checked={settings.displayOptions.showPrices}
                    onCheckedChange={(checked) => handleSettingChange('displayOptions.showPrices', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="maxEventsPerDay">Maximum events per day</Label>
                <Select
                  value={settings.displayOptions.maxEventsPerDay.toString()}
                  onValueChange={(value) => handleSettingChange('displayOptions.maxEventsPerDay', parseInt(value))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 events</SelectItem>
                    <SelectItem value="5">5 events</SelectItem>
                    <SelectItem value="10">10 events</SelectItem>
                    <SelectItem value="15">15 events</SelectItem>
                    <SelectItem value="20">20 events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Search Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-4" />
                Search Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeOnlineEvents">Include online events</Label>
                    <p className="text-sm text-muted-foreground">Show virtual and streaming events</p>
                  </div>
                  <Switch
                    id="includeOnlineEvents"
                    checked={settings.searchOptions.includeOnlineEvents}
                    onCheckedChange={(checked) => handleSettingChange('searchOptions.includeOnlineEvents', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeFreeEvents">Include free events</Label>
                    <p className="text-sm text-muted-foreground">Show events with no cost</p>
                  </div>
                  <Switch
                    id="includeFreeEvents"
                    checked={settings.searchOptions.includeFreeEvents}
                    onCheckedChange={(checked) => handleSettingChange('searchOptions.includeFreeEvents', checked)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchRadius">Search radius (miles)</Label>
                  <Select
                    value={settings.searchOptions.searchRadius.toString()}
                    onValueChange={(value) => handleSettingChange('searchOptions.searchRadius', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                      <SelectItem value="250">250 miles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="maxDaysAhead">Look ahead (days)</Label>
                  <Select
                    value={settings.searchOptions.maxDaysAhead.toString()}
                    onValueChange={(value) => handleSettingChange('searchOptions.maxDaysAhead', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newEventsAlert">New events alert</Label>
                    <p className="text-sm text-muted-foreground">Notify when new events are added</p>
                  </div>
                  <Switch
                    id="newEventsAlert"
                    checked={settings.notifications.newEventsAlert}
                    onCheckedChange={(checked) => handleSettingChange('notifications.newEventsAlert', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="priceDropAlert">Price drop alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when ticket prices decrease</p>
                  </div>
                  <Switch
                    id="priceDropAlert"
                    checked={settings.notifications.priceDropAlert}
                    onCheckedChange={(checked) => handleSettingChange('notifications.priceDropAlert', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="eventReminders">Event reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind before events you're interested in</p>
                  </div>
                  <Switch
                    id="eventReminders"
                    checked={settings.notifications.eventReminders}
                    onCheckedChange={(checked) => handleSettingChange('notifications.eventReminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex pt-4 border-t justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 