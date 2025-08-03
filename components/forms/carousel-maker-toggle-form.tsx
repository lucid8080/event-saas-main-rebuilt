"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Layers, Sparkles, AlertTriangle } from "lucide-react";

export function CarouselMakerToggleForm() {
  const [carouselMakerEnabled, setCarouselMakerEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadCarouselMakerToggle() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/carousel-maker-toggle');
        if (response.ok) {
          const data = await response.json();
          setCarouselMakerEnabled(data.carouselMakerEnabled);
        }
      } catch (error) {
        console.error('Error loading Carousel Maker toggle:', error);
        toast.error('Failed to load Carousel Maker toggle setting');
      } finally {
        setIsLoading(false);
      }
    }

    loadCarouselMakerToggle();
  }, []);

  const handleToggle = async () => {
    try {
      setIsSaving(true);
      const newValue = !carouselMakerEnabled;
      
      const response = await fetch('/api/settings/carousel-maker-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carouselMakerEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to save Carousel Maker toggle setting');
      }

      setCarouselMakerEnabled(newValue);
      toast.success(
        newValue 
          ? 'Carousel Maker enabled successfully' 
          : 'Carousel Maker disabled successfully'
      );
    } catch (error) {
      toast.error('Failed to save Carousel Maker toggle setting');
      console.error('Error saving Carousel Maker toggle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/50">
              <Layers className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Carousel Maker
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                  Experimental
                </Badge>
              </CardTitle>
              <CardDescription>
                Enable the Carousel Maker tool for creating engaging social media carousels
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="carousel-maker-toggle" className="text-base font-medium">
              Enable Carousel Maker Tool
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, you can access the Carousel Maker tool to create multi-slide social media content
            </p>
          </div>
          <Switch
            id="carousel-maker-toggle"
            checked={carouselMakerEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Experimental Warning */}
        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <AlertTriangle className="size-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Experimental Feature
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              This feature is in experimental phase. It may have bugs or unexpected behavior. 
              You can enable this feature to try the Carousel Maker tool.
            </p>
          </div>
        </div>

        {/* Feature Details */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            What you can do with Carousel Maker:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Create multi-slide carousels for social media platforms
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Generate AI-powered backgrounds and text content
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Customize aspect ratios for different platforms (Instagram, LinkedIn, TikTok)
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Edit text elements with drag-and-drop functionality
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Save carousels to your gallery for future use
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-3" />
              Export carousels as images or PDFs for different platforms
            </li>
          </ul>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Current Status:</span>
          <Badge 
            variant={carouselMakerEnabled ? "default" : "secondary"}
            className={carouselMakerEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
          >
            {carouselMakerEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 