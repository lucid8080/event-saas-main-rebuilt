"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Image, Sparkles, Info } from "lucide-react";

export function WatermarkToggleForm() {
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadWatermarkToggle() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/watermark-toggle');
        if (response.ok) {
          const data = await response.json();
          setWatermarkEnabled(data.watermarkEnabled);
        }
      } catch (error) {
        console.error('Error loading watermark toggle:', error);
        toast.error('Failed to load watermark toggle setting');
      } finally {
        setIsLoading(false);
      }
    }

    loadWatermarkToggle();
  }, []);

  const handleToggle = async () => {
    try {
      setIsSaving(true);
      const newValue = !watermarkEnabled;
      
      const response = await fetch('/api/settings/watermark-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ watermarkEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to save watermark toggle setting');
      }

      setWatermarkEnabled(newValue);
      toast.success(
        newValue 
          ? 'Watermark enabled successfully' 
          : 'Watermark disabled successfully'
      );
    } catch (error) {
      toast.error('Failed to save watermark toggle setting');
      console.error('Error saving watermark toggle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="size-5" />
          Image Watermark
        </CardTitle>
        <CardDescription>
          Add "Made using EventCraftAI.com" watermark to your generated images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="watermark-toggle" className="text-base font-medium">
              Enable Image Watermark
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, a subtle watermark will be added to the bottom-right corner of your generated images
            </p>
          </div>
          <Switch
            id="watermark-toggle"
            checked={watermarkEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Watermark Preview */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Info className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Watermark Preview
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              When enabled, your images will include a small "Made using EventCraftAI.com" text in the bottom-right corner. 
              This helps promote the platform while keeping your images professional.
            </p>
          </div>
        </div>

        {/* Feature Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Watermark is applied automatically to all new images
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Image className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Existing images remain unchanged
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Default: Off
            </Badge>
            <span className="text-sm text-muted-foreground">
              You can toggle this setting at any time
            </span>
          </div>
        </div>

        {isSaving && (
          <div className="flex text-sm text-muted-foreground items-center gap-2">
            <div className="size-4 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            Saving watermark setting...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 