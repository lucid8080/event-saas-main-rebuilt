"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { ProviderType, imageProviders } from "@/lib/providers";

interface ProviderInfo {
  id: ProviderType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  healthy: boolean;
  status: "online" | "offline" | "checking" | "error";
  errorMessage?: string;
}

interface ProviderSelectorProps {
  value: ProviderType;
  onValueChange: (value: ProviderType) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const PROVIDER_CONFIGS: Record<ProviderType, Omit<ProviderInfo, "available" | "healthy" | "status">> = {
  "fal-qwen": {
    id: "fal-qwen",
    name: "Fal-AI Qwen",
    description: "High-quality text-to-image generation via Fal-AI. $0.05/megapixel.",
    icon: "🚀"
  },
              "fal-ideogram": {
              id: "fal-ideogram",
              name: "Fal-AI Ideogram",
              description: "Premium image generation with exceptional typography handling via Fal-AI. Dynamic pricing: $0.03-0.09/megapixel based on speed.",
              icon: "✨"
            },
  qwen: {
    id: "qwen",
    name: "Qwen-Image",
    description: "Advanced AI model with excellent text rendering and style control. Free to use.",
    icon: "🎯"
  },
  huggingface: {
    id: "huggingface", 
    name: "Stable Diffusion XL",
    description: "Reliable and consistent image generation with good quality. Free tier available.",
    icon: "🤗"
  },
  ideogram: {
    id: "ideogram",
    name: "Ideogram",
    description: "Premium AI model with superior text rendering and advanced features.",
    icon: "💎"
  },
  stability: {
    id: "stability",
    name: "Stability AI",
    description: "High-quality image generation with professional results.",
    icon: "🔮"
  },
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    description: "Artistic AI model known for creative and stylized outputs.",
    icon: "🎨"
  }
};

export function ProviderSelector({ value, onValueChange, className, size = "md" }: ProviderSelectorProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkProviderStatus();
  }, []);

  const checkProviderStatus = async () => {
    setIsLoading(true);
    
    try {
      // Get available providers from the factory
      const availableProviders = imageProviders.getAvailableProviders();
      
      // Get health status for all providers
      const healthStatus = await imageProviders.getProvidersHealth();
      
      // Create provider info array
      const providerInfo: ProviderInfo[] = Object.entries(PROVIDER_CONFIGS).map(([id, config]) => {
        const providerId = id as ProviderType;
        const isAvailable = availableProviders.includes(providerId);
        const health = healthStatus[providerId];
        
        let status: ProviderInfo["status"];
        let errorMessage: string | undefined;
        
        if (!isAvailable) {
          status = "offline";
          errorMessage = "Provider not configured or API key missing";
        } else if (health?.healthy) {
          status = "online";
        } else if (health?.available === false) {
          status = "error";
          errorMessage = health.lastError || "Provider unavailable";
        } else {
          status = "offline";
          errorMessage = "Health check failed";
        }
        
        return {
          ...config,
          available: isAvailable,
          healthy: health?.healthy || false,
          status,
          errorMessage
        };
      });
      
      // Filter to only show providers that are available
      const availableProviderInfo = providerInfo.filter(p => p.available);
      setProviders(availableProviderInfo);
      
      // If current selection is not available, switch to first available
      if (!availableProviderInfo.find(p => p.id === value) && availableProviderInfo.length > 0) {
        onValueChange(availableProviderInfo[0].id);
      }
      
    } catch (error) {
      console.error("Failed to check provider status:", error);
      
      // Fallback to basic provider list
      const fallbackProviders: ProviderInfo[] = ["qwen", "huggingface", "ideogram"].map(id => ({
        ...PROVIDER_CONFIGS[id as ProviderType],
        available: true,
        healthy: false,
        status: "checking" as const
      }));
      
      setProviders(fallbackProviders);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ProviderInfo["status"]) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "offline":
        return <XCircle className="w-3 h-3 text-gray-400" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case "checking":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      default:
        return <XCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (provider: ProviderInfo) => {
    const variant = provider.status === "online" ? "default" : 
                   provider.status === "error" ? "destructive" : "secondary";
    
    const text = provider.status === "online" ? "Online" :
                 provider.status === "error" ? "Error" :
                 provider.status === "checking" ? "Checking" : "Offline";
    
    return <Badge variant={variant} className="text-xs">{text}</Badge>;
  };

  const triggerHeight = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className={textSize}>Checking providers...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`${triggerHeight} ${textSize} ${className}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <Tooltip key={provider.id}>
              <TooltipTrigger asChild>
                <SelectItem value={provider.id} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{provider.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{provider.name}</span>
                        {size !== "sm" && (
                          <span className="text-xs text-muted-foreground">
                            {provider.description.substring(0, 50)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {getStatusIcon(provider.status)}
                      {size === "lg" && getStatusBadge(provider)}
                    </div>
                  </div>
                </SelectItem>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{provider.name}</p>
                  <p className="text-sm">{provider.description}</p>
                  {provider.errorMessage && (
                    <p className="text-xs text-red-400">Error: {provider.errorMessage}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs">
                    {getStatusIcon(provider.status)}
                    <span>Status: {provider.status}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </SelectContent>
      </Select>
      
      {/* Refresh button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={checkProviderStatus}
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <Loader2 className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh provider status</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Lightweight version for compact spaces
export function CompactProviderSelector({ value, onValueChange, className }: ProviderSelectorProps) {
  return (
    <ProviderSelector 
      value={value} 
      onValueChange={onValueChange} 
      className={className}
      size="sm"
    />
  );
}

// Extended version with full details
export function DetailedProviderSelector({ value, onValueChange, className }: ProviderSelectorProps) {
  return (
    <ProviderSelector 
      value={value} 
      onValueChange={onValueChange} 
      className={className}
      size="lg"
    />
  );
}
