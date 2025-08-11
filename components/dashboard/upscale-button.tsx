"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface UpscaleButtonProps {
  imageId: string;
  onUpscaleSuccess?: (upscaledImageUrl: string) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  userCredits?: number; // Add user credits prop
}

export function UpscaleButton({
  imageId,
  onUpscaleSuccess,
  disabled = false,
  variant = "outline",
  size = "sm",
  className = "",
  userCredits
}: UpscaleButtonProps) {
  const [isUpscaling, setIsUpscaling] = useState(false);

  const handleUpscale = async () => {
    if (!imageId) {
      toast.error("No image selected for upscaling");
      return;
    }

    // Check credits before upscaling if available
    if (userCredits !== undefined && userCredits <= 0) {
      toast.error("Insufficient credits. Please upgrade your plan to use the upscaler.");
      return;
    }

    // Show credit confirmation if credits are low
    if (userCredits !== undefined && userCredits === 1) {
      const confirmed = confirm(`You have ${userCredits} credit remaining. This will use your last credit. Continue?`);
      if (!confirmed) return;
    }

    setIsUpscaling(true);

    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication error
          toast.error("Authentication failed", {
            description: "Please sign out and sign back in to continue."
          });
        } else if (response.status === 402) {
          // Payment required - insufficient credits
          toast.error("Insufficient credits. Please upgrade your plan to use the upscaler.");
        } else if (response.status === 403) {
          // Forbidden - likely authentication or ownership issue
          toast.error("Access denied", {
            description: "Please check your session and try again. If the problem persists, try signing out and back in."
          });
        } else {
          throw new Error(data.error || "Failed to upscale image");
        }
        return;
      }

      if (data.success) {
        toast.success("Image upscaled successfully! 🎉 (1 credit used)");
        
        // Call the success callback if provided
        if (onUpscaleSuccess && data.upscaledImageUrl) {
          onUpscaleSuccess(data.upscaledImageUrl);
        }
      } else {
        throw new Error(data.error || "Upscaling failed");
      }
    } catch (error) {
      console.error("Error upscaling image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upscale image");
    } finally {
      setIsUpscaling(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleUpscale}
      disabled={disabled || isUpscaling || (userCredits !== undefined && userCredits <= 0)}
      className={className}
      title={userCredits !== undefined ? `Upscale (1 credit) - You have ${userCredits} credits` : "Upscale (1 credit)"}
    >
      {isUpscaling ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Upscaling...
        </>
      ) : (
        <>
          <ZoomIn className="mr-2 size-4" />
          Upscale
          {userCredits !== undefined && (
            <span className="ml-1 text-xs opacity-70">({userCredits})</span>
          )}
        </>
      )}
    </Button>
  );
}
