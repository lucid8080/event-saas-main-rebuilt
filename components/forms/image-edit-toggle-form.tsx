"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Image, Edit3 } from "lucide-react";

export function ImageEditToggleForm() {
  const [imageEditEnabled, setImageEditEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadImageEditToggle() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/image-edit-toggle');
        if (response.ok) {
          const data = await response.json();
          setImageEditEnabled(data.imageEditEnabled);
        }
      } catch (error) {
        console.error('Error loading image edit toggle:', error);
        toast.error('Failed to load image edit toggle setting');
      } finally {
        setIsLoading(false);
      }
    }

    loadImageEditToggle();
  }, []);

  const handleToggle = async () => {
    try {
      setIsSaving(true);
      const newValue = !imageEditEnabled;
      
      const response = await fetch('/api/settings/image-edit-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageEditEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to save image edit toggle setting');
      }

      setImageEditEnabled(newValue);
      toast.success(`Image edit feature ${newValue ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to save image edit toggle setting');
      console.error('Error saving image edit toggle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="size-5" />
          Image Edit Feature Toggle
        </CardTitle>
        <CardDescription>
          Control whether users can edit generated images using the AI-powered editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Image Edit Feature</p>
            <p className="text-sm text-muted-foreground">
              {imageEditEnabled 
                ? "Users can edit generated images with AI-powered tools" 
                : "Image editing is currently disabled for all users"
              }
            </p>
          </div>
          <div className="flex space-x-2 items-center">
            {isLoading ? (
              <div className="size-4 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            ) : (
              <Switch
                checked={imageEditEnabled}
                onCheckedChange={handleToggle}
                disabled={isSaving}
              />
            )}
          </div>
        </div>
        
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <Image className="size-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">Current Status:</p>
              <p className="text-muted-foreground">
                {imageEditEnabled 
                  ? "✅ Image editing is enabled - users can access the edit button on generated images"
                  : "❌ Image editing is disabled - edit buttons will be hidden from users"
                }
              </p>
            </div>
          </div>
        </div>

        {isSaving && (
          <div className="flex text-sm text-muted-foreground items-center gap-2">
            <div className="size-3 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            Saving changes...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 