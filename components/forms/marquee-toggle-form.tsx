"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function MarqueeToggleForm() {
  const [marqueeEnabled, setMarqueeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMarqueeSetting();
  }, []);

  const fetchMarqueeSetting = async () => {
    try {
      const response = await fetch("/api/settings/marquee-toggle");
      const data = await response.json();
      
      if (response.ok) {
        setMarqueeEnabled(data.marqueeEnabled ?? true); // Default to true if not set
      } else {
        console.error("Failed to fetch marquee setting:", data.error);
        toast.error("Failed to fetch marquee setting");
      }
    } catch (error) {
      console.error("Error fetching marquee setting:", error);
      toast.error("Error fetching marquee setting");
    }
  };

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/marquee-toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ marqueeEnabled: enabled }),
      });

      const data = await response.json();

      if (response.ok) {
        setMarqueeEnabled(enabled);
        toast.success(
          enabled 
            ? "Marquee background enabled successfully" 
            : "Marquee background disabled successfully"
        );
      } else {
        console.error("Failed to update marquee setting:", data.error);
        toast.error("Failed to update marquee setting");
      }
    } catch (error) {
      console.error("Error updating marquee setting:", error);
      toast.error("Error updating marquee setting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marquee Background</CardTitle>
        <CardDescription>
          Control the animated marquee background on the hero section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marquee-toggle">Enable Marquee Background</Label>
            <p className="text-sm text-muted-foreground">
              Show or hide the animated image marquee in the hero section background
            </p>
          </div>
          <Switch
            id="marquee-toggle"
            checked={marqueeEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Current Status:</strong> {marqueeEnabled ? "Enabled" : "Disabled"}
          </p>
          <p>
            When enabled, the hero section will display an animated marquee of sample images in the background.
            When disabled, the hero section will have a clean background without animations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 