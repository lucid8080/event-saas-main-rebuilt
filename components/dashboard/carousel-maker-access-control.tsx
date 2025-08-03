"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Settings, AlertTriangle } from "lucide-react";
import { useCarouselMakerToggle } from "@/hooks/use-carousel-maker-toggle";
import Link from "next/link";

interface CarouselMakerAccessControlProps {
  children: ReactNode;
}

export function CarouselMakerAccessControl({ children }: CarouselMakerAccessControlProps) {
  const { carouselMakerEnabled, isLoading } = useCarouselMakerToggle();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!carouselMakerEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 rounded-full bg-purple-100 p-3 dark:bg-purple-900/50 w-fit">
              <Layers className="size-8 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Carousel Maker
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                Experimental
              </Badge>
            </CardTitle>
            <CardDescription>
              This feature is currently disabled for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Experimental Warning */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <AlertTriangle className="size-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Experimental Feature
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  The Carousel Maker is an experimental feature that you can enable in your settings.
                </p>
              </div>
            </div>

            {/* Feature Description */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                What you can do with Carousel Maker:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create multi-slide carousels for social media</li>
                <li>• Generate AI-powered backgrounds and text</li>
                <li>• Customize for different platforms (Instagram, LinkedIn, TikTok)</li>
                <li>• Edit text elements with drag-and-drop</li>
                <li>• Save carousels to your gallery</li>
                <li>• Export as images or PDFs</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link href="/dashboard/settings">
                <Button className="w-full">
                  <Settings className="size-4 mr-2" />
                  Enable in Settings
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
} 