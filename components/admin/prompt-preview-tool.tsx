'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Info, Eye, Zap, FileText, Copy, Image, Settings } from 'lucide-react';

interface PromptPreviewToolProps {
  className?: string;
}

interface EventDetails {
  [key: string]: string | number;
}

interface PromptQuality {
  hasTextControl: boolean;
  hasQualityControl: boolean;
  hasStyleDescription: boolean;
  length: number;
  issues: string[];
  suggestions: string[];
}

export function PromptPreviewTool({ className }: PromptPreviewToolProps) {
  const [selectedEventType, setSelectedEventType] = useState<string>('WEDDING');
  const [selectedStylePreset, setSelectedStylePreset] = useState<string>('Golden Harmony');
  const [eventDetails, setEventDetails] = useState<EventDetails>({});
  const [customStyle, setCustomStyle] = useState<string>('');
  const [combinedPrompt, setCombinedPrompt] = useState<string>('');
  const [promptQuality, setPromptQuality] = useState<PromptQuality>({
    hasTextControl: false,
    hasQualityControl: false,
    hasStyleDescription: false,
    length: 0,
    issues: [],
    suggestions: []
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [useFullPrompt, setUseFullPrompt] = useState<boolean>(false);
  const [fullPrompt, setFullPrompt] = useState<string>('');
  
  // Editable prompt sections
  const [eventTypePrompt, setEventTypePrompt] = useState<string>('');
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [eventDetailsPrompt, setEventDetailsPrompt] = useState<string>('');
  const [basePrompt, setBasePrompt] = useState<string>('no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design');
  
  // Section toggles
  const [sectionsEnabled, setSectionsEnabled] = useState({
    eventType: true,
    stylePreset: true,
    eventDetails: true,
    customStyle: true,
    basePrompt: true
  });

  // Event types
  const eventTypes = [
    'WEDDING', 'BIRTHDAY_PARTY', 'CORPORATE_EVENT', 'HOLIDAY_CELEBRATION',
    'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE', 'FAMILY_GATHERING'
  ];

  // Style presets
  const stylePresets = [
    'Golden Harmony', 'Pop Art', 'Children Book', 'Vintage Film Poster',
    'Retro Game', 'Cyberpunk', 'Origami', 'Fantasy World', 'Street Art'
  ];

  // Event type configurations
  const eventTypeConfigs = {
    WEDDING: {
      name: 'Wedding',
      fields: ['style', 'colors', 'venue', 'season', 'guests', 'elements']
    },
    BIRTHDAY_PARTY: {
      name: 'Birthday Party',
      fields: ['age', 'theme', 'venue', 'guests', 'activities', 'decorations']
    },
    CORPORATE_EVENT: {
      name: 'Corporate Event',
      fields: ['eventType', 'industry', 'attendees', 'venue', 'formality', 'branding']
    },
    HOLIDAY_CELEBRATION: {
      name: 'Holiday Celebration',
      fields: ['holiday', 'context', 'venue', 'people', 'traditions', 'decorations']
    }
  };

  // Generate full prompt using browser-compatible approach
  const generateFullPromptBrowser = async () => {
    try {
      // Get database prompts via API
      const response = await fetch('/api/admin/system-prompts/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: selectedEventType,
          styleName: selectedStylePreset,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to fetch prompts from database, using fallback');
        // Set fallback prompts based on selection
        setEventTypePrompt(`${selectedEventType.toLowerCase().replace('_', ' ')} event flyer design`);
        setStylePrompt(`${selectedStylePreset.toLowerCase()} style design`);
        return;
      }

      const { prompts } = await response.json();
      
      // Set database prompts
      if (prompts.eventTypePrompt) {
        setEventTypePrompt(prompts.eventTypePrompt);
      } else {
        setEventTypePrompt('');
      }
      
      if (prompts.stylePrompt) {
        setStylePrompt(prompts.stylePrompt);
      } else {
        setStylePrompt('');
      }
      
      // Build event details prompt
      const eventDetailsParts: string[] = [];
      
      // Add event details based on type
      switch (selectedEventType) {
        case 'WEDDING':
          if (eventDetails.style) eventDetailsParts.push(`${eventDetails.style} style wedding`);
          if (eventDetails.colors) eventDetailsParts.push(`${eventDetails.colors} color scheme`);
          if (eventDetails.venue) eventDetailsParts.push(`at ${eventDetails.venue}`);
          if (eventDetails.season) eventDetailsParts.push(`${eventDetails.season} season`);
          if (eventDetails.guests) eventDetailsParts.push(`${eventDetails.guests} guests`);
          if (eventDetails.elements) eventDetailsParts.push(`with ${eventDetails.elements}`);
          break;
        case 'BIRTHDAY_PARTY':
          if (eventDetails.age) eventDetailsParts.push(`${eventDetails.age}th birthday celebration`);
          if (eventDetails.theme) eventDetailsParts.push(`${eventDetails.theme} theme`);
          if (eventDetails.venue) eventDetailsParts.push(`at ${eventDetails.venue}`);
          if (eventDetails.guests) eventDetailsParts.push(`${eventDetails.guests} guests`);
          if (eventDetails.activities) eventDetailsParts.push(`featuring ${eventDetails.activities}`);
          if (eventDetails.decorations) eventDetailsParts.push(`with ${eventDetails.decorations}`);
          break;
        case 'CORPORATE_EVENT':
          if (eventDetails.eventType) eventDetailsParts.push(`${eventDetails.eventType} corporate event`);
          if (eventDetails.industry) eventDetailsParts.push(`${eventDetails.industry} industry`);
          if (eventDetails.attendees) eventDetailsParts.push(`${eventDetails.attendees} attendees`);
          if (eventDetails.venue) eventDetailsParts.push(`at ${eventDetails.venue}`);
          if (eventDetails.formality) eventDetailsParts.push(`${eventDetails.formality} dress code`);
          if (eventDetails.branding) eventDetailsParts.push(`${eventDetails.branding} branding`);
          break;
        case 'HOLIDAY_CELEBRATION':
          if (eventDetails.holiday) {
            // Import the function to get holiday details
            const { getHolidayDetailsByName } = await import('@/lib/holidays');
            const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
            if (holidayDetails) {
              // Add rich holiday context
              eventDetailsParts.push(`${holidayDetails.name} celebration`);
              eventDetailsParts.push(`${holidayDetails.type.toLowerCase()} holiday`);
              if (holidayDetails.description) {
                eventDetailsParts.push(`${holidayDetails.description.toLowerCase()}`);
              }
              if (holidayDetails.region.length > 0) {
                eventDetailsParts.push(`${holidayDetails.region.join(', ')} cultural context`);
              }
            } else {
              eventDetailsParts.push(`${eventDetails.holiday} celebration`);
            }
          }
          
          // Only add context if it's not redundant with holiday details
          if (eventDetails.context && eventDetails.context !== 'Public Holiday') {
            eventDetailsParts.push(`${eventDetails.context} context`);
          }
          
          if (eventDetails.venue) eventDetailsParts.push(`at ${eventDetails.venue}`);
          if (eventDetails.people) eventDetailsParts.push(`${eventDetails.people} people`);
          if (eventDetails.traditions) eventDetailsParts.push(`featuring ${eventDetails.traditions}`);
          
          // Only add decorations if they're not redundant with holiday details
          if (eventDetails.decorations && typeof eventDetails.decorations === 'string') {
            const { getHolidayDetailsByName } = await import('@/lib/holidays');
            const holidayDetails = getHolidayDetailsByName(eventDetails.holiday as string);
            const isRedundantDecoration = holidayDetails && 
              eventDetails.decorations.toLowerCase().includes(holidayDetails.region[0].toLowerCase()) &&
              eventDetails.decorations.toLowerCase().includes('cultural');
            
            if (!isRedundantDecoration) {
              eventDetailsParts.push(`with ${eventDetails.decorations}`);
            }
          }
          break;
        default:
          if (eventDetails.venue) eventDetailsParts.push(`at ${eventDetails.venue}`);
          if (eventDetails.atmosphere) eventDetailsParts.push(`${eventDetails.atmosphere} atmosphere`);
          if (eventDetails.activities) eventDetailsParts.push(`featuring ${eventDetails.activities}`);
          if (eventDetails.decorations) eventDetailsParts.push(`with ${eventDetails.decorations}`);
          break;
      }
      
      // Set event details prompt
      if (eventDetailsParts.length > 0) {
        setEventDetailsPrompt(eventDetailsParts.join(', '));
      } else {
        setEventDetailsPrompt('');
      }
      
    } catch (error) {
      console.error('Error generating full prompt:', error);
      // Set fallback prompts on error
      setEventTypePrompt(`${selectedEventType.toLowerCase().replace('_', ' ')} event flyer design`);
      setStylePrompt(`${selectedStylePreset.toLowerCase()} style design`);
    }
  };

  // Build combined prompt from editable sections
  const buildCombinedPrompt = () => {
    const parts: string[] = [];
    
    if (sectionsEnabled.eventType && eventTypePrompt.trim()) {
      parts.push(eventTypePrompt.trim());
    }
    
    if (sectionsEnabled.stylePreset && stylePrompt.trim()) {
      parts.push(stylePrompt.trim());
    }
    
    if (sectionsEnabled.eventDetails && eventDetailsPrompt.trim()) {
      parts.push(eventDetailsPrompt.trim());
    }
    
    if (sectionsEnabled.customStyle && customStyle.trim()) {
      parts.push(customStyle.trim());
    }
    
    if (sectionsEnabled.basePrompt && basePrompt.trim()) {
      parts.push(basePrompt.trim());
    }
    
    return parts.join(', ');
  };

  // Build color-coded combined prompt for display
  const buildColorCodedPrompt = () => {
    const parts: { text: string; color: string }[] = [];
    
    if (sectionsEnabled.eventType && eventTypePrompt.trim()) {
      parts.push({ text: eventTypePrompt.trim(), color: 'text-blue-600' });
    }
    
    if (sectionsEnabled.stylePreset && stylePrompt.trim()) {
      parts.push({ text: stylePrompt.trim(), color: 'text-purple-600' });
    }
    
    if (sectionsEnabled.eventDetails && eventDetailsPrompt.trim()) {
      parts.push({ text: eventDetailsPrompt.trim(), color: 'text-green-600' });
    }
    
    if (sectionsEnabled.customStyle && customStyle.trim()) {
      parts.push({ text: customStyle.trim(), color: 'text-orange-600' });
    }
    
    if (sectionsEnabled.basePrompt && basePrompt.trim()) {
      parts.push({ text: basePrompt.trim(), color: 'text-gray-600' });
    }
    
    return parts;
  };

  // Update combined prompt whenever any section changes
  useEffect(() => {
    const combined = buildCombinedPrompt();
    setCombinedPrompt(combined);
    analyzePromptQuality(combined);
  }, [eventTypePrompt, stylePrompt, eventDetailsPrompt, customStyle, basePrompt, sectionsEnabled]);

  // Generate combined prompt from database
  const generateCombinedPrompt = async () => {
    try {
      setIsGenerating(true);
      
      if (useFullPrompt) {
        // Use browser-compatible full prompt generation
        await generateFullPromptBrowser();
      } else {
        // Import the standard prompt generation function
        const { generateEnhancedPromptWithSystemPrompts } = await import('@/lib/prompt-generator');
        
        const basePrompt = "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design";
        const prompt = await generateEnhancedPromptWithSystemPrompts(
          basePrompt,
          selectedEventType,
          eventDetails,
          selectedStylePreset,
          customStyle
        );
        
        setCombinedPrompt(prompt);
        analyzePromptQuality(prompt);
      }
      
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate actual image with the combined prompt
  const generateImage = async () => {
    try {
      setIsGenerating(true);
      
      // Call the image generation API with the exact combined prompt
      const response = await fetch('/api/events/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: combinedPrompt,
          eventType: selectedEventType,
          stylePreset: selectedStylePreset,
          // Add any other required parameters
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const result = await response.json();
      
      if (result.imageUrl) {
        setPreviewImage(result.imageUrl);
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      // For now, use a mockup
      setTimeout(() => {
        setPreviewImage('/styles/4_golden_harmony.jpg');
        setIsGenerating(false);
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy prompt to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(combinedPrompt);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  // Analyze prompt quality
  const analyzePromptQuality = (prompt: string) => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check for text quality control
    const hasTextControl = prompt.includes('no gibberish text') && 
                          prompt.includes('no fake letters') && 
                          prompt.includes('no strange characters');
    
    // Check for quality control
    const hasQualityControl = prompt.includes('no blur') && 
                             prompt.includes('no distortion') && 
                             prompt.includes('high quality');
    
    // Check for style description
    const hasStyleDescription = prompt.includes('elegant') || 
                               prompt.includes('sophisticated') || 
                               prompt.includes('refined');
    
    // Length analysis
    const length = prompt.length;
    if (length < 200) {
      issues.push('Prompt is too short - may not provide enough detail');
      suggestions.push('Add more specific event details or style descriptions');
    } else if (length > 800) {
      issues.push('Prompt is very long - may confuse the AI');
      suggestions.push('Consider simplifying or removing redundant phrases');
    }
    
    // Check for missing quality control
    if (!hasTextControl) {
      issues.push('Missing text quality control phrases');
      suggestions.push('Add "no gibberish text, no fake letters, no strange characters"');
    }
    
    if (!hasQualityControl) {
      issues.push('Missing basic quality control phrases');
      suggestions.push('Add "no blur, no distortion, high quality"');
    }
    
    if (!hasStyleDescription) {
      issues.push('Limited style description');
      suggestions.push('Add more specific style elements');
    }
    
    setPromptQuality({
      hasTextControl,
      hasQualityControl,
      hasStyleDescription,
      length,
      issues,
      suggestions
    });
  };

  // Update event details
  const updateEventDetail = (field: string, value: string) => {
    setEventDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear event details when event type changes
  const handleEventTypeChange = (newEventType: string) => {
    setSelectedEventType(newEventType);
    setEventDetails({}); // Clear all event details when changing event type
  };

  // Auto-load database prompts when event type or style preset changes
  useEffect(() => {
    if (selectedEventType && selectedStylePreset) {
      generateFullPromptBrowser();
    }
  }, [selectedEventType, selectedStylePreset]);

  // Auto-generate prompt when settings change (for non-database mode)
  useEffect(() => {
    if (selectedEventType && selectedStylePreset && !useFullPrompt) {
      generateCombinedPrompt();
    }
  }, [eventDetails, customStyle, useFullPrompt]);

  // Initial load of database prompts on component mount
  useEffect(() => {
    // Load database prompts on initial mount
    generateFullPromptBrowser();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Prompt Preview Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Prompt Editor</TabsTrigger>
              <TabsTrigger value="result">Image Generation</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={selectedEventType} onValueChange={handleEventTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {eventTypeConfigs[type as keyof typeof eventTypeConfigs]?.name || type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stylePreset">Style Preset</Label>
                  <Select value={selectedStylePreset} onValueChange={setSelectedStylePreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stylePresets.map(style => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <Label>Event Details</Label>
                <div className="grid grid-cols-2 gap-4">
                  {eventTypeConfigs[selectedEventType as keyof typeof eventTypeConfigs]?.fields.map(field => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="capitalize">{field}</Label>
                      <Input
                        id={field}
                        value={eventDetails[field] || ''}
                        onChange={(e) => updateEventDetail(field, e.target.value)}
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Style */}
              <div className="space-y-2">
                <Label htmlFor="customStyle">Custom Style (Optional)</Label>
                <Textarea
                  id="customStyle"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder="Add any additional style instructions..."
                  rows={3}
                />
              </div>

              {/* Database Mode Toggle */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fullPromptMode"
                    checked={useFullPrompt}
                    onChange={(e) => setUseFullPrompt(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="fullPromptMode" className="text-sm font-medium">
                    Use Database Prompts (Full Mode)
                  </Label>
                </div>
                <p className="text-xs text-gray-600">
                  When enabled, loads full database prompts. When disabled, uses optimized prompts.
                </p>
              </div>
            </TabsContent>

            {/* Prompt Editor Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Editable Prompt Sections</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{promptQuality.length} chars</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                {/* Editable prompt sections */}
                <div className="space-y-4">
                  {/* Event Type Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        Event Type ({eventTypePrompt.length} chars)
                      </div>
                      <input
                        type="checkbox"
                        checked={sectionsEnabled.eventType}
                        onChange={(e) => setSectionsEnabled(prev => ({ ...prev, eventType: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <Textarea
                      value={eventTypePrompt}
                      onChange={(e) => setEventTypePrompt(e.target.value)}
                      placeholder="Event type prompt from database or custom..."
                      rows={3}
                      className="border-l-4 border-blue-300"
                    />
                  </div>
                  
                  {/* Style Preset Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                        Style Preset ({stylePrompt.length} chars)
                      </div>
                      <input
                        type="checkbox"
                        checked={sectionsEnabled.stylePreset}
                        onChange={(e) => setSectionsEnabled(prev => ({ ...prev, stylePreset: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <Textarea
                      value={stylePrompt}
                      onChange={(e) => setStylePrompt(e.target.value)}
                      placeholder="Style preset prompt from database or custom..."
                      rows={3}
                      className="border-l-4 border-purple-300"
                    />
                  </div>
                  
                  {/* Event Details Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Event Details ({eventDetailsPrompt.length} chars)
                      </div>
                      <input
                        type="checkbox"
                        checked={sectionsEnabled.eventDetails}
                        onChange={(e) => setSectionsEnabled(prev => ({ ...prev, eventDetails: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <Textarea
                      value={eventDetailsPrompt}
                      onChange={(e) => setEventDetailsPrompt(e.target.value)}
                      placeholder="Event details (auto-generated from form or custom)..."
                      rows={2}
                      className="border-l-4 border-green-300"
                    />
                  </div>
                  
                  {/* Custom Style Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                        Custom Style ({customStyle.length} chars)
                      </div>
                      <input
                        type="checkbox"
                        checked={sectionsEnabled.customStyle}
                        onChange={(e) => setSectionsEnabled(prev => ({ ...prev, customStyle: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <Textarea
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      placeholder="Additional custom style instructions..."
                      rows={2}
                      className="border-l-4 border-orange-300"
                    />
                  </div>
                  
                  {/* Base Prompt Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        Base Prompt ({basePrompt.length} chars)
                      </div>
                      <input
                        type="checkbox"
                        checked={sectionsEnabled.basePrompt}
                        onChange={(e) => setSectionsEnabled(prev => ({ ...prev, basePrompt: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <Textarea
                      value={basePrompt}
                      onChange={(e) => setBasePrompt(e.target.value)}
                      placeholder="Base quality control and style instructions..."
                      rows={2}
                      className="border-l-4 border-gray-300"
                    />
                  </div>
                </div>
                
                                 {/* Final Combined Prompt */}
                 <div className="space-y-2">
                   <Label className="text-sm font-medium">Final Combined Prompt ({combinedPrompt.length} chars):</Label>
                   <div className="font-mono text-sm bg-gray-50 p-3 rounded-md border min-h-[100px] whitespace-pre-wrap">
                     {buildColorCodedPrompt().map((part, index) => (
                       <span key={index}>
                         <span className={part.color}>{part.text}</span>
                         {index < buildColorCodedPrompt().length - 1 && <span className="text-gray-400">, </span>}
                       </span>
                     ))}
                   </div>
                 </div>

                {/* Quality Analysis */}
                <div className="space-y-3">
                  <Label>Quality Analysis</Label>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {promptQuality.hasTextControl ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Text Control</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {promptQuality.hasQualityControl ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Quality Control</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {promptQuality.hasStyleDescription ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Style Description</span>
                    </div>
                  </div>

                  {/* Issues and Suggestions */}
                  {promptQuality.issues.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div>
                            <strong>Issues Found:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {promptQuality.issues.map((issue, index) => (
                                <li key={index} className="text-sm">{issue}</li>
                              ))}
                            </ul>
                          </div>
                          {promptQuality.suggestions.length > 0 && (
                            <div>
                              <strong>Suggestions:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {promptQuality.suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm">{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Image Generation Tab */}
            <TabsContent value="result" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Generate Image with Full Prompt</Label>
                  <Button
                    onClick={generateImage}
                    disabled={isGenerating || !combinedPrompt}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Image className="h-4 w-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Full Prompt Mode:</strong> This will generate an image using the exact combined prompt shown above. 
                    No truncation or optimization will be applied - the AI will receive exactly what you see in the prompt editor.
                  </AlertDescription>
                </Alert>

                {previewImage ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Generated image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Generated with prompt:</strong> {combinedPrompt.substring(0, 100)}...
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p>Click "Generate Image" to create with the full prompt</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls" className="space-y-4">
              <div className="space-y-4">
                <Label>Section Controls</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Enable/Disable Sections</Label>
                    <div className="space-y-2">
                      {Object.entries(sectionsEnabled).map(([key, enabled]) => (
                        <div key={key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`enable-${key}`}
                            checked={enabled}
                            onChange={(e) => setSectionsEnabled(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`enable-${key}`} className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick Actions</Label>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSectionsEnabled({
                          eventType: true,
                          stylePreset: true,
                          eventDetails: true,
                          customStyle: true,
                          basePrompt: true
                        })}
                      >
                        Enable All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSectionsEnabled({
                          eventType: false,
                          stylePreset: false,
                          eventDetails: false,
                          customStyle: false,
                          basePrompt: false
                        })}
                      >
                        Disable All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 