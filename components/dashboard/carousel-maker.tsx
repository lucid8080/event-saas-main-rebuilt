"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "@/styles/loader.css";
import { 
  Plus, 
  Minus, 
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
  Calendar,
  ArrowLeft,
  ArrowRight,
  Move,
  Type,
  Layers,
  FileText
} from "lucide-react";
import { Icons } from "@/components/shared/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { generateCarouselBackground } from "@/actions/generate-carousel-background";
import { generateCarouselText } from "@/actions/generate-carousel-text";
import { generateCarouselLongImage } from "@/actions/generate-carousel-long-image";
import { createSlidePreviews, aspectRatioToCSS } from "@/lib/carousel-image-slicer";

// Carousel slide interface
interface CarouselSlide {
  id: string;
  backgroundPrompt: string;
  backgroundImage?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  textContent: string; // Legacy field for backward compatibility
  textStyle: {
    fontSize: number;
    color: string;
    fontFamily: string;
    position: 'top' | 'center' | 'bottom';
    alignment: 'left' | 'center' | 'right';
  };
  // New enhanced text system
  textElements: TextElement[];
  elements: CarouselElement[];
}

// Enhanced text element interface with comprehensive styling
interface TextElement {
  id: string;
  type: 'header' | 'body' | 'caption' | 'cta' | 'slider-number';
  content: string;
  position: {
    x: number; // Percentage from left (0-100)
    y: number; // Percentage from top (0-100)
  };
  style: {
    fontSize: number;
    fontWeight: 'normal' | 'bold' | '600' | '700' | '800' | '900';
    color: string;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textShadow?: {
      x: number;
      y: number;
      blur: number;
      color: string;
    };
    backgroundColor?: string;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    borderRadius: number;
    opacity: number;
    zIndex: number;
  };
  isEditable: boolean;
  isVisible: boolean;
}

// Carousel element interface (shapes, icons, etc.)
interface CarouselElement {
  id: string;
  type: 'shape' | 'icon' | 'emoji' | 'divider';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
}



// Editable text element component
interface EditableTextElementProps {
  element: TextElement;
  isEditing: boolean;
  isSelected: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
  onStartDrag: (elementId: string) => void;
  onStopDrag: () => void;
}

const EditableTextElement = React.memo(({
  element,
  isEditing,
  isSelected,
  onStartEdit,
  onStopEdit,
  onSelect,
  onUpdate,
  onDelete,
  onStartDrag,
  onStopDrag
}: EditableTextElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{x: number, y: number} | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef<string>(element.content);

  const handleDoubleClick = () => {
    if (element.isEditable) {
      onStartEdit();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return; // Don't drag while editing
    
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    
    // Set initial drag position to current position
    setDragPosition(element.position);
    
    // Calculate the offset from the element's center to the mouse position
    const container = e.currentTarget.closest('.slide-preview-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const elementCenterX = (element.position.x / 100) * containerRect.width;
    const elementCenterY = (element.position.y / 100) * containerRect.height;
    
    const offsetX = e.clientX - containerRect.left - elementCenterX;
    const offsetY = e.clientY - containerRect.top - elementCenterY;
    
    // Store the offset and start dragging
    onStartDrag(element.id);
    setIsDragging(true);
    
    // Store the offset in a data attribute for the global handler to use
    e.currentTarget.setAttribute('data-drag-offset-x', offsetX.toString());
    e.currentTarget.setAttribute('data-drag-offset-y', offsetY.toString());
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPosition(null);
    onStopDrag();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onStopEdit();
    } else if (e.key === 'Delete' && isSelected) {
      onDelete();
    }
  };

  const getTextShadowStyle = () => {
    if (!element.style.textShadow) return '';
    const { x, y, blur, color } = element.style.textShadow;
    return `${x}px ${y}px ${blur}px ${color}`;
  };

  const getBackgroundStyle = () => {
    if (!element.style.backgroundColor) return {};
    return {
      backgroundColor: element.style.backgroundColor,
      padding: `${element.style.padding.top}px ${element.style.padding.right}px ${element.style.padding.bottom}px ${element.style.padding.left}px`,
      borderRadius: `${element.style.borderRadius}px`
    };
  };

  return (
    <div
      ref={elementRef}
      className={`absolute ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isEditing ? 'z-50' : 'z-10'} ${
        isDragging ? 'cursor-grabbing ring-2 ring-blue-400 ring-opacity-75' : 'cursor-move'
      }`}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: element.style.opacity,
        zIndex: element.style.zIndex,
        userSelect: isDragging ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        pointerEvents: isDragging ? 'none' : 'auto',
        willChange: isDragging ? '' : 'auto',
        width: isDragging ? '300px' : 'auto',
        maxWidth: isDragging ? '300px' : '300px'
      }}
      data-element-id={element.id}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={onStopEdit}
          onKeyDown={handleKeyDown}
          className="min-w-[200px] bg-transparent border-none resize-none outline-none"
          style={{
            fontSize: `${element.style.fontSize}px`,
            fontWeight: element.style.fontWeight,
            color: element.style.color,
            fontFamily: element.style.fontFamily,
            textAlign: element.style.textAlign,
            lineHeight: element.style.lineHeight,
            letterSpacing: `${element.style.letterSpacing}px`,
            textShadow: getTextShadowStyle(),
            ...getBackgroundStyle()
          }}
          autoFocus
        />
      ) : (
        <div
          className={`select-none ${element.isEditable && !isDragging ? 'hover:bg-blue-500 hover:bg-opacity-10 hover:rounded' : ''}`}
          style={{
            fontSize: `${element.style.fontSize}px`,
            fontWeight: element.style.fontWeight,
            color: element.style.color,
            fontFamily: element.style.fontFamily,
            textAlign: element.style.textAlign,
            lineHeight: element.style.lineHeight,
            letterSpacing: `${element.style.letterSpacing}px`,
            textShadow: getTextShadowStyle(),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxWidth: '300px',
            width: isDragging ? '300px' : 'auto',
            height: isDragging ? 'auto' : undefined,
            overflow: isDragging ? 'hidden' : 'visible',
            ...getBackgroundStyle()
          }}
        >
          {element.content}
        </div>
      )}
      
      {/* Selection indicator */}
      {isSelected && !isEditing && (
        <div className="absolute border-2 border-blue-500 border-dashed -inset-2 pointer-events-none" />
      )}
    </div>
  );
});

// Carousel maker component
export function CarouselMaker() {
  const { data: session } = useSession();
  const [userCredits, setUserCredits] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>([
    {
      id: '1',
      backgroundPrompt: '',
      textContent: '',
      textStyle: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Poppins',
        position: 'center',
        alignment: 'center'
      },
      textElements: [],
      elements: []
    },
    {
      id: '2',
      backgroundPrompt: '',
      textContent: '',
      textStyle: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Poppins',
        position: 'center',
        alignment: 'center'
      },
      textElements: [],
      elements: []
    },
    {
      id: '3',
      backgroundPrompt: '',
      textContent: '',
      textStyle: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Poppins',
        position: 'center',
        alignment: 'center'
      },
      textElements: [],
      elements: []
    }
  ]);

  const [carouselSettings, setCarouselSettings] = useState({
    aspectRatio: '1:1',
    title: '',
    selectedTitle: '',
    customTitle: '',
    description: '',
    slideCount: 3,
    globalBackgroundPrompt: '',
    selectedPreset: ''
  });
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [longImageUrl, setLongImageUrl] = useState<string | null>(null);
  const [isGeneratingLongImage, setIsGeneratingLongImage] = useState(false);
  
  // Real-time text editing state
  const [editingTextElement, setEditingTextElement] = useState<string | null>(null);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(null);
  const [textElementBeingDragged, setTextElementBeingDragged] = useState<string | null>(null);

  // Global mouse event handlers for dragging
  useEffect(() => {
    let lastUpdateTime = 0;
    const throttleDelay = 16; // ~60fps
    let dragStartPosition: {x: number, y: number} | null = null;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (textElementBeingDragged) {
        e.preventDefault();
        
        // Throttle updates for better performance
        const now = Date.now();
        if (now - lastUpdateTime < throttleDelay) return;
        lastUpdateTime = now;
        
        const container = document.querySelector('.slide-preview-container');
        if (!container) return;
        
        // Find the dragged element
        const draggedElement = document.querySelector(`[data-element-id="${textElementBeingDragged}"]`);
        if (!draggedElement) return;
        
        // Get the stored offset
        const offsetX = parseFloat(draggedElement.getAttribute('data-drag-offset-x') || '0');
        const offsetY = parseFloat(draggedElement.getAttribute('data-drag-offset-y') || '0');
        
        const containerRect = container.getBoundingClientRect();
        
        // Calculate new position with offset
        const newX = ((e.clientX - containerRect.left - offsetX) / containerRect.width) * 100;
        const newY = ((e.clientY - containerRect.top - offsetY) / containerRect.height) * 100;
        
        // Constrain to container bounds
        const constrainedX = Math.max(0, Math.min(100, newX));
        const constrainedY = Math.max(0, Math.min(100, newY));
        
        // Update the element's position directly in the DOM for smooth dragging
        (draggedElement as HTMLElement).style.left = `${constrainedX}%`;
        (draggedElement as HTMLElement).style.top = `${constrainedY}%`;
      }
    };

    const handleGlobalMouseUp = () => {
      if (textElementBeingDragged) {
        // Get the final position from the DOM and update the state
        const draggedElement = document.querySelector(`[data-element-id="${textElementBeingDragged}"]`) as HTMLElement | null;
        if (draggedElement) {
          const finalX = parseFloat(draggedElement.style.left);
          const finalY = parseFloat(draggedElement.style.top);
          
          const currentSlide = slides[currentSlideIndex];
          if (currentSlide && !isNaN(finalX) && !isNaN(finalY)) {
            updateTextElement(currentSlide.id, textElementBeingDragged, {
              position: { x: finalX, y: finalY }
            });
          }
        }
      }
      
      setTextElementBeingDragged(null);
      // Reset cursor
      document.body.style.cursor = '';
    };

    if (textElementBeingDragged) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      // Set global cursor
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      // Reset cursor
      document.body.style.cursor = '';
    };
  }, [textElementBeingDragged, currentSlideIndex, slides]);

  // Fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user');
          if (response.ok) {
            const userData = await response.json();
            setUserCredits(userData.credits || 0);
          }
        } catch (error) {
          console.error('Error fetching user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [session?.user?.id]);

  // Background presets optimized for text readability and seamless design
  const backgroundPresets = [
    {
      id: 'peach-waves',
      name: 'Peach Waves',
      description: 'Soft peach background with flowing wavy shapes',
      prompt: 'soft peach salmon background with flowing abstract wavy shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted tones, subtle geometric lines, flat design, unified visual experience, perfect for text overlay',
      category: 'warm'
    },
    {
      id: 'mint-flow',
      name: 'Mint Flow',
      description: 'Gentle mint background with organic flowing shapes',
      prompt: 'gentle mint green background with organic flowing shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted tones, subtle geometric elements, flat design, unified visual experience, text-friendly',
      category: 'cool'
    },
    {
      id: 'lavender-smooth',
      name: 'Lavender Smooth',
      description: 'Smooth lavender background with soft curves',
      prompt: 'smooth lavender background with soft curved shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted purple tones, subtle geometric patterns, flat design, unified visual experience, elegant simplicity',
      category: 'cool'
    },
    {
      id: 'coral-waves',
      name: 'Coral Waves',
      description: 'Coral background with flowing wave patterns',
      prompt: 'coral background with flowing wave patterns, completely seamless design that flows continuously from left to right, no visible breaks or separations, muted coral tones, subtle geometric lines, flat colors, unified visual experience, perfect for text readability',
      category: 'warm'
    },
    {
      id: 'sage-organic',
      name: 'Sage Organic',
      description: 'Sage green background with organic flowing shapes',
      prompt: 'sage green background with organic flowing shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted sage tones, subtle geometric elements, flat design, unified visual experience, natural feel',
      category: 'natural'
    },
    {
      id: 'dusty-rose',
      name: 'Dusty Rose',
      description: 'Dusty rose background with soft flowing patterns',
      prompt: 'dusty rose background with soft flowing patterns, completely seamless design that flows continuously from left to right, no visible breaks or separations, muted rose tones, subtle geometric shapes, flat colors, unified visual experience, elegant and professional',
      category: 'warm'
    },
    {
      id: 'slate-modern',
      name: 'Slate Modern',
      description: 'Slate gray background with modern flowing shapes',
      prompt: 'slate gray background with modern flowing shapes, completely seamless pattern that flows continuously from left to right, no visible breaks or separations, muted gray tones, subtle geometric lines, flat design, unified visual experience, contemporary style',
      category: 'neutral'
    },
    {
      id: 'cream-soft',
      name: 'Cream Soft',
      description: 'Soft cream background with gentle flowing patterns',
      prompt: 'soft cream background with gentle flowing patterns, completely seamless design that flows continuously from left to right, no visible breaks or separations, muted cream tones, subtle geometric elements, flat colors, unified visual experience, warm and inviting',
      category: 'warm'
    },
    {
      id: 'ux-gradient-purple',
      name: 'UX Purple Gradient',
      description: 'Modern purple gradient for UX design content',
      prompt: 'modern purple gradient background with subtle geometric shapes, completely seamless design that flows continuously from left to right, no visible breaks or separations, purple to indigo gradient, subtle geometric elements, flat design, unified visual experience, professional and modern',
      category: 'modern'
    },
    {
      id: 'tech-blue-gradient',
      name: 'Tech Blue Gradient',
      description: 'Professional blue gradient for tech content',
      prompt: 'professional blue gradient background with modern geometric patterns, completely seamless design that flows continuously from left to right, no visible breaks or separations, blue to cyan gradient, subtle geometric elements, flat design, unified visual experience, tech and professional',
      category: 'modern'
    },
    {
      id: 'brand-orange-gradient',
      name: 'Brand Orange Gradient',
      description: 'Energetic orange gradient for brand content',
      prompt: 'energetic orange gradient background with flowing organic shapes, completely seamless design that flows continuously from left to right, no visible breaks or separations, orange to coral gradient, subtle geometric elements, flat design, unified visual experience, energetic and modern',
      category: 'warm'
    },
    {
      id: 'minimal-gray',
      name: 'Minimal Gray',
      description: 'Minimalist gray background for clean design',
      prompt: 'minimalist gray background with subtle geometric patterns, completely seamless design that flows continuously from left to right, no visible breaks or separations, light gray tones, subtle geometric elements, flat design, unified visual experience, clean and minimal',
      category: 'neutral'
    },
    {
      id: 'corporate-navy',
      name: 'Corporate Navy',
      description: 'Professional navy background for business content',
      prompt: 'professional navy background with modern geometric shapes, completely seamless design that flows continuously from left to right, no visible breaks or separations, navy blue tones, subtle geometric elements, flat design, unified visual experience, corporate and professional',
      category: 'business'
    }
  ];



  // Carousel title options
  const carouselTitleOptions = [
    { value: 'ux-design-journey', label: 'UX Design Journey', description: 'Professional UX design process showcase' },
    { value: 'business-tips', label: 'Business Tips & Insights', description: 'Essential business strategies and tips' },
    { value: 'product-launch', label: 'Product Launch', description: 'Exciting product announcement and features' },
    { value: 'brand-story', label: 'Our Brand Story', description: 'Company mission, values, and journey' },
    { value: 'educational-series', label: 'Learning Series', description: 'Educational content and tutorials' },
    { value: 'marketing-campaign', label: 'Marketing Campaign', description: 'Engaging marketing content and strategies' },
    { value: 'personal-journey', label: 'Personal Journey', description: 'Personal story and experiences' },
    { value: 'social-media-tips', label: 'Social Media Tips', description: 'Social media best practices and strategies' },
    { value: 'design-principles', label: 'Design Principles', description: 'Core design principles and guidelines' },
    { value: 'customer-success', label: 'Customer Success Stories', description: 'Client testimonials and case studies' },
    { value: 'industry-insights', label: 'Industry Insights', description: 'Trends and insights from the industry' },
    { value: 'team-spotlight', label: 'Team Spotlight', description: 'Meet our team and company culture' },
    { value: 'how-to-guide', label: 'How-To Guide', description: 'Step-by-step tutorials and guides' },
    { value: 'feature-showcase', label: 'Feature Showcase', description: 'Product features and capabilities' },
    { value: 'behind-scenes', label: 'Behind the Scenes', description: 'Company culture and daily operations' },
    { value: 'custom', label: 'Custom Title', description: 'Enter your own custom title' }
  ];

  // Font options for text styling
  const fontOptions = [
    { value: 'Inter', label: 'Inter', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Poppins', label: 'Poppins', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Roboto', label: 'Roboto', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Open Sans', label: 'Open Sans', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Montserrat', label: 'Montserrat', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Lato', label: 'Lato', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Raleway', label: 'Raleway', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Nunito', label: 'Nunito', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Sans Serif', preview: 'Aa' },
    { value: 'DM Sans', label: 'DM Sans', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Work Sans', label: 'Work Sans', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Manrope', label: 'Manrope', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Inter Tight', label: 'Inter Tight', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Outfit', label: 'Outfit', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Albert Sans', label: 'Albert Sans', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Onest', label: 'Onest', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Lexend', label: 'Lexend', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Figtree', label: 'Figtree', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Sora', label: 'Sora', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Display', preview: 'Aa' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace', preview: 'Aa' },
    { value: 'Fira Code', label: 'Fira Code', category: 'Monospace', preview: 'Aa' },
    { value: 'IBM Plex Mono', label: 'IBM Plex Mono', category: 'Monospace', preview: 'Aa' },
    { value: 'Cal Sans', label: 'Cal Sans', category: 'Display', preview: 'Aa' },
    { value: 'Geist', label: 'Geist', category: 'Sans Serif', preview: 'Aa' },
    { value: 'Urbanist', label: 'Urbanist', category: 'Sans Serif', preview: 'Aa' },
  ];

  // Aspect ratio options with social media icons
  const aspectRatioOptions = [
    { 
      value: '1:1', 
      label: 'Square (1:1)', 
      description: 'Instagram posts, LinkedIn',
      platforms: [
        { name: 'Instagram', icon: Icons.instagram, color: 'text-pink-500' },
        { name: 'LinkedIn', icon: Icons.linkedin, color: 'text-blue-600' },
        { name: 'Facebook', icon: Icons.facebook, color: 'text-blue-500' }
      ]
    },
    { 
      value: '4:5', 
      label: 'Portrait (4:5)', 
      description: 'Instagram portrait posts',
      platforms: [
        { name: 'Instagram', icon: Icons.instagram, color: 'text-pink-500' }
      ]
    },
    { 
      value: '16:9', 
      label: 'Landscape (16:9)', 
      description: 'LinkedIn carousels, TikTok',
      platforms: [
        { name: 'LinkedIn', icon: Icons.linkedin, color: 'text-blue-600' },
        { name: 'TikTok', icon: Icons.tiktok, color: 'text-black dark:text-white' },
        { name: 'YouTube', icon: Icons.youtube, color: 'text-red-600' }
      ]
    },
    { 
      value: '9:16', 
      label: 'Story (9:16)', 
      description: 'Instagram Stories, TikTok',
      platforms: [
        { name: 'Instagram', icon: Icons.instagram, color: 'text-pink-500' },
        { name: 'TikTok', icon: Icons.tiktok, color: 'text-black dark:text-white' }
      ]
    }
  ];

  // Add new slide
  const addSlide = () => {
    if (slides.length >= 20) {
      toast.error("Maximum 20 slides allowed");
      return;
    }
    
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      backgroundPrompt: '',
      textContent: '',
      textStyle: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Poppins',
        position: 'center',
        alignment: 'center'
      },
      textElements: [],
      elements: []
    };
    
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    toast.success("New slide added");
  };

  // Set slide count and create/remove slides accordingly
  const setSlideCount = (count: number) => {
    if (count < 3) {
      toast.error("Minimum 3 slides required");
      return;
    }
    
    if (count > 20) {
      toast.error("Maximum 20 slides allowed");
      return;
    }

    setCarouselSettings(prev => ({ ...prev, slideCount: count }));

    if (count > slides.length) {
      // Add slides
      const slidesToAdd = count - slides.length;
      const newSlides: CarouselSlide[] = [];
      
      for (let i = 0; i < slidesToAdd; i++) {
        newSlides.push({
          id: Date.now().toString() + i,
          backgroundPrompt: '',
          textContent: '',
          textStyle: {
            fontSize: 24,
            color: '#ffffff',
            fontFamily: 'Inter',
            position: 'center',
            alignment: 'center'
          },
          textElements: [],
          elements: []
        });
      }
      
      setSlides([...slides, ...newSlides]);
      toast.success(`Added ${slidesToAdd} slide${slidesToAdd > 1 ? 's' : ''}`);
    } else if (count < slides.length) {
      // Remove slides from the end
      const slidesToRemove = slides.length - count;
      const newSlides = slides.slice(0, count);
      
      setSlides(newSlides);
      
      // Adjust current slide index if needed
      if (currentSlideIndex >= count) {
        setCurrentSlideIndex(count - 1);
      }
      
      toast.success(`Removed ${slidesToRemove} slide${slidesToRemove > 1 ? 's' : ''}`);
    }
  };

  // Remove slide
  const removeSlide = (slideId: string) => {
    if (slides.length <= 3) {
      toast.error("Minimum 3 slides required");
      return;
    }
    
    const newSlides = slides.filter(slide => slide.id !== slideId);
    setSlides(newSlides);
    
    // Update slide count in settings
    setCarouselSettings(prev => ({ ...prev, slideCount: newSlides.length }));
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
    
    toast.success("Slide removed");
  };

  // Update slide
  const updateSlide = (slideId: string, updates: Partial<CarouselSlide>) => {
    setSlides(slides.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    ));
  };

  // Text element management functions
  const addTextElement = (slideId: string, type: TextElement['type'] = 'body') => {
    const defaultStyles = {
      header: {
        fontSize: 36,
        fontWeight: '700' as const,
        color: '#1f2937',
        fontFamily: 'Poppins',
        textAlign: 'center' as const,
        lineHeight: 1.2,
        letterSpacing: -0.5,
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        borderRadius: 0,
        opacity: 1,
        zIndex: 10
      },
      body: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: '#374151',
        fontFamily: 'Poppins',
        textAlign: 'left' as const,
        lineHeight: 1.6,
        letterSpacing: 0,
        padding: { top: 15, right: 15, bottom: 15, left: 15 },
        borderRadius: 0,
        opacity: 1,
        zIndex: 5
      },
      caption: {
        fontSize: 16,
        fontWeight: 'normal' as const,
        color: '#6b7280',
        fontFamily: 'Poppins',
        textAlign: 'center' as const,
        lineHeight: 1.5,
        letterSpacing: 0.2,
        padding: { top: 10, right: 10, bottom: 10, left: 10 },
        borderRadius: 0,
        opacity: 0.9,
        zIndex: 3
      },
      cta: {
        fontSize: 22,
        fontWeight: '600' as const,
        color: '#ffffff',
        fontFamily: 'Poppins',
        textAlign: 'center' as const,
        lineHeight: 1.3,
        letterSpacing: 0,
        padding: { top: 15, right: 25, bottom: 15, left: 25 },
        borderRadius: 8,
        opacity: 1,
        zIndex: 8
      },
      'slider-number': {
        fontSize: 28,
        fontWeight: '700' as const,
        color: '#ffffff',
        fontFamily: 'Poppins',
        textAlign: 'center' as const,
        lineHeight: 1,
        letterSpacing: 0,
        padding: { top: 12, right: 12, bottom: 12, left: 12 },
        borderRadius: 50,
        opacity: 1,
        zIndex: 15
      }
    };

    const defaultContent = {
      header: 'Enter Your Header',
      body: 'Add your compelling content here...',
      caption: 'Supporting text or caption',
      cta: 'Learn More',
      'slider-number': `${slides.findIndex(s => s.id === slideId) + 1}`
    };

    const defaultPosition = {
      header: { x: 50, y: 25 },
      body: { x: 50, y: 55 },
      caption: { x: 50, y: 80 },
      cta: { x: 50, y: 70 },
      'slider-number': { x: 85, y: 15 }
    };

    const newTextElement: TextElement = {
      id: Date.now().toString(),
      type,
      content: defaultContent[type],
      position: defaultPosition[type],
      style: defaultStyles[type],
      isEditable: true,
      isVisible: true
    };

    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? { ...slide, textElements: [...slide.textElements, newTextElement] }
        : slide
    ));

    // Start editing the new element
    setEditingTextElement(newTextElement.id);
    setSelectedTextElement(newTextElement.id);
  };

  const updateTextElement = useCallback((slideId: string, elementId: string, updates: Partial<TextElement>) => {
    setSlides(prevSlides => prevSlides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            textElements: slide.textElements.map(element =>
              element.id === elementId ? { ...element, ...updates } : element
            )
          }
        : slide
    ));
  }, []);

  const deleteTextElement = (slideId: string, elementId: string) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            textElements: slide.textElements.filter(element => element.id !== elementId)
          }
        : slide
    ));
    
    // Clear editing state if the deleted element was being edited
    if (editingTextElement === elementId) {
      setEditingTextElement(null);
    }
    if (selectedTextElement === elementId) {
      setSelectedTextElement(null);
    }
  };

  const startEditingText = (elementId: string) => {
    setEditingTextElement(elementId);
    setSelectedTextElement(elementId);
  };

  const stopEditingText = () => {
    setEditingTextElement(null);
  };

  const selectTextElement = (elementId: string | null) => {
    setSelectedTextElement(elementId);
  };

  const createDefaultTextElements = (slideId: string) => {
    // Create a header and body text by default
    addTextElement(slideId, 'header');
    addTextElement(slideId, 'body');
  };

  // Generate background for current slide
  const selectPreset = (presetId: string) => {
    const preset = backgroundPresets.find(p => p.id === presetId);
    if (preset) {
      setCarouselSettings(prev => ({
        ...prev,
        globalBackgroundPrompt: preset.prompt,
        selectedPreset: presetId
      }));
      toast.success(`Applied ${preset.name} preset!`);
    }
  };

  const generateLongImageBackground = async () => {
    if (!carouselSettings.globalBackgroundPrompt.trim()) {
      toast.error('Please enter a global background prompt or select a preset');
      return;
    }

    if (userCredits <= 0) {
      toast.error("Insufficient credits");
      return;
    }

    if (!carouselSettings.title.trim()) {
      toast.error("Please enter a carousel title first");
      return;
    }

    setIsGeneratingBackground(true);
    try {
      const result = await generateCarouselLongImage(
        carouselSettings.globalBackgroundPrompt,
        slides.length,
        getCurrentTitle()
      );

      if (result.success && result.imageUrl) {
        setLongImageUrl(result.imageUrl);
        
        // Create slide previews from the long image
        const slidePreviews = createSlidePreviews(
          result.imageUrl,
          slides.length,
          carouselSettings.aspectRatio
        );
        
        // Update all slides with the cropped backgrounds and add sample text
        setSlides(prev => prev.map((slide, index) => {
          const preview = slidePreviews[index];
          if (preview) {
            // Create sample text elements for each slide
            const sampleTextElements: TextElement[] = [
              {
                id: `sample-header-${slide.id}`,
                type: 'header',
                content: `Slide ${index + 1} Header`,
                position: { x: 50, y: 25 },
                style: {
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  letterSpacing: 0,
                  padding: { top: 20, right: 20, bottom: 20, left: 20 },
                  borderRadius: 0,
                  opacity: 1,
                  zIndex: 10
                },
                isEditable: true,
                isVisible: true
              },
              {
                id: `sample-body-${slide.id}`,
                type: 'body',
                content: `This is sample body text for slide ${index + 1}. You can edit this text by double-clicking on it.`,
                position: { x: 50, y: 60 },
                style: {
                  fontSize: 18,
                  fontWeight: 'normal',
                  color: '#ffffff',
                  fontFamily: 'Poppins',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  letterSpacing: 0,
                  padding: { top: 15, right: 15, bottom: 15, left: 15 },
                  borderRadius: 0,
                  opacity: 1,
                  zIndex: 5
                },
                isEditable: true,
                isVisible: true
              },
              {
                id: `sample-number-${slide.id}`,
                type: 'slider-number',
                content: `${index + 1}`,
                position: { x: 85, y: 15 },
                style: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: 1,
                  letterSpacing: 0,
                  padding: { top: 10, right: 10, bottom: 10, left: 10 },
                  borderRadius: 50,
                  opacity: 1,
                  zIndex: 15
                },
                isEditable: true,
                isVisible: true
              }
            ];

            return {
              ...slide,
              backgroundImage: result.imageUrl,
              cropData: preview.cropData,
              textElements: sampleTextElements
            };
          }
          return slide;
        }));
        
        setUserCredits(prev => prev - result.creditsUsed);
        toast.success('Long image background generated with sample text!');
      } else {
        toast.error(result.error || 'Failed to generate long image background');
      }
    } catch (error) {
      console.error('Error generating long image background:', error);
      toast.error('An error occurred while generating the background');
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  const generateGlobalBackground = async () => {
    if (!carouselSettings.globalBackgroundPrompt.trim()) {
      toast.error('Please enter a global background prompt or select a preset');
      return;
    }

    if (userCredits <= 0) {
      toast.error("Insufficient credits");
      return;
    }

    if (!carouselSettings.title.trim()) {
      toast.error("Please enter a carousel title first");
      return;
    }

    setIsGeneratingBackground(true);
    try {
      const promises = slides.map(async (slide, index) => {
        const result = await generateCarouselBackground(
          carouselSettings.globalBackgroundPrompt,
          carouselSettings.aspectRatio,
          index + 1,
          getCurrentTitle()
        );
        return { slideId: slide.id, result };
      });

      const results = await Promise.all(promises);
      
      setSlides(prev => prev.map((slide, index) => {
        const result = results.find(r => r.slideId === slide.id);
        if (result && result.result.success && result.result.imageUrl) {
          // Add sample text elements if none exist
          const sampleTextElements: TextElement[] = slide.textElements.length === 0 ? [
            {
              id: `sample-header-${slide.id}`,
              type: 'header',
              content: `Slide ${index + 1} Header`,
              position: { x: 50, y: 25 },
              style: {
                fontSize: 32,
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Inter',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: 0,
                padding: { top: 20, right: 20, bottom: 20, left: 20 },
                borderRadius: 0,
                opacity: 1,
                zIndex: 10
              },
              isEditable: true,
              isVisible: true
            },
            {
              id: `sample-body-${slide.id}`,
              type: 'body',
              content: `This is sample body text for slide ${index + 1}. You can edit this text by double-clicking on it.`,
              position: { x: 50, y: 60 },
              style: {
                fontSize: 18,
                fontWeight: 'normal',
                color: '#ffffff',
                fontFamily: 'Inter',
                textAlign: 'center',
                lineHeight: 1.5,
                letterSpacing: 0,
                padding: { top: 15, right: 15, bottom: 15, left: 15 },
                borderRadius: 0,
                opacity: 1,
                zIndex: 5
              },
              isEditable: true,
              isVisible: true
            },
            {
              id: `sample-number-${slide.id}`,
              type: 'slider-number',
              content: `${index + 1}`,
              position: { x: 85, y: 15 },
              style: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#ffffff',
                fontFamily: 'Inter',
                textAlign: 'center',
                lineHeight: 1,
                letterSpacing: 0,
                padding: { top: 10, right: 10, bottom: 10, left: 10 },
                borderRadius: 50,
                opacity: 1,
                zIndex: 15
              },
              isEditable: true,
              isVisible: true
            }
          ] : slide.textElements;

          return { 
            ...slide, 
            backgroundImage: result.result.imageUrl,
            textElements: sampleTextElements
          };
        }
        return slide;
      }));

      const successCount = results.filter(r => r.result.success).length;
      const totalCreditsUsed = results.reduce((total, r) => total + (r.result.creditsUsed || 0), 0);
      setUserCredits(prev => prev - totalCreditsUsed);
      toast.success(`Generated backgrounds with sample text for ${successCount} out of ${slides.length} slides!`);
    } catch (error) {
      console.error('Error generating global backgrounds:', error);
      toast.error('Failed to generate global backgrounds');
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  // Helper function to get current title
  const getCurrentTitle = () => {
    if (carouselSettings.selectedTitle === 'custom') {
      return carouselSettings.customTitle;
    }
    return carouselSettings.title;
  };

  // Generate background for current slide
  const generateBackground = async () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide.backgroundPrompt.trim()) {
      toast.error('Please enter a background prompt');
      return;
    }

    if (userCredits <= 0) {
      toast.error("Insufficient credits");
      return;
    }

    if (!getCurrentTitle().trim()) {
      toast.error("Please enter a carousel title first");
      return;
    }

    setIsGeneratingBackground(true);
    try {
      const result = await generateCarouselBackground(
        currentSlide.backgroundPrompt,
        carouselSettings.aspectRatio,
        currentSlideIndex,
        getCurrentTitle()
      );

      if (result.success && result.imageUrl) {
        // Add sample text elements if none exist
        const sampleTextElements: TextElement[] = currentSlide.textElements.length === 0 ? [
          {
            id: `sample-header-${currentSlide.id}`,
            type: 'header',
            content: `Slide ${currentSlideIndex + 1} Header`,
            position: { x: 50, y: 25 },
            style: {
              fontSize: 32,
              fontWeight: 'bold',
              color: '#ffffff',
              fontFamily: 'Poppins',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: 0,
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              borderRadius: 0,
              opacity: 1,
              zIndex: 10
            },
            isEditable: true,
            isVisible: true
          },
          {
            id: `sample-body-${currentSlide.id}`,
            type: 'body',
            content: `This is sample body text for slide ${currentSlideIndex + 1}. You can edit this text by double-clicking on it.`,
            position: { x: 50, y: 60 },
            style: {
              fontSize: 18,
              fontWeight: 'normal',
              color: '#ffffff',
              fontFamily: 'Poppins',
              textAlign: 'center',
              lineHeight: 1.5,
              letterSpacing: 0,
              padding: { top: 15, right: 15, bottom: 15, left: 15 },
              borderRadius: 0,
              opacity: 1,
              zIndex: 5
            },
            isEditable: true,
            isVisible: true
          },
          {
            id: `sample-number-${currentSlide.id}`,
            type: 'slider-number',
            content: `${currentSlideIndex + 1}`,
            position: { x: 85, y: 15 },
            style: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center',
              lineHeight: 1,
              letterSpacing: 0,
              padding: { top: 10, right: 10, bottom: 10, left: 10 },
              borderRadius: 50,
              opacity: 1,
              zIndex: 15
            },
            isEditable: true,
            isVisible: true
          }
        ] : currentSlide.textElements;

        updateSlide(currentSlide.id, { 
          backgroundImage: result.imageUrl,
          textElements: sampleTextElements
        });
        setUserCredits(prev => prev - result.creditsUsed);
        toast.success('Background generated with sample text!');
      } else {
        toast.error(result.error || 'Failed to generate background');
      }
    } catch (error) {
      console.error('Error generating background:', error);
      toast.error('An error occurred while generating the background');
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  // Generate text content using AI with design principles
  const generateTextContent = async () => {
    const currentSlide = slides[currentSlideIndex];
    if (!getCurrentTitle().trim()) {
      toast.error("Please enter a carousel title");
      return;
    }

    setIsGeneratingText(true);
    try {
      // Determine slide type based on position
      let slideType: 'intro' | 'content' | 'conclusion' = 'content';
      if (currentSlideIndex === 0) {
        slideType = 'intro';
      } else if (currentSlideIndex === slides.length - 1) {
        slideType = 'conclusion';
      }

      const result = await generateCarouselText(
        getCurrentTitle(),
        currentSlideIndex,
        slides.length,
        slideType
      );

      if (result.success) {
        // Update legacy text content
        if (result.text) {
          updateSlide(currentSlide.id, { textContent: result.text });
        }
        
        // Update with new design elements if available
        if (result.designElements && result.designElements.length > 0) {
          const newTextElements: TextElement[] = result.designElements.map((designElement, index) => ({
            id: `generated-${currentSlide.id}-${index}`,
            type: designElement.type,
            content: designElement.content,
            position: designElement.position,
            style: {
              ...designElement.style,
              opacity: 1,
              zIndex: 10 + index
            },
            isEditable: true,
            isVisible: true
          }));
          
          updateSlide(currentSlide.id, { textElements: newTextElements });
        }
        
        toast.success("Design-based text content generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate text content");
      }
    } catch (error) {
      console.error('Error generating text:', error);
      toast.error("An error occurred while generating text content");
    } finally {
      setIsGeneratingText(false);
    }
  };



  // Save carousel to gallery
  const saveCarousel = async () => {
    if (slides.length === 0) {
      toast.error("No slides to save");
      return;
    }

    if (!getCurrentTitle().trim()) {
      toast.error("Please enter a carousel title");
      return;
    }

    try {
      // Collect all slide URLs (either from long image or individual backgrounds)
      const slideUrls: string[] = [];
      
      if (longImageUrl) {
        // If using long image approach, we need to slice it into individual slides
        // For now, we'll use the long image URL for all slides
        for (let i = 0; i < slides.length; i++) {
          slideUrls.push(longImageUrl);
        }
      } else {
        // If using individual backgrounds, collect them from slides
        slides.forEach(slide => {
          if (slide.backgroundImage) {
            slideUrls.push(slide.backgroundImage);
          }
        });
      }

      if (slideUrls.length === 0) {
        toast.error("No images to save. Please generate backgrounds first.");
        return;
      }

      const carouselData = {
        title: getCurrentTitle(),
        description: carouselSettings.description || `Carousel with ${slides.length} slides`,
        slides: slides,
        slideUrls: slideUrls,
        aspectRatio: carouselSettings.aspectRatio,
        slideCount: slides.length,
      };

      const response = await fetch('/api/user-carousels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carouselData),
      });

      if (!response.ok) {
        throw new Error('Failed to save carousel');
      }

      const result = await response.json();
      toast.success("Carousel saved to gallery successfully!");
      
      // Optionally redirect to gallery
      // window.location.href = '/gallery';
      
    } catch (error) {
      console.error('Error saving carousel:', error);
      toast.error("Failed to save carousel");
    }
  };

  // Export carousel
  const exportCarousel = async (format: 'pdf' | 'images') => {
    if (slides.length === 0) {
      toast.error("No slides to export");
      return;
    }

    try {
      if (format === 'pdf') {
        // TODO: Implement PDF export for LinkedIn
        toast.info("PDF export coming soon");
      } else {
        // TODO: Implement image sequence export for Instagram/TikTok
        toast.info("Image export coming soon");
      }
    } catch (error) {
      console.error('Error exporting carousel:', error);
      toast.error("Failed to export carousel");
    }
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen lg:flex-row gap-6">
        {/* Left Sidebar - Settings Panel */}
        <div className="flex flex-col h-full lg:w-1/3 xl:w-2/5">
          <Card className="flex flex-col h-full shadow-lg">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Carousel Maker</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create engaging social media carousels
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {slides.length}/20 slides (min: 3)
                </Badge>
              </div>
            </div>

            {/* Scrollable Settings Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Carousel Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Carousel Settings</h3>
                
                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label className="text-xs">Aspect Ratio</Label>
                  <Select 
                    value={carouselSettings.aspectRatio}
                    onValueChange={(value) => setCarouselSettings({
                      ...carouselSettings,
                      aspectRatio: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatioOptions.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span>{ratio.label}</span>
                              <div className="flex gap-1">
                                {ratio.platforms.map((platform, index) => (
                                  <platform.icon 
                                    key={index} 
                                    className={`size-3 ${platform.color}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{ratio.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Carousel Title */}
                <div className="space-y-2">
                  <Label className="text-xs">Carousel Title</Label>
                  <Select 
                    value={carouselSettings.selectedTitle}
                    onValueChange={(value) => {
                      const selectedOption = carouselTitleOptions.find(option => option.value === value);
                      setCarouselSettings({
                        ...carouselSettings,
                        selectedTitle: value,
                        title: selectedOption ? selectedOption.label : '',
                        customTitle: value === 'custom' ? carouselSettings.customTitle : ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a carousel title..." />
                    </SelectTrigger>
                    <SelectContent>
                      {carouselTitleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Title Input */}
                  {carouselSettings.selectedTitle === 'custom' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Custom Title</Label>
                      <Input
                        placeholder="Enter your custom title..."
                        value={carouselSettings.customTitle}
                        onChange={(e) => setCarouselSettings({
                          ...carouselSettings,
                          customTitle: e.target.value,
                          title: e.target.value
                        })}
                      />
                    </div>
                  )}
                </div>

                {/* Slide Count */}
                <div className="space-y-2">
                  <Label className="text-xs">Number of Slides: {carouselSettings.slideCount}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={carouselSettings.slideCount}
                      onChange={(e) => setSlideCount(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="min-w-8 text-xs text-gray-500 text-center">
                      {carouselSettings.slideCount}
                    </span>
                  </div>
                  <div className="flex text-xs text-gray-500 justify-between">
                    <span>3</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Global Background Theme */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Global Background Theme</Label>
                    <Badge variant="outline" className="text-xs">
                      {carouselSettings.selectedPreset ? 'Preset Applied' : 'Custom'}
                    </Badge>
                  </div>
                  
                  {/* Background Presets */}
                  <div className="space-y-2">
                    <Label className="text-xs">Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {backgroundPresets.slice(0, 4).map((preset) => (
                        <Tooltip key={preset.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => selectPreset(preset.id)}
                              className={`rounded-lg border p-2 text-left transition-all duration-200 hover:shadow-sm text-xs ${
                                carouselSettings.selectedPreset === preset.id 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                  : 'hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium">{preset.name}</div>
                              <div className="text-gray-500 truncate">{preset.description}</div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{preset.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    
                    {/* More Presets Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Sparkles className="size-3 mr-2" />
                          More Presets
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        {backgroundPresets.slice(4).map((preset) => (
                          <DropdownMenuItem 
                            key={preset.id}
                            onClick={() => selectPreset(preset.id)}
                            className="flex flex-col p-3 items-start"
                          >
                            <div className="text-sm font-medium">{preset.name}</div>
                            <div className="text-xs text-gray-500">{preset.description}</div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Custom Background Prompt */}
                  <div className="space-y-2">
                    <Label className="text-xs">Custom Background Prompt</Label>
                    <Textarea
                      placeholder="Describe the theme for all slide backgrounds..."
                      value={carouselSettings.globalBackgroundPrompt}
                      onChange={(e) => setCarouselSettings({
                        ...carouselSettings,
                        globalBackgroundPrompt: e.target.value,
                        selectedPreset: '' // Clear preset when custom prompt is used
                      })}
                      rows={3}
                    />
                    


                    <div className="space-y-3">
                      {/* Enhanced Generate Button */}
                      <Button
                        onClick={generateLongImageBackground}
                        disabled={isGeneratingBackground || userCredits <= 0 || !carouselSettings.globalBackgroundPrompt.trim()}
                        className={`w-full transition-all duration-300 ${
                          isGeneratingBackground 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800'
                        } shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}
                        size="lg"
                      >
                        {isGeneratingBackground ? (
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="loader-enhanced"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="size-2 bg-white rounded-full animate-ping"></div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-white">
                                Generating Long Image...
                              </span>
                              <span className="text-xs text-blue-100">This may take a few moments</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Sparkles className="size-5 text-white" />
                              <div className="absolute -top-1 -right-1 size-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-semibold text-white">
                                Generate Long Image
                              </span>
                              <span className="text-xs text-blue-100">
                                1 credit • Creates seamless background for all slides
                              </span>
                            </div>
                          </div>
                        )}
                      </Button>

                      {/* Status Indicators */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${
                            userCredits > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={userCredits > 0 ? 'text-green-600' : 'text-red-600'}>
                            {userCredits} credits available
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`size-2 rounded-full ${
                            carouselSettings.globalBackgroundPrompt.trim() ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className={carouselSettings.globalBackgroundPrompt.trim() ? 'text-green-600' : 'text-yellow-600'}>
                            {carouselSettings.globalBackgroundPrompt.trim() ? 'Prompt ready' : 'Prompt needed'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar for Long Image Generation */}
                      {isGeneratingBackground && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Processing...</span>
                            <span>Creating seamless background</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" 
                                 style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </div>



              {/* Text Style */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Text Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={currentSlide.textStyle.position}
                      onValueChange={(value) => updateSlide(currentSlide.id, {
                        textStyle: { ...currentSlide.textStyle, position: value as 'top' | 'center' | 'bottom' }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentSlide.textStyle.alignment}
                      onValueChange={(value) => updateSlide(currentSlide.id, {
                        textStyle: { ...currentSlide.textStyle, alignment: value as 'left' | 'center' | 'right' }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Font Size */}
                  <div className="space-y-1">
                    <Label className="text-xs">Font Size: {currentSlide.textStyle.fontSize}px</Label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={currentSlide.textStyle.fontSize}
                      onChange={(e) => updateSlide(currentSlide.id, {
                        textStyle: { ...currentSlide.textStyle, fontSize: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Font Family */}
                  <div className="space-y-1">
                    <Label className="text-xs">Font Family</Label>
                    <Select
                      value={currentSlide.textStyle.fontFamily}
                      onValueChange={(value) => updateSlide(currentSlide.id, {
                        textStyle: { ...currentSlide.textStyle, fontFamily: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-sm"
                                style={{ fontFamily: font.value }}
                              >
                                {font.preview}
                              </span>
                              <span className="text-xs text-gray-500">{font.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Text Color */}
                  <div className="space-y-1">
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      {['#ffffff', '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'].map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSlide(currentSlide.id, {
                            textStyle: { ...currentSlide.textStyle, color }
                          })}
                          className={`size-6 rounded-full border-2 transition-all ${
                            currentSlide.textStyle.color === color 
                              ? 'border-gray-800 scale-110' 
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Text Elements Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Text Elements</h3>
                  <Button
                    onClick={() => createDefaultTextElements(currentSlide.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="size-3 mr-2" />
                    Add Default
                  </Button>
                </div>

                {/* Text Element Type Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => addTextElement(currentSlide.id, 'header')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Type className="size-3 mr-1" />
                    Header
                  </Button>
                  <Button
                    onClick={() => addTextElement(currentSlide.id, 'body')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <FileText className="size-3 mr-1" />
                    Body
                  </Button>
                  <Button
                    onClick={() => addTextElement(currentSlide.id, 'caption')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Type className="size-3 mr-1" />
                    Caption
                  </Button>
                  <Button
                    onClick={() => addTextElement(currentSlide.id, 'cta')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Zap className="size-3 mr-1" />
                    CTA
                  </Button>
                  <Button
                    onClick={() => addTextElement(currentSlide.id, 'slider-number')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Circle className="size-3 mr-1" />
                    Number
                  </Button>
                </div>

                {/* Text Elements List */}
                {currentSlide.textElements.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Current Elements</Label>
                    <div className="space-y-1">
                      {currentSlide.textElements.map((element) => (
                        <div
                          key={element.id}
                          className={`flex items-center justify-between rounded border p-2 text-xs transition-colors ${
                            selectedTextElement === element.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => selectTextElement(element.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-2 bg-gray-400 rounded-full" />
                            <span className="capitalize">{element.type}</span>
                            <span className="max-w-[100px] text-gray-500 truncate">
                              {element.content.substring(0, 20)}
                              {element.content.length > 20 ? '...' : ''}
                            </span>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTextElement(currentSlide.id, element.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="size-6 p-0"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="p-3 bg-blue-50 text-xs text-blue-700 rounded-lg dark:bg-blue-950 dark:text-blue-300">
                  <p className="mb-1 font-medium">How to edit text:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Double-click any text element to edit</li>
                    <li>• Click to select and see controls</li>
                    <li>• Press Delete to remove selected element</li>
                    <li>• Drag elements to reposition (coming soon)</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={addSlide}
                  disabled={slides.length >= 20}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="size-3 mr-2" />
                  Add Slide
                </Button>
                
                <Button
                  onClick={() => removeSlide(currentSlide.id)}
                  disabled={slides.length <= 3}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Minus className="size-3 mr-2" />
                  Remove Slide
                </Button>
              </div>

              {/* Save and Export Options */}
              <div className="space-y-2">
                <Button
                  onClick={saveCarousel}
                  disabled={slides.length === 0 || !getCurrentTitle().trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Heart className="size-3 mr-2" />
                  Save to Gallery
                </Button>
                
                <Button
                  onClick={() => exportCarousel('pdf')}
                  disabled={slides.length === 0}
                  className="w-full"
                  size="sm"
                >
                  <Download className="size-3 mr-2" />
                  Export as PDF (LinkedIn)
                </Button>
                
                <Button
                  onClick={() => exportCarousel('images')}
                  disabled={slides.length === 0}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <ImageIcon className="size-3 mr-2" />
                  Export as Images (Instagram/TikTok)
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side - Preview Area */}
        <div className="flex flex-col h-full lg:w-2/3 xl:w-3/5">
          <Card className="flex flex-col h-full shadow-lg">
            {/* Preview Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium">Carousel Preview</h3>
                  {isGeneratingBackground && (
                    <div className="flex items-center gap-2">
                      <div className="size-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-600 font-medium">
                        Generating Long Image
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {carouselSettings.aspectRatio}
                  </Badge>
                  {isGeneratingBackground && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                      <div className="size-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                      Processing
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-custom">
              {slides.length > 0 ? (
                <div className="flex flex-col min-h-full pb-8 items-center justify-center">
                  {/* Slide Preview */}
                  <div 
                    className="relative w-full max-w-md bg-gray-100 rounded-lg dark:bg-gray-800 slide-preview-container overflow-hidden"
                    style={{ aspectRatio: aspectRatioToCSS(carouselSettings.aspectRatio) }}
                  >
                    {currentSlide.backgroundImage ? (
                      currentSlide.cropData ? (
                        // Render cropped image from long image
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${currentSlide.backgroundImage})`,
                            backgroundPosition: `${currentSlide.cropData.x * 100}% ${currentSlide.cropData.y * 100}%`,
                            backgroundSize: `${100 / currentSlide.cropData.width}% ${100 / currentSlide.cropData.height}%`,
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      ) : (
                        // Render regular full image
                        <Image
                          src={currentSlide.backgroundImage}
                          alt="Slide background"
                          fill
                          className="object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          {isGeneratingBackground ? (
                            <div className="space-y-4">
                              <div className="relative">
                                <div className="loader-enhanced mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="size-3 bg-blue-500 rounded-full animate-ping"></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Generating Long Image...
                                </p>
                                <p className="text-xs text-gray-500">
                                  Creating seamless background for all slides
                                </p>
                                <div className="w-32 mx-auto bg-gray-200 rounded-full h-1 overflow-hidden">
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full animate-pulse" 
                                       style={{ width: '100%' }}></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="size-12 mx-auto text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No background image</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Use the Global Background Theme to generate
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Text Elements */}
                    {currentSlide.textElements.map((element) => (
                      <EditableTextElement
                        key={element.id}
                        element={element}
                        isEditing={editingTextElement === element.id}
                        isSelected={selectedTextElement === element.id}
                        onStartEdit={() => startEditingText(element.id)}
                        onStopEdit={stopEditingText}
                        onSelect={() => selectTextElement(element.id)}
                        onUpdate={(updates) => updateTextElement(currentSlide.id, element.id, updates)}
                        onDelete={() => deleteTextElement(currentSlide.id, element.id)}
                        onStartDrag={(elementId) => setTextElementBeingDragged(elementId)}
                        onStopDrag={() => setTextElementBeingDragged(null)}
                      />
                    ))}
                    
                    {/* Legacy Text Overlay (for backward compatibility) */}
                    {currentSlide.textContent && currentSlide.textElements.length === 0 && (
                      <div 
                        className={`absolute inset-0 flex items-center justify-center p-6 ${
                          currentSlide.textStyle.position === 'top' ? 'items-start' :
                          currentSlide.textStyle.position === 'bottom' ? 'items-end' : 'items-center'
                        } ${
                          currentSlide.textStyle.alignment === 'left' ? 'justify-start' :
                          currentSlide.textStyle.alignment === 'right' ? 'justify-end' : 'justify-center'
                        }`}
                      >
                        <div 
                          className="text-center"
                          style={{
                            fontSize: `${currentSlide.textStyle.fontSize}px`,
                            color: currentSlide.textStyle.color,
                            fontFamily: currentSlide.textStyle.fontFamily
                          }}
                        >
                          {currentSlide.textContent}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slide Navigation */}
                  <div className="flex mt-4 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                    >
                      <ArrowLeft className="size-3" />
                    </Button>
                    
                    <div className="flex gap-1">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`size-2 rounded-full transition-colors ${
                            index === currentSlideIndex 
                              ? 'bg-blue-600' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === slides.length - 1}
                    >
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-full items-center justify-center">
                  <div className="text-center">
                    <Layers className="size-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg text-gray-900 dark:text-gray-100 font-medium">
                      No slides yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add your first slide to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
} 