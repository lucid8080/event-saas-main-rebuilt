'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, Globe, Star } from 'lucide-react';
import { 
  getHolidayOptionsForEventGenerator, 
  getHolidaysByType, 
  getHolidayDetailsByName,
  getHolidayTypeColor,
  getUpcomingHolidays,
  type HolidayPreferences,
  type Holiday
} from '@/lib/holidays';

interface HolidaySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  preferences?: HolidayPreferences;
  className?: string;
}

export function HolidaySelector({ 
  value, 
  onValueChange, 
  preferences,
  className 
}: HolidaySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [holidaysByType, setHolidaysByType] = useState<Record<string, Holiday[]>>({});
  const [allHolidays, setAllHolidays] = useState<string[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    // Try to get user preferences from localStorage (from calendar page)
    let userPrefs = preferences;
    if (!userPrefs) {
      try {
        const savedPreferences = localStorage.getItem('holidayPreferences');
        if (savedPreferences) {
          userPrefs = JSON.parse(savedPreferences);
        }
      } catch (error) {
        console.warn('Could not load holiday preferences from localStorage:', error);
      }
    }
    
    // Fallback to default preferences if none found
    const prefs = userPrefs || {
      regions: ["Canada", "UK", "USA", "India", "Islamic", "Global"],
      types: ["Public Holiday", "Religious (Christian)", "Religious (Hindu)", "Religious (Sikh)", "Religious (Islam)", "Cultural", "Cultural/Religious"]
    };
    
    setAllHolidays(getHolidayOptionsForEventGenerator(prefs));
    setHolidaysByType(getHolidaysByType(prefs));
    setUpcomingHolidays(getUpcomingHolidays(prefs, 5)); // Get next 5 upcoming holidays
  }, [preferences]);

  const filteredHolidays = allHolidays.filter(holiday => {
    const matchesSearch = holiday.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || 
      (holidaysByType[selectedType]?.some(h => h.name === holiday));
    return matchesSearch && matchesType;
  });

  const holidayTypes = Object.keys(holidaysByType).sort();

  const getHolidayInfo = (holidayName: string) => {
    if (holidayName === 'Other') return null;
    return getHolidayDetailsByName(holidayName);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="holiday-select">Select Holiday</Label>
        
        {/* Search and Filter Controls */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute size-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {holidayTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Holiday Selection */}
      <div className="space-y-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a holiday..." />
          </SelectTrigger>
          <SelectContent className="max-h-96">
            {filteredHolidays.map(holiday => {
              const holidayInfo = getHolidayInfo(holiday);
              return (
                <SelectItem key={holiday} value={holiday}>
                  <div className="flex items-center gap-2">
                    <span>{holiday}</span>
                    {holidayInfo && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getHolidayTypeColor(holidayInfo.type)}`}
                      >
                        {holidayInfo.type}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Holiday Details */}
      {value && value !== 'Other' && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex text-sm items-center gap-2">
              <Calendar className="size-4" />
              {value}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const holidayInfo = getHolidayInfo(value);
              if (!holidayInfo) return null;
              
              return (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getHolidayTypeColor(holidayInfo.type)}
                    >
                      {holidayInfo.type}
                    </Badge>
                    <div className="flex text-muted-foreground items-center gap-1">
                      <Globe className="size-3" />
                      <span>{holidayInfo.region.join(', ')}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{holidayInfo.description}</p>
                  <div className="flex text-muted-foreground items-center gap-1">
                    <Star className="size-3" />
                    <span>{holidayInfo.date}</span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Holidays Suggestions */}
      {!value && upcomingHolidays.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex text-sm items-center gap-2">
              <Calendar className="size-4" />
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {upcomingHolidays.map((holiday, index) => (
                <div 
                  key={index}
                  className="flex p-2 rounded-md transition-colors hover:bg-muted/50 items-center justify-between cursor-pointer"
                  onClick={() => onValueChange(holiday.name)}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{holiday.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getHolidayTypeColor(holiday.type)}`}
                  >
                    {holiday.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday Categories Preview */}
      {!value && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Available Holiday Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {holidayTypes.map(type => (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className={`text-xs cursor-pointer hover:bg-primary/10 ${getHolidayTypeColor(type)}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type} ({holidaysByType[type]?.length || 0})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 