"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { 
  Move, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  Trash2,
  Settings,
  X,
  Download,
  Copy
} from "lucide-react";
import { toast } from "sonner";

interface Logo {
  id: string;
  name: string;
  svg: string;
  url: string;
  category?: string;
}

interface LogoOverlayProps {
  logo: Logo;
  onRemove: () => void;
  onUpdate: (updates: Partial<LogoOverlayState>) => void;
  imageWidth: number;
  imageHeight: number;
}

interface LogoOverlayState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export function LogoOverlay({ 
  logo, 
  onRemove, 
  onUpdate, 
  imageWidth, 
  imageHeight 
}: LogoOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  // Convert percentage position to pixels
  const pixelX = (position.x / 100) * imageWidth;
  const pixelY = (position.y / 100) * imageHeight;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pixelX,
      y: e.clientY - pixelY
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = ((e.clientX - dragStart.x) / imageWidth) * 100;
    const newY = ((e.clientY - dragStart.y) / imageHeight) * 100;
    
    // Constrain to image bounds
    const constrainedX = Math.max(0, Math.min(100, newX));
    const constrainedY = Math.max(0, Math.min(100, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
    onUpdate({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    setScale(newScale);
    onUpdate({ scale: newScale });
  };

  const handleRotationChange = (value: number[]) => {
    const newRotation = value[0];
    setRotation(newRotation);
    onUpdate({ rotation: newRotation });
  };

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0];
    setOpacity(newOpacity);
    onUpdate({ opacity: newOpacity });
  };

  const resetPosition = () => {
    setPosition({ x: 50, y: 50 });
    setScale(1);
    setRotation(0);
    setOpacity(1);
    onUpdate({ x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 });
  };

  const copyLogoSVG = async () => {
    try {
      await navigator.clipboard.writeText(logo.svg);
      toast.success("Logo SVG copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy logo");
    }
  };

  const downloadLogo = async () => {
    try {
      const blob = new Blob([logo.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${logo.name}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Logo downloaded!");
    } catch (error) {
      toast.error("Failed to download logo");
    }
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, imageWidth, imageHeight]);

  return (
    <TooltipProvider>
      <div
        ref={logoRef}
        className="absolute cursor-move select-none"
        style={{
          left: `${pixelX}px`,
          top: `${pixelY}px`,
          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
          opacity: opacity,
          zIndex: 1000
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Logo Display */}
        <div
          className="relative"
          style={{
            width: '60px',
            height: '60px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: logo.svg }}
            className="w-full h-full"
          />
        </div>

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2 flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={copyLogoSVG}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy SVG</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={downloadLogo}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={resetPosition}
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={onRemove}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Logo Info Badge */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {logo.name}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="absolute top-4 right-4 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Logo Controls</h4>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Scale Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium">Scale</label>
                <span className="text-xs text-gray-500">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={handleScaleChange}
                max={3}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium">Rotation</label>
                <span className="text-xs text-gray-500">{Math.round(rotation)}°</span>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={handleRotationChange}
                max={360}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Opacity Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium">Opacity</label>
                <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={handleOpacityChange}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Position Display */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">X:</span>
                <span className="ml-1 font-medium">{Math.round(position.x)}%</span>
              </div>
              <div>
                <span className="text-gray-500">Y:</span>
                <span className="ml-1 font-medium">{Math.round(position.y)}%</span>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetPosition}
              className="w-full"
            >
              <RotateCw className="h-3 w-3 mr-2" />
              Reset Position
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 