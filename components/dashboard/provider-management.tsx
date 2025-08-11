"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Settings, 
  Activity,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";
import { DetailedProviderSelector } from "@/components/dashboard/provider-selector";
import { ProviderType, imageProviders } from "@/lib/providers";
import { toast } from "sonner";

interface ProviderStatus {
  id: ProviderType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  healthy: boolean;
  configured: boolean;
  status: "online" | "offline" | "error" | "checking";
  errorMessage?: string;
  lastCheck?: Date;
  responseTime?: number;
  circuitOpen?: boolean;
  failures?: number;
  requestsPerMinute?: number;
  costPerImage?: number;
  freeQuota?: number;
}

export function ProviderManagement() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>("qwen");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadProviderStatus();
  }, []);

  const loadProviderStatus = async () => {
    setIsLoading(true);
    setIsRefreshing(true);

    try {
      // Get available providers
      const availableProviders = imageProviders.getAvailableProviders();
      
      // Get health status
      const healthStatus = await imageProviders.getProvidersHealth();
      
      // Get circuit breaker status
      const circuitStatus = imageProviders.getCircuitBreakerStatus();

      // Provider configurations
      const providerConfigs = {
        qwen: {
          name: "Qwen-Image",
          description: "Advanced AI model with excellent text rendering and style control",
          icon: "🎯",
          costPerImage: 0.0,
          freeQuota: Infinity,
          requestsPerMinute: 60
        },
        huggingface: {
          name: "Stable Diffusion XL",
          description: "Reliable and consistent image generation with good quality",
          icon: "🤗",
          costPerImage: 0.06,
          freeQuota: 1000,
          requestsPerMinute: 30
        },
        ideogram: {
          name: "Ideogram",
          description: "Premium AI model with superior text rendering",
          icon: "💎",
          costPerImage: 0.08,
          freeQuota: 25,
          requestsPerMinute: 10
        },
        stability: {
          name: "Stability AI",
          description: "High-quality image generation with professional results",
          icon: "🔮",
          costPerImage: 0.04,
          freeQuota: 0,
          requestsPerMinute: 15
        },
        midjourney: {
          name: "Midjourney",
          description: "Artistic AI model known for creative and stylized outputs",
          icon: "🎨",
          costPerImage: 0.10,
          freeQuota: 0,
          requestsPerMinute: 5
        }
      };

      const statusList: ProviderStatus[] = Object.entries(providerConfigs).map(([id, config]) => {
        const providerId = id as ProviderType;
        const isAvailable = availableProviders.includes(providerId);
        const health = healthStatus[providerId];
        const circuit = circuitStatus[providerId];
        
        let status: ProviderStatus["status"];
        let errorMessage: string | undefined;
        
        if (!isAvailable) {
          status = "offline";
          errorMessage = "Provider not configured";
        } else if (circuit?.isOpen) {
          status = "error";
          errorMessage = "Circuit breaker is open due to failures";
        } else if (health?.healthy) {
          status = "online";
        } else {
          status = "error";
          errorMessage = health?.lastError || "Health check failed";
        }

        return {
          id: providerId,
          ...config,
          available: isAvailable,
          healthy: health?.healthy || false,
          configured: isAvailable,
          status,
          errorMessage,
          lastCheck: new Date(),
          responseTime: Math.random() * 1000 + 200, // Mock response time
          circuitOpen: circuit?.isOpen || false,
          failures: circuit?.failures || 0
        };
      });

      setProviders(statusList);
      
    } catch (error) {
      console.error("Failed to load provider status:", error);
      toast.error("Failed to load provider status");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const resetCircuitBreaker = (providerId: ProviderType) => {
    try {
      imageProviders.resetCircuitBreaker(providerId);
      toast.success(`Circuit breaker reset for ${providerId}`);
      loadProviderStatus(); // Refresh status
    } catch (error) {
      console.error("Failed to reset circuit breaker:", error);
      toast.error("Failed to reset circuit breaker");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-gray-500";
      case "error": return "text-red-500";
      case "checking": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "offline": return <XCircle className="w-5 h-5 text-gray-500" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "checking": return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading provider status...</span>
      </div>
    );
  }

  const onlineProviders = providers.filter(p => p.status === "online");
  const offlineProviders = providers.filter(p => p.status !== "online");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provider Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage AI image generation providers
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadProviderStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{onlineProviders.length}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{offlineProviders.length}</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(onlineProviders.reduce((acc, p) => acc + (p.responseTime || 0), 0) / onlineProviders.length || 0)}ms
                </p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((onlineProviders.length / providers.length) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <Badge variant={provider.status === "online" ? "default" : "secondary"} className="text-xs">
                          {provider.status}
                        </Badge>
                      </div>
                    </div>
                    {getStatusIcon(provider.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                  
                  {provider.errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {provider.errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span>{provider.responseTime ? `${Math.round(provider.responseTime)}ms` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost per Image:</span>
                      <span>${provider.costPerImage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limit:</span>
                      <span>{provider.requestsPerMinute}/min</span>
                    </div>
                    {provider.circuitOpen && (
                      <div className="pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => resetCircuitBreaker(provider.id)}
                          className="w-full"
                        >
                          Reset Circuit Breaker
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Details</CardTitle>
              <CardDescription>
                Detailed information about each provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{provider.icon}</span>
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">{provider.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(provider.status)}
                        <Badge variant={provider.status === "online" ? "default" : "secondary"}>
                          {provider.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Configured</p>
                        <p className="font-medium">{provider.configured ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Healthy</p>
                        <p className="font-medium">{provider.healthy ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failures</p>
                        <p className="font-medium">{provider.failures || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Circuit</p>
                        <p className="font-medium">{provider.circuitOpen ? "Open" : "Closed"}</p>
                      </div>
                    </div>
                    
                    {provider.errorMessage && (
                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 rounded text-sm text-red-600 dark:text-red-400">
                        {provider.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Testing</CardTitle>
              <CardDescription>
                Test provider switching and functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Provider to Test
                </label>
                <DetailedProviderSelector 
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Test Commands</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => loadProviderStatus()}
                    disabled={isRefreshing}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Health Check
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => resetCircuitBreaker(selectedProvider)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Circuit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
