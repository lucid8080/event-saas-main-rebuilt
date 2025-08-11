"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "@/styles/loader.css";
import { 
  MoreVertical, 
  Download, 
  Trash2, 
  Heart, 
  Pencil, 
  Sparkles,
  Image as ImageIcon,
  Palette,
  Crop,
  Zap,
  CheckCircle,
  Circle,
  Info,
  RotateCcw,
  Share2,
  Copy,
  Settings,
  ChevronRight,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageEditorModal } from "@/components/dashboard/image-editor-modal";
import { EventQuestionsForm } from "@/components/dashboard/event-questions-form";
import { WatermarkedImage } from "@/components/dashboard/watermarked-image";
import { LogoSearch } from "@/components/dashboard/logo-search";
import { LogoOverlay } from "@/components/dashboard/logo-overlay";
import { UpscaleButton } from "@/components/dashboard/upscale-button";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
// Provider selection now managed via admin settings only
import { generateImageV2 } from "@/actions/generate-image-v2";
import { ProviderType } from "@/lib/providers";
import { toast } from "sonner";
import { EventDetails, generateEnhancedPrompt } from "@/lib/prompt-generator";
import { useSession } from "next-auth/react";
import { useImageEditToggle } from "@/hooks/use-image-edit-toggle";
import { useWatermarkToggle } from "@/hooks/use-watermark-toggle";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Style presets with improved descriptions
const stylePresets = [
  { id: 1, thumbnail: "/styles/1_wild_card.png", name: "Wild Card", description: "Unique and unpredictable artistic style with creative freedom" },
  { id: 2, thumbnail: "/styles/2_Pop_Art.jpg", name: "Pop Art", description: "Vibrant pop art-style image reminiscent of the works of artists like Roy Lichtenstein" },
  { id: 3, thumbnail: "/styles/3_children_book.jpg", name: "Children Book", description: "Whimsical and playful illustrations perfect for family events" },
  { id: 4, thumbnail: "/styles/4_golden_harmony.jpg", name: "Golden Harmony", description: "Elegant celebration, soft neutral tones, gold accents, warm and joyful ambiance" },
  { id: 5, thumbnail: "/styles/5_Vintage_Film_Poster.jpg", name: "Vintage Film Poster", description: "Vintage action movie poster style, bold colors, dramatic lighting, 80s retro aesthetic" },
  { id: 6, thumbnail: "/styles/6_Retro_Game.jpg", name: "Retro Game", description: "Retro game theme, pixels and 16-bit graphics" },
  { id: 7, thumbnail: "/styles/7_Cyberpunk.jpg", name: "Cyberpunk", description: "Futuristic and neon-lit style for modern events" },
  { id: 8, thumbnail: "/styles/8_origami.jpg", name: "Origami", description: "Low-poly 3D character in geometric, faceted style with warm shades" },
  { id: 9, thumbnail: "/styles/9_Fantasy_World.jpeg", name: "Fantasy World", description: "Magical and enchanting fantasy realm with mystical elements" },
  { id: 10, thumbnail: "/styles/10_Street_Art.jpeg", name: "Street Art", description: "Urban street art style with bold graffiti and contemporary urban culture, limited text and and faces unless otherwise specified" },
  { id: 11, thumbnail: "/styles/4_Political_Satire.jpg", name: "Political Satire", description: "Detailed political caricature with formal government office backdrop" },
  { id: 12, thumbnail: "/styles/11_Unicorn_Balloon_Bash.jpg", name: "Unicorn Balloon Bash", description: "Vibrant and playful scene perfect for children's party flyers featuring adorable balloon-like unicorn-dragon hybrids in bright colors with confetti, streamers, and magical elements" },
];

const shapes = [
  { id: 1, aspect: "16:9", width: 1920, height: 1080, name: "Landscape", description: "Perfect for banners, wide displays, and TikTok landscape videos" },
  { id: 2, aspect: "4:3", width: 1600, height: 1200, name: "Standard", description: "Traditional format for presentations" },
  { id: 3, aspect: "1:1", width: 1080, height: 1080, name: "Instagram Post", description: "Instagram feed posts, Facebook posts, and LinkedIn (1080x1080)" },
  { id: 4, aspect: "9:16", width: 1080, height: 1920, name: "Instagram Story", description: "Instagram Stories and TikTok videos (1080x1920)" },
  { id: 5, aspect: "3:4", width: 1200, height: 1600, name: "Flyer", description: "Perfect for event flyers, posters, and promotional materials" },
  { id: 6, aspect: "4:5", width: 1080, height: 1350, name: "Instagram Portrait", description: "Instagram portrait posts (1080x1350)" },
  { id: 7, aspect: "5:7", width: 1000, height: 1400, name: "Greeting Card", description: "Perfect for birthday cards, anniversary cards, and milestone celebrations" },
  { id: 8, aspect: "2:3", width: 800, height: 1200, name: "Card Portrait", description: "Ideal for vertical greeting cards and invitations" },
];

const eventTypes = [
  { id: "BIRTHDAY_PARTY", name: "Birthday Party", description: "Birthday Party flyer theme no text unless otherwise specified.", icon: "🎉" },
  { id: "WEDDING", name: "Wedding", description: "Wedding flyer theme no text unless otherwise specified.", icon: "💒" },
  { id: "CORPORATE_EVENT", name: "Corporate Event", description: "Corporate Event flyer theme no text unless otherwise specified.", icon: "🏢" },
  { id: "HOLIDAY_CELEBRATION", name: "Holiday Celebration", description: "Holiday Celebration flyer theme no text unless otherwise specified.", icon: "🎄" },
  { id: "CONCERT", name: "Concert", description: "Concert flyer theme no text unless otherwise specified.", icon: "🎵" },
  { id: "SPORTS_EVENT", name: "Sports Event", description: "Sports Event flyer theme no text unless otherwise specified.", icon: "⚽" },
  { id: "NIGHTLIFE", name: "Nightlife", description: "Nightlife/club event flyer theme no text unless otherwise specified.", icon: "🌙" },
  { id: "FAMILY_GATHERING", name: "Family Gathering", description: "Family Gathering flyer theme no text unless otherwise specified.", icon: "👨‍👩‍👧‍👦" },
  { id: "BBQ", name: "BBQ", description: "BBQ event flyer theme no text unless otherwise specified.", icon: "🍖" },
  { id: "PARK_GATHERING", name: "Park Gathering", description: "Park Gathering flyer theme no text unless otherwise specified.", icon: "🌳" },
  { id: "COMMUNITY_EVENT", name: "Community Event", description: "Community Event flyer theme no text unless otherwise specified.", icon: "🏘️" },
  { id: "FUNDRAISER", name: "Fundraiser", description: "Fundraiser flyer theme no text unless otherwise specified.", icon: "💝" },
  { id: "WORKSHOP", name: "Workshop", description: "Workshop flyer theme no text unless otherwise specified.", icon: "🔧" },
  { id: "MEETUP", name: "Meetup", description: "Meetup flyer theme no text unless otherwise specified.", icon: "🤝" },
  { id: "CELEBRATION", name: "Celebration", description: "Celebration flyer theme no text unless otherwise specified.", icon: "🎊" },
  { id: "REUNION", name: "Reunion", description: "Reunion flyer theme no text unless otherwise specified.", icon: "👥" },
  { id: "POTLUCK", name: "Potluck", description: "Potluck flyer theme no text unless otherwise specified.", icon: "🍽️" },
  { id: "GAME_NIGHT", name: "Game Night", description: "Game Night flyer theme no text unless otherwise specified.", icon: "🎲" },
  { id: "BOOK_CLUB", name: "Book Club", description: "Book Club flyer theme no text unless otherwise specified.", icon: "📚" },
  { id: "ART_CLASS", name: "Art Class", description: "Art Class flyer theme no text unless otherwise specified.", icon: "🎨" },
  { id: "FITNESS_CLASS", name: "Fitness Class", description: "Fitness Class flyer theme no text unless otherwise specified.", icon: "💪" },
  { id: "BREAKDANCING", name: "Breakdancing", description: "Breakdancing event flyer theme no text unless otherwise specified.", icon: "🕺" },
  { id: "POTTERY", name: "Pottery", description: "Pottery event flyer theme no text unless otherwise specified.", icon: "🏺" },
];

export function ImageGenerator() {
  const { data: session } = useSession();
  const { imageEditEnabled, isLoading: toggleLoading } = useImageEditToggle();
  const { watermarkEnabled, isLoading: watermarkLoading } = useWatermarkToggle();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userCredits, setUserCredits] = useState(0);

  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [selectedShape, setSelectedShape] = useState<typeof shapes[0] | null>(null); // No default selection
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageId, setGeneratedImageId] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails>({});
  const [eventDetailsValid, setEventDetailsValid] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTooltips, setShowTooltips] = useState(true);
  const [styleMode, setStyleMode] = useState<'preset' | 'custom'>('preset');
  const [customStyle, setCustomStyle] = useState<string>('');

  const [isLoadingHolidayData, setIsLoadingHolidayData] = useState<boolean>(false);
  const [isShapeSectionCollapsed, setIsShapeSectionCollapsed] = useState<boolean>(true);
  const [isEventDetailsSectionCollapsed, setIsEventDetailsSectionCollapsed] = useState<boolean>(true);

  // Quality setting - provider is now managed by admin settings
  // Quality is now controlled by admin settings - removed from user interface

  // Style pagination state
  const [currentStylePage, setCurrentStylePage] = useState(0);
  const stylesPerPage = 6;
  const totalStylePages = Math.ceil(stylePresets.length / stylesPerPage);

  // Handle navigation for style pagination
  const handleNextStyles = () => {
    setCurrentStylePage(prev => Math.min(prev + 1, totalStylePages - 1));
  };

  const handlePrevStyles = () => {
    setCurrentStylePage(prev => Math.max(prev - 1, 0));
  };

  // Get visible styles for current page
  const startIndex = currentStylePage * stylesPerPage;
  const endIndex = startIndex + stylesPerPage;
  const visibleStyles = stylePresets.slice(startIndex, endIndex);
  const hasNextPage = currentStylePage < totalStylePages - 1;
  const hasPrevPage = currentStylePage > 0;

  
  // Logo overlay state
  const [showLogoSearch, setShowLogoSearch] = useState(false);
  const [selectedLogos, setSelectedLogos] = useState<Array<{
    id: string;
    logo: {
      id: string;
      name: string;
      svg: string;
      url: string;
      category?: string;
    };
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    opacity: number;
  }>>([]);

  // Fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const userData = await response.json();
            console.log('Fetched user data:', userData);
            setUserCredits(userData.credits || 0);
            console.log('Set user credits to:', userData.credits || 0);
          }
        } catch (error) {
          console.error('Error fetching user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [session?.user?.id]);

  // Simple sticky generate button behavior
  useEffect(() => {
    const container = document.getElementById('generate-button-container');
    
    if (!container) return;

    // Check if button should be enabled
    const isButtonEnabled = selectedShape !== null && userCredits > 0 && selectedEventType && (
      styleMode === 'preset' 
        ? selectedStyle !== null
        : eventDetailsValid
    );

    // Only add sticky behavior if button is enabled
    if (isButtonEnabled) {
      container.classList.add('sticky', 'bottom-0', 'z-50');
      container.style.backgroundColor = 'hsl(var(--background))';
      container.style.borderTop = '1px solid hsl(var(--border))';
      container.style.boxShadow = '0 -4px 12px rgba(0, 0, 0, 0.1)';
    } else {
      container.classList.remove('sticky', 'bottom-0', 'z-50');
      container.style.backgroundColor = '';
      container.style.borderTop = '';
      container.style.boxShadow = '';
    }

    return () => {
      if (container) {
        container.classList.remove('sticky', 'bottom-0', 'z-50');
        container.style.backgroundColor = '';
        container.style.borderTop = '';
        container.style.boxShadow = '';
      }
    };
  }, [selectedShape, userCredits, selectedEventType, styleMode, selectedStyle, eventDetailsValid]);



  // Handle URL parameters for pre-populating holiday data, Ticketmaster events, and personal events
  useEffect(() => {
    // Check if there are any URL parameters to process
    const hasUrlParams = searchParams.toString().length > 0;
    if (!hasUrlParams) {
      return;
    }

    const eventType = searchParams.get('eventType');
    const holiday = searchParams.get('holiday');
    const holidayType = searchParams.get('holidayType');
    const holidayDate = searchParams.get('holidayDate');
    const holidayRegions = searchParams.get('holidayRegions');
    const holidayDescription = searchParams.get('holidayDescription');
    
    // Ticketmaster event parameters
    const eventName = searchParams.get('eventName');
    const eventDate = searchParams.get('eventDate');
    const eventTime = searchParams.get('eventTime');
    const eventVenue = searchParams.get('eventVenue');
    const eventCity = searchParams.get('eventCity');
    const eventState = searchParams.get('eventState');
    const eventDescription = searchParams.get('eventDescription');
    const eventClassification = searchParams.get('eventClassification');
    const eventGenre = searchParams.get('eventGenre');
    const sourceEventId = searchParams.get('sourceEventId');
    const mappedEventType = searchParams.get('mappedEventType');
    const eventDetailsParam = searchParams.get('eventDetails');
    const styleSuggestionsParam = searchParams.get('styleSuggestions');

    // Personal event parameters
    const personalEventType = searchParams.get('personalEventType');
    const personalEventColor = searchParams.get('personalEventColor');
    const personalEventRecurring = searchParams.get('personalEventRecurring');

    // Handle Ticketmaster events
    if (eventName && eventVenue && eventType && eventType !== 'HOLIDAY_CELEBRATION') {
      try {
        // Pre-populate the Event Generator with Ticketmaster event data
        setSelectedEventType(mappedEventType || eventType);
        setCurrentStep(2);
        setStyleMode('custom');
        
        // Parse event details and style suggestions
        let eventDetails: Record<string, string> = {};
        let styleSuggestions: string[] = [];
        
        if (eventDetailsParam) {
          try {
            eventDetails = JSON.parse(eventDetailsParam);
          } catch (e) {
            console.error('Failed to parse event details:', e);
          }
        }
        
        if (styleSuggestionsParam) {
          try {
            styleSuggestions = JSON.parse(styleSuggestionsParam);
          } catch (e) {
            console.error('Failed to parse style suggestions:', e);
          }
        }
        
        // Create comprehensive event details
        const ticketmasterDetails: EventDetails = {
          eventName: eventName,
          venue: eventVenue,
          location: eventCity && eventState ? `${eventCity}, ${eventState}` : eventVenue,
          description: eventDescription || `${eventName} at ${eventVenue}`,
          date: eventDate || '',
          time: eventTime || '',
          genre: eventGenre || '',
          classification: eventClassification || '',
          ...eventDetails // Include any additional mapped details
        };
        
        setEventDetails(ticketmasterDetails);
        setEventDetailsValid(true);
        
        // Show success message
        toast.success(`Pre-populated with ${eventName} event details!`);
        
        // Clear URL parameters after processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error pre-populating Ticketmaster event data:', error);
        toast.error('Failed to pre-populate event data. Please try again.');
      }
    }
    // Handle holiday events
    else if (eventType === 'HOLIDAY_CELEBRATION' && holiday) {
      setIsLoadingHolidayData(true);
      
      try {
      // Pre-populate the Event Generator with holiday data
      setSelectedEventType('HOLIDAY_CELEBRATION');
      setCurrentStep(2);
      setStyleMode('custom');
      
      // Generate holiday-specific suggestions based on holiday type
      const getHolidaySuggestions = (type: string, regions: string) => {
        const suggestions: any = {
          venue: 'Home',
          traditions: holidayDescription || '',
          decorations: regions ? `${regions} cultural elements` : ''
        };

        // Holiday-specific venue suggestions
        if (type.includes('Religious')) {
          suggestions.venue = 'Church';
        } else if (type.includes('Public')) {
          suggestions.venue = 'Community Center';
        }



        // Holiday-specific decoration suggestions
        if (holiday.toLowerCase().includes('christmas')) {
          suggestions.decorations = 'Christmas tree, lights, ornaments, wreaths, snow';
        } else if (holiday.toLowerCase().includes('halloween')) {
          suggestions.decorations = 'Pumpkins, spider webs, ghosts, black and orange decorations';
        } else if (holiday.toLowerCase().includes('easter')) {
          suggestions.decorations = 'Easter eggs, pastel colors, flowers, bunnies';
        } else if (holiday.toLowerCase().includes('valentine')) {
          suggestions.decorations = 'Roses, hearts, red and pink decorations, candles';
        }

        return suggestions;
      };

      const suggestions = getHolidaySuggestions(holidayType || '', holidayRegions || '');
      
      const holidayDetails: EventDetails = {
        holiday: holiday,
        context: holidayType || '',
        venue: suggestions.venue,
        traditions: suggestions.traditions,
        decorations: suggestions.decorations
      };
      
      setEventDetails(holidayDetails);
      setEventDetailsValid(true);
      
              // Show success message
        toast.success(`Pre-populated with ${holiday} celebration details!`);
        
        // Clear URL parameters after processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error pre-populating holiday data:', error);
        toast.error('Failed to pre-populate holiday data. Please try again.');
      } finally {
        setIsLoadingHolidayData(false);
      }
    }
    // Handle personal events
    else if (personalEventType && eventName && eventType) {
      try {
        // Pre-populate the Event Generator with personal event data
        setSelectedEventType(mappedEventType || eventType);
        setCurrentStep(2);
        setStyleMode('custom');
        
        // Parse event details and style suggestions
        let eventDetails: Record<string, string> = {};
        let styleSuggestions: string[] = [];
        
        if (eventDetailsParam) {
          try {
            eventDetails = JSON.parse(eventDetailsParam);
          } catch (e) {
            console.error('Failed to parse event details:', e);
          }
        }
        
        if (styleSuggestionsParam) {
          try {
            styleSuggestions = JSON.parse(styleSuggestionsParam);
          } catch (e) {
            console.error('Failed to parse style suggestions:', e);
          }
        }
        
        // Create comprehensive personal event details
        const personalEventDetails: EventDetails = {
          eventName: eventName,
          description: eventDescription || `${eventName} celebration`,
          date: eventDate || '',
          venue: 'Home', // Personal events are typically at home
          location: 'Home',
          personalEventType: personalEventType,
          personalEventColor: personalEventColor || 'pink',
          personalEventRecurring: personalEventRecurring === 'true' ? 'true' : 'false',
          ...eventDetails // Include any additional mapped details
        };
        
        setEventDetails(personalEventDetails);
        setEventDetailsValid(true);
        
        // Show success message
        toast.success(`Pre-populated with ${eventName} personal event details!`);
        
        // Clear URL parameters after processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error pre-populating personal event data:', error);
        toast.error('Failed to pre-populate personal event data. Please try again.');
      }
    }
  }, [searchParams]);



  const handleGenerateImage = async () => {
    if (userCredits <= 0) return;

    setIsLoading(true);
    try {
      let styleName: string | undefined;
      let additionalDetails: string | undefined;
      
      if (styleMode === 'preset') {
        // In preset mode: use preset style name (not description) + additional details
        const selectedPreset = selectedStyle ? stylePresets.find(s => s.id === selectedStyle) : undefined;
        styleName = selectedPreset ? selectedPreset.name : undefined; // Use name instead of description
        additionalDetails = customStyle.trim() || undefined;
      } else {
        // In custom mode: use event details form (no preset style, but event details are processed by prompt generator)
        styleName = undefined;
        additionalDetails = undefined;
        // Note: eventDetails are already being passed to generateEnhancedPrompt and will be processed there
      }
      // Always let the server build the final combined prompt from DB prompts.
      // Send only the base control prompt so the server can append event/style sections correctly.
      const baseControlPrompt = "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design";
      
      const getAspectRatio = () => {
        if (!selectedShape) return "1:1"; // Default fallback
        // Map all available shape aspect ratios
        if (selectedShape.aspect === "16:9") return "16:9";
        if (selectedShape.aspect === "4:3") return "4:3";
        if (selectedShape.aspect === "1:1") return "1:1";
        if (selectedShape.aspect === "9:16") return "9:16";
        if (selectedShape.aspect === "3:4") return "3:4";
        if (selectedShape.aspect === "4:5") return "4:5";
        if (selectedShape.aspect === "5:7") return "5:7";
        if (selectedShape.aspect === "2:3") return "2:3";
        return "1:1"; // Fallback for any unmapped ratios
      };

      const result = await generateImageV2(
        baseControlPrompt,
        getAspectRatio(),
        selectedEventType,
        eventDetails,
        styleName,
        additionalDetails,
        undefined, // Provider now managed by admin settings, will use default
        undefined  // Quality now managed by admin settings, will use configured default
      );

      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setOriginalImageUrl(result.imageUrl); // Store the original image URL
        setGeneratedImageId(result.generatedImageId || null);
        const successMessage = `Image generated with ${result.provider} in ${result.generationTime}ms! ${result.cost > 0 ? `Cost: $${result.cost}` : 'Free generation'}`;
        toast.success(successMessage);
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("An error occurred while generating the image");
    } finally {
      setIsLoading(false);
    }
  };



  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Failed to download image");
    }
  };

  const handleDelete = () => {
    setGeneratedImageUrl(null);
    setGeneratedImageId(null);
    setOriginalImageUrl(null);
    setIsLiked(false);
    toast.success("Image deleted");
  };

  const handleUpscaleSuccess = (upscaledImageUrl: string) => {
    // Store the original image URL before replacing it with the upscaled version
    if (generatedImageUrl && !originalImageUrl) {
      setOriginalImageUrl(generatedImageUrl);
    }
    setGeneratedImageUrl(upscaledImageUrl);
    // Refresh user credits after upscaling
    if (session?.user?.id) {
      fetch('/api/user')
        .then(response => response.json())
        .then(userData => setUserCredits(userData.credits || 0))
        .catch(error => console.error('Error fetching updated credits:', error));
    }
  };

  const handleCopyPrompt = () => {
    let styleName: string | undefined;
    let additionalDetails: string | undefined;
    
    if (styleMode === 'preset') {
      // In preset mode: use preset style name + additional details
      const selectedPreset = selectedStyle ? stylePresets.find(s => s.id === selectedStyle) : undefined;
      styleName = selectedPreset ? selectedPreset.name : undefined; // Use name instead of description
      additionalDetails = customStyle.trim() || undefined;
    } else {
      // In custom mode: use event details form (no preset style, but event details are processed by prompt generator)
      styleName = undefined;
      additionalDetails = undefined;
      // Note: eventDetails are already being passed to generateEnhancedPrompt and will be processed there
    }
    
    const enhancedPrompt = generateEnhancedPrompt("", selectedEventType, eventDetails, styleName, additionalDetails);
    navigator.clipboard.writeText(enhancedPrompt);
    toast.success("Prompt copied to clipboard!");
  };

  const getRandomStyle = () => {
    // Get all available styles including placeholders
    const randomIndex = Math.floor(Math.random() * stylePresets.length);
    return stylePresets[randomIndex];
  };

  const handleReset = () => {
    setSelectedStyle(null);
    setSelectedShape(null);
    setSelectedEventType(null);
    setEventDetails({});
    setEventDetailsValid(false);
    setGeneratedImageUrl(null);
    setOriginalImageUrl(null);
    setCurrentStep(1);
    setStyleMode('preset');
    setCustomStyle('');

    setIsLiked(false);
    setSelectedLogos([]);
    
    toast.success("Form reset successfully!");
  };

  // Logo-related functions
  const handleLogoSelect = (logo: any) => {
    const newLogo = {
      id: `logo-${Date.now()}`,
      logo,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0,
      opacity: 1
    };
    setSelectedLogos(prev => [...prev, newLogo]);
    setShowLogoSearch(false);
    toast.success(`Added ${logo.name} logo`);
  };

  const handleLogoRemove = (logoId: string) => {
    setSelectedLogos(prev => prev.filter(logo => logo.id !== logoId));
    toast.success("Logo removed");
  };

  const handleLogoUpdate = (logoId: string, updates: any) => {
    setSelectedLogos(prev => prev.map(logo => 
      logo.id === logoId ? { ...logo, ...updates } : logo
    ));
  };

  const steps = [
    { id: 1, name: "Event Type", icon: ImageIcon, completed: !!selectedEventType },
    { id: 2, name: "Event Details & Style", icon: Settings, completed: 
        styleMode === 'preset' 
          ? selectedStyle !== null
          : eventDetailsValid 
    },
    { id: 3, name: "Shape", icon: Crop, completed: selectedShape !== null },
    { id: 4, name: "Generate", icon: Zap, completed: !!generatedImageUrl }
  ];

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col gap-6 lg:flex-row">
        {/* Left Sidebar - Settings Panel */}
        <div className="flex h-full flex-col lg:w-1/3 xl:w-2/5">
          <Card className="flex h-full flex-col shadow-lg">
            {/* Scrollable Settings Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Back to Calendar Button */}
              {selectedEventType === 'HOLIDAY_CELEBRATION' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/calendar')}
                      className="text-xs"
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      Back to Calendar
                    </Button>
                  </div>
                  
                  {/* Holiday Context Display */}
                  {isLoadingHolidayData && (
                    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-blue-800 dark:text-blue-200">
                            Loading holiday data...
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {eventDetails.holiday && !isLoadingHolidayData && (
                    <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            {eventDetails.holiday} Celebration
                          </span>
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          {eventDetails.context && (
                            <div>Type: {eventDetails.context}</div>
                          )}
                          {eventDetails.venue && (
                            <div>Venue: {eventDetails.venue}</div>
                          )}

                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}



              {/* Step 1: Event Type Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs transition-all ${
                    selectedEventType 
                      ? 'bg-green-500 text-white' 
                      : currentStep === 1
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {selectedEventType ? (
                      <CheckCircle className="size-3" />
                    ) : (
                      <ImageIcon className="size-3" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium">1. Choose Event Type</h3>
                  {selectedEventType === 'HOLIDAY_CELEBRATION' && eventDetails.holiday && (
                    <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                      <Sparkles className="mr-1 h-3 w-3" />
                      From Calendar
                    </Badge>
                  )}
                  {selectedEventType && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {eventTypes.find(event => event.id === selectedEventType)?.name}
                    </Badge>
                  )}
                </div>
                
                {/* Progress Line to Step 2 */}
                {selectedEventType && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-green-500"></div>
                  </div>
                )}
                
                <Select
                  value={selectedEventType || ""}
                  onValueChange={(value) => {
                    setSelectedEventType(value);
                    setCurrentStep(2);
                    setIsEventDetailsSectionCollapsed(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{event.icon}</span>
                          <span className="text-sm">{event.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Event Details & Style */}
              <div className="space-y-4">
                <button
                  onClick={() => setIsEventDetailsSectionCollapsed(!isEventDetailsSectionCollapsed)}
                  className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs transition-all ${
                    (styleMode === 'preset' && selectedStyle) || (styleMode === 'custom' && eventDetailsValid)
                      ? 'bg-green-500 text-white' 
                      : currentStep === 2
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {(styleMode === 'preset' && selectedStyle) || (styleMode === 'custom' && eventDetailsValid) ? (
                      <CheckCircle className="size-3" />
                    ) : (
                      <Settings className="size-3" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium">2. Event Details & Style</h3>
                  {(selectedStyle || (styleMode === 'custom' && eventDetailsValid)) && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {styleMode === 'preset' && selectedStyle 
                        ? stylePresets.find(s => s.id === selectedStyle)?.name
                        : 'Custom Details'
                      }
                    </Badge>
                  )}
                  <ChevronRight 
                    className={`ml-auto size-4 transition-transform duration-200 ${
                      isEventDetailsSectionCollapsed ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {!isEventDetailsSectionCollapsed && (
                  <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Style Options</h4>
                  
                                      <ToggleGroup
                      type="single"
                      value={styleMode}
                      onValueChange={(value) => {
                        if (value) {
                          setStyleMode(value as 'preset' | 'custom');
                          if (value === 'preset') {
                            setCustomStyle('');
                          } else {
                            setSelectedStyle(null);
                          }
                          setCurrentStep(2);
                        }
                      }}
                      className="grid grid-cols-2"
                    >
                    <ToggleGroupItem value="preset" className="text-xs">
                      Use Presets
                    </ToggleGroupItem>
                    <ToggleGroupItem value="custom" className="text-xs">
                      Custom Style
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {/* Preset Mode: Additional Details + Style Presets */}
                  {styleMode === 'preset' && (
                    <div className="space-y-4">
                      {/* Detail Prompt */}
                      <div>
                        <h5 className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">Additional Details</h5>
                        <Textarea
                          placeholder="Add any specific details about your event (e.g., 'outdoor garden party', 'with balloons and streamers', 'casual dress code')"
                          value={customStyle}
                                                       onChange={(e) => {
                               setCustomStyle(e.target.value);
                               if (e.target.value.trim()) {
                                 setCurrentStep(3);
                                 setIsShapeSectionCollapsed(false);
                               }
                             }}
                          className="min-h-[60px] resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Optional: Add specific details to customize your image further.
                        </p>
                      </div>

                      {/* Style Presets */}
                      <div>
                        <h5 className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">Choose Style</h5>
                        


                        {/* Style Grid */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            {visibleStyles.map((style) => (
                            <Tooltip key={style.id}>
                              <TooltipTrigger asChild>
                                                                   <button
                                     onClick={() => {
                                       setSelectedStyle(style.id);
                                       setCurrentStep(3);
                                       setIsShapeSectionCollapsed(false);
                                     }}
                                  className={`group relative aspect-square overflow-hidden rounded-lg transition-all duration-200 hover:shadow-sm ${
                                    selectedStyle === style.id 
                                      ? 'shadow-sm ring-2 ring-purple-500 ring-offset-1' 
                                      : 'hover:ring-1 hover:ring-purple-300'
                                  }`}
                                >
                                  <img
                                    src={style.thumbnail}
                                    alt={style.name}
                                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.src = "/styles/placeholder.png"
                                    }}
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                    <p className="text-xs text-white">{style.name}</p>
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{style.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          </div>
                          
                          {/* Navigation Buttons */}
                          <div className="flex justify-center items-center gap-2">
                            {hasPrevPage && (
                              <button
                                onClick={handlePrevStyles}
                                className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30"
                              >
                                ← Previous
                              </button>
                            )}
                            
                            <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {currentStylePage + 1} of {totalStylePages}
                            </span>
                            
                            {hasNextPage && (
                              <button
                                onClick={handleNextStyles}
                                className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors duration-200 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/30"
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Style Mode: Event Details Form */}
                  {styleMode === 'custom' && (
                    <div className="space-y-3">
                      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">Event Details</h5>
                                              <EventQuestionsForm
                          eventType={selectedEventType}
                          eventDetails={eventDetails}
                          onEventDetailsChange={setEventDetails}
                          onValidationChange={(valid) => {
                            setEventDetailsValid(valid);
                            if (valid) {
                              setCurrentStep(3);
                              setIsShapeSectionCollapsed(false);
                            }
                          }}
                        />
                    </div>
                  )}
                </div>
                )}
                
                {/* Progress Line to Step 3 */}
                {((styleMode === 'preset' && selectedStyle) || (styleMode === 'custom' && eventDetailsValid)) && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-green-500"></div>
                  </div>
                )}
              </div>

              {/* Step 3: Shape Selection */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsShapeSectionCollapsed(!isShapeSectionCollapsed)}
                  className="flex w-full items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs transition-all ${
                    selectedShape
                      ? 'bg-green-500 text-white' 
                      : currentStep === 3
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {selectedShape ? (
                      <CheckCircle className="size-3" />
                    ) : (
                      <Crop className="size-3" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium">3. Choose Shape</h3>
                  {selectedShape && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {selectedShape.name}
                    </Badge>
                  )}
                  <ChevronRight 
                    className={`ml-auto size-4 transition-transform duration-200 ${
                      isShapeSectionCollapsed ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                
                {!isShapeSectionCollapsed && (
                  <div className="grid grid-cols-3 gap-2">
                  {shapes.map((shape) => {
                    // Determine social media platforms for this shape
                    const getSocialPlatforms = (shapeName: string, description: string) => {
                      const platforms = [];
                      if (shapeName.includes('Instagram') || description.includes('Instagram')) {
                        platforms.push({ name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' });
                      }
                      if (shapeName.includes('TikTok') || description.includes('TikTok')) {
                        platforms.push({ name: 'TikTok', color: 'bg-gradient-to-r from-pink-500 to-blue-500' });
                      }
                      if (description.includes('Facebook')) {
                        platforms.push({ name: 'Facebook', color: 'bg-blue-600' });
                      }
                      if (description.includes('LinkedIn')) {
                        platforms.push({ name: 'LinkedIn', color: 'bg-blue-700' });
                      }
                      if (description.includes('YouTube')) {
                        platforms.push({ name: 'YouTube', color: 'bg-red-600' });
                      }
                      if (shapeName.includes('Flyer') || description.includes('flyer') || description.includes('poster')) {
                        platforms.push({ name: 'Print', color: 'bg-green-600' });
                      }
                      if (shapeName.includes('Card') || description.includes('card') || description.includes('invitation')) {
                        platforms.push({ name: 'Print', color: 'bg-green-600' });
                      }
                      return platforms;
                    };

                    const socialPlatforms = getSocialPlatforms(shape.name, shape.description);

                    return (
                      <Tooltip key={shape.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setSelectedShape(shape);
                              setCurrentStep(4);
                            }}
                            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all duration-200 hover:shadow-sm ${
                              selectedShape?.id === shape.id 
                                ? 'border-purple-500 bg-purple-50 shadow-sm dark:bg-purple-950/50' 
                                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div 
                              className={`border border-gray-300 transition-colors duration-200 dark:border-gray-600 ${
                                selectedShape?.id === shape.id ? 'border-purple-500' : ''
                              }`}
                              style={{
                                width: '40px',
                                height: `${(40 * shape.height) / shape.width}px`,
                              }}
                            />
                            <div className="text-center">
                              <p className="text-xs font-medium">{shape.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{shape.aspect}</p>
                              {socialPlatforms.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center mt-1">
                                  {socialPlatforms.map((platform, index) => (
                                    <span
                                      key={index}
                                      className={`text-[8px] px-1 py-0.5 rounded text-white font-medium ${platform.color}`}
                                    >
                                      {platform.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="mb-1">{shape.description}</p>
                            {socialPlatforms.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-gray-400">Perfect for:</span>
                                {socialPlatforms.map((platform, index) => (
                                  <span
                                    key={index}
                                    className={`text-[8px] px-1 py-0.5 rounded text-white font-medium ${platform.color}`}
                                  >
                                    {platform.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                )}
                
                {/* Progress Line to Step 4 */}
                {selectedShape && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-green-500"></div>
                  </div>
                )}
              </div>

              {/* Generate Button at bottom of left sidebar */}
              <div 
                id="generate-button-container"
                className="shrink-0 border-t p-6 bg-white dark:bg-gray-950 transition-all duration-300"
              >
                <Button 
                  className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl ${
                    selectedShape !== null && userCredits > 0 && selectedEventType && (
                      styleMode === 'preset' 
                        ? selectedStyle !== null
                        : eventDetailsValid
                    ) ? 'animate-breathing' : ''
                  }`}
                  size="lg"
                  onClick={handleGenerateImage}
                  disabled={isLoading || userCredits <= 0 || !selectedEventType || !selectedShape || (
                    styleMode === 'preset' 
                      ? selectedStyle === null
                      : !eventDetailsValid
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="loader"></div>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5" />
                      Generate Event
                    </div>
                  )}
                </Button>
                
                {userCredits <= 0 && (
                  <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
                    Insufficient credits. Please upgrade your plan to generate events.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Area - Image Generation and Display */}
        <div className="flex h-screen flex-col lg:w-2/3 xl:w-3/5">
          <Card className="flex h-full flex-col shadow-lg" style={{ overflow: 'auto' }}>
            {/* Header */}
            <div className="shrink-0 border-b p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs transition-all ${
                    generatedImageUrl
                      ? 'bg-green-500 text-white' 
                      : currentStep === 4
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {generatedImageUrl ? (
                      <CheckCircle className="size-3" />
                    ) : (
                      <Zap className="size-3" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Generate Your Image
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Step 4 of 4 - Create your image
                    </p>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="size-8 p-0"
                    >
                                          <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset form</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Image Display Area */}
            <div className="flex flex-1 flex-col p-6">
              {generatedImageUrl ? (
                <div className="flex min-h-0 flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Generated Event</h3>
                    <div className="flex gap-2">
                      {!toggleLoading && imageEditEnabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Button>
                      )}
                      {generatedImageId && (
                        <UpscaleButton
                          imageId={generatedImageId}
                          onUpscaleSuccess={handleUpscaleSuccess}
                          disabled={userCredits <= 0}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLogoSearch(true)}
                      >
                        <ImageIcon className="mr-2 size-4" />
                        Add Logo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2 size-4" />
                        Download
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedImageUrl);
                              toast.success("Image URL copied to clipboard!");
                            }}
                          >
                            <Share2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy image URL</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 items-center justify-center p-2">
                    <div className="group relative w-full">
                      {/* Show before/after slider if we have both original and upscaled images */}
                      {originalImageUrl && generatedImageUrl && originalImageUrl !== generatedImageUrl ? (
                        <div className="overflow-hidden rounded-lg border shadow-lg relative">
                          <BeforeAfterSlider
                            beforeImage={originalImageUrl}
                            afterImage={generatedImageUrl}
                            alt="Before and after upscaling"
                            className="h-auto w-full object-contain"
                          />
                          
                          {/* Logo Overlays */}
                          {selectedLogos.map((logoData) => (
                            <LogoOverlay
                              key={logoData.id}
                              logo={logoData.logo}
                              onRemove={() => handleLogoRemove(logoData.id)}
                              onUpdate={(updates) => handleLogoUpdate(logoData.id, updates)}
                              imageWidth={selectedShape?.width || 1080}
                              imageHeight={selectedShape?.height || 1080}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border shadow-lg relative">
                          <WatermarkedImage 
                            src={generatedImageUrl} 
                            alt="Generated" 
                            className="h-auto w-full object-contain"
                          />
                          
                          {/* Logo Overlays */}
                          {selectedLogos.map((logoData) => (
                            <LogoOverlay
                              key={logoData.id}
                              logo={logoData.logo}
                              onRemove={() => handleLogoRemove(logoData.id)}
                              onUpdate={(updates) => handleLogoUpdate(logoData.id, updates)}
                              imageWidth={selectedShape?.width || 1080}
                              imageHeight={selectedShape?.height || 1080}
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-800/90"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setIsLiked(!isLiked)}>
                              <Heart className={`mr-2 size-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              {isLiked ? 'Unlike' : 'Like'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete}>
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50">
                    <h4 className="mb-2 text-sm font-medium">Generation Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Event Type:</span>
                        <p className="font-medium">{eventTypes.find(e => e.id === selectedEventType)?.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Style:</span>
                        <p className="font-medium">
                          {styleMode === 'preset' && selectedStyle 
                            ? (() => {
                                const selectedPreset = stylePresets.find(s => s.id === selectedStyle);
                                if (selectedPreset) {
                                  // Show first 40 characters of description with ellipsis if longer
                                  const desc = selectedPreset.description;
                                  return desc.length > 40 ? `${desc.substring(0, 40)}...` : desc;
                                }
                                return selectedPreset?.name || 'Unknown';
                              })()
                            : 'Custom Details'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Shape:</span>
                        <p className="font-medium">{selectedShape ? `${selectedShape.name} (${selectedShape.aspect})` : 'Not selected'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Credits Used:</span>
                        <p className="font-medium">1</p>
                      </div>
                      
                      {/* Show event details in custom mode */}
                      {styleMode === 'custom' && Object.keys(eventDetails).length > 0 && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Event Details:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(eventDetails).map(([key, value]) => (
                              <p key={key} className="font-medium text-xs">
                                {key}: {value}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Show additional details in preset mode */}
                      {styleMode === 'preset' && customStyle.trim() && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Additional Details:</span>
                          <p className="font-medium">{customStyle.trim()}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Combined Prompt Preview */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Combined Prompt:</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-64">
                                This shows how all your selections (event type, details, style, and additional details) are combined to create the final image prompt.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPrompt}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded border p-3 max-h-24 overflow-y-auto">
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {(() => {
                            let styleName: string | undefined;
                            let additionalDetails: string | undefined;
                            
                            if (styleMode === 'preset') {
                              const selectedPreset = selectedStyle ? stylePresets.find(s => s.id === selectedStyle) : undefined;
                              styleName = selectedPreset ? selectedPreset.name : undefined; // Use name instead of description
                              additionalDetails = customStyle.trim() || undefined;
                            } else {
                              styleName = undefined;
                              additionalDetails = undefined;
                            }
                            
                            return generateEnhancedPrompt("", selectedEventType, eventDetails, styleName, additionalDetails);
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="space-y-4 text-center">
                    {isLoading ? (
                      <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-gray-100 p-8 dark:bg-gray-800">
                        <Image 
                          src="/astronaut-logo.png" 
                          alt="EventCraftAI Logo" 
                          width={128}
                          height={128}
                          className="animate-spin"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-gray-100 p-8 dark:bg-gray-800">
                        <ImageIcon className="size-16 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {isLoading ? "Generating your event..." : "Your event will appear here"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isLoading 
                          ? "Please wait while our AI creates your masterpiece"
                          : "Configure your settings and click generate to create your event"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>


          </Card>
        </div>

        {/* Image Editor Modal */}
        {isEditing && generatedImageUrl && (
          <ImageEditorModal
            imageUrl={generatedImageUrl}
            onClose={() => setIsEditing(false)}
            onEdit={(editedImageUrl: string) => {
              setGeneratedImageUrl(editedImageUrl);
              setIsEditing(false);
            }}
          />
        )}

        {/* Logo Search Modal */}
        {showLogoSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <LogoSearch
              onLogoSelect={handleLogoSelect}
              onClose={() => setShowLogoSearch(false)}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 