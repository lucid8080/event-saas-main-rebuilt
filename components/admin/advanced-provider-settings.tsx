'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Zap,
  Image,
  Sliders,
  Shield,
  Clock,
  Download,
  Upload,
  Trash2,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { ProviderSettings, BaseProviderSettings, ProviderSpecificSettings } from '@/lib/types/provider-settings';

interface AdvancedProviderSettingsProps {
  className?: string;
}

interface ProviderCapabilityInfo {
  name: string;
  description: string;
  inferenceSteps: { min: number; max: number; default: number };
  guidanceScale: { min: number; max: number; default: number; step: number };
  supportedImageSizes: string[];
  maxImages: number;
  costPerMegapixel: number;
  supportsSeeds: boolean;
  supportsSafetyChecker: boolean;
}

export function AdvancedProviderSettings({ className }: AdvancedProviderSettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [settings, setSettings] = useState<ProviderSettings[]>([]);
  const [currentSettings, setCurrentSettings] = useState<ProviderSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state for editing
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    baseSettings: BaseProviderSettings;
    specificSettings: ProviderSpecificSettings;
  }>({
    name: '',
    description: '',
    baseSettings: {},
    specificSettings: {}
  });

  // Provider capabilities information
  const providerCapabilities: Record<string, ProviderCapabilityInfo> = {
    'fal-qwen': {
      name: 'Fal-AI Qwen',
      description: 'High-quality text-to-image generation with Qwen model via Fal-AI',
      inferenceSteps: { min: 1, max: 50, default: 25 },
      guidanceScale: { min: 0.0, max: 20.0, default: 3.0, step: 0.1 },
      supportedImageSizes: ['square', 'square_hd', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'],
      maxImages: 4,
      costPerMegapixel: 0.05,
      supportsSeeds: true,
      supportsSafetyChecker: true
    },
    'fal-ideogram': {
      name: 'Fal-AI Ideogram',
      description: 'Premium image generation with exceptional typography handling via Fal-AI',
      inferenceSteps: { min: 1, max: 50, default: 25 },
      guidanceScale: { min: 0.0, max: 20.0, default: 3.0, step: 0.1 },
      supportedImageSizes: ['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'],
      maxImages: 4,
      costPerMegapixel: 0.06, // Default BALANCED speed
      supportsSeeds: true,
      supportsSafetyChecker: false
    },
    'ideogram': {
      name: 'Ideogram',
      description: 'Premium image generation with excellent text rendering',
      inferenceSteps: { min: 10, max: 100, default: 30 },
      guidanceScale: { min: 1.0, max: 25.0, default: 7.5, step: 0.5 },
      supportedImageSizes: ['1:1', '16:9', '9:16', '4:3', '3:4'],
      maxImages: 1,
      costPerMegapixel: 0.08,
      supportsSeeds: false,
      supportsSafetyChecker: true
    },
    'huggingface': {
      name: 'HuggingFace',
      description: 'Open-source models via HuggingFace Inference API',
      inferenceSteps: { min: 5, max: 100, default: 25 },
      guidanceScale: { min: 1.0, max: 20.0, default: 7.5, step: 0.5 },
      supportedImageSizes: ['512x512', '768x768', '1024x1024'],
      maxImages: 1,
      costPerMegapixel: 0.01,
      supportsSeeds: true,
      supportsSafetyChecker: false
    },
    'qwen': {
      name: 'Qwen (HF Spaces)',
      description: 'Qwen model via HuggingFace Spaces (free)',
      inferenceSteps: { min: 10, max: 50, default: 25 },
      guidanceScale: { min: 1.0, max: 10.0, default: 4.0, step: 0.1 },
      supportedImageSizes: ['1:1', '16:9', '9:16', '4:3', '3:4'],
      maxImages: 1,
      costPerMegapixel: 0.0,
      supportsSeeds: false,
      supportsSafetyChecker: false
    }
  };

  const providers = Object.keys(providerCapabilities);

  useEffect(() => {
    // Initial load - fetch all settings and set the current default provider
    fetchAllSettings();
  }, []);

  useEffect(() => {
    // Fetch settings for the selected provider when it changes
    if (selectedProvider) {
      fetchSettings();
    }
  }, [selectedProvider]);

  useEffect(() => {
    // Load current settings when provider changes
    if (settings.length > 0) {
      const defaultSettings = settings.find(s => s.providerId === selectedProvider && s.isDefault);
      const latestSettings = defaultSettings || settings.find(s => s.providerId === selectedProvider);
      
      if (latestSettings) {
        console.log(`[AdvancedProviderSettings] Loading existing settings for ${selectedProvider}:`, latestSettings);
        setCurrentSettings(latestSettings);
        setFormData({
          name: latestSettings.name,
          description: latestSettings.description || '',
          baseSettings: latestSettings.baseSettings,
          specificSettings: latestSettings.specificSettings
        });
      } else {
        // Create default form data for new provider
        console.log(`[AdvancedProviderSettings] No existing settings found for ${selectedProvider}, creating defaults`);
        setCurrentSettings(null);
        resetToDefaults();
      }
    } else {
      // No settings loaded yet, create defaults
      console.log(`[AdvancedProviderSettings] No settings loaded, creating defaults for ${selectedProvider}`);
      setCurrentSettings(null);
      resetToDefaults();
    }
  }, [selectedProvider, settings]);

  const fetchAllSettings = async () => {
    setIsLoading(true);
    try {
      console.log(`[AdvancedProviderSettings] Fetching all provider settings`);
      const response = await fetch(`/api/admin/provider-settings`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[AdvancedProviderSettings] Fetched all settings:`, data.settings);
        setSettings(data.settings || []);
        
        // Find the current default provider
        const defaultSettings = data.settings?.find((s: any) => s.isDefault && s.isActive);
        if (defaultSettings) {
          console.log(`[AdvancedProviderSettings] Found default provider: ${defaultSettings.providerId}`);
          setSelectedProvider(defaultSettings.providerId);
        } else {
          console.log(`[AdvancedProviderSettings] No default provider found, using fal-qwen`);
          setSelectedProvider('fal-qwen');
        }
      } else {
        const errorData = await response.json();
        console.error(`[AdvancedProviderSettings] Fetch all failed:`, errorData);
        toast.error(`Failed to fetch provider settings: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching all settings:', error);
      toast.error('Failed to fetch provider settings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      console.log(`[AdvancedProviderSettings] Fetching settings for provider: ${selectedProvider}`);
      const response = await fetch(`/api/admin/provider-settings?providerId=${selectedProvider}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[AdvancedProviderSettings] Fetched settings:`, data.settings);
        setSettings(data.settings || []);
      } else {
        const errorData = await response.json();
        console.error(`[AdvancedProviderSettings] Fetch failed:`, errorData);
        toast.error(`Failed to fetch provider settings: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch provider settings');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    const capabilities = providerCapabilities[selectedProvider];
    if (!capabilities) {
      console.error(`[AdvancedProviderSettings] No capabilities found for provider: ${selectedProvider}`);
      return;
    }

    const defaultFormData = {
      name: `Default ${capabilities.name} Settings`,
      description: `Default configuration for ${capabilities.name} provider`,
      baseSettings: {
        inferenceSteps: capabilities.inferenceSteps.default,
        guidanceScale: capabilities.guidanceScale.default,
        enableSafetyChecker: capabilities.supportsSafetyChecker,
        numImages: 1,
        costPerImage: capabilities.costPerMegapixel
      },
      specificSettings: getDefaultSpecificSettings(selectedProvider)
    };

    console.log(`[AdvancedProviderSettings] Setting default form data for ${selectedProvider}:`, defaultFormData);
    setFormData(defaultFormData);
  };

  const getDefaultSpecificSettings = (providerId: string): ProviderSpecificSettings => {
    switch (providerId) {
      case 'fal-qwen':
        return {
          'fal-qwen': {
            imageSize: 'square_hd',
            enableSafetyChecker: true,
            syncMode: false,
            guidanceScale: 3.0,
            numInferenceSteps: 25,
            numImages: 1
          }
        };
      case 'fal-ideogram':
        return {
          'fal-ideogram': {
            renderingSpeed: 'BALANCED',
            expandPrompt: true,
            style: 'AUTO',
            negativePrompt: '',
            imageSize: 'square_hd',
            syncMode: false,
            numImages: 1
          }
        };
      case 'ideogram':
        return {
          ideogram: {
            renderingSpeed: 'TURBO',
            magicPromptOption: 'AUTO',
            styleType: 'GENERAL'
          }
        };
      case 'huggingface':
        return {
          huggingface: {
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            schedulerType: 'DPMSolverMultistepScheduler'
          }
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate form data before sending
      if (!selectedProvider) {
        toast.error('Provider ID is required');
        setIsSaving(false);
        return;
      }
      
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Settings name is required');
        setIsSaving(false);
        return;
      }

      console.log('[AdvancedProviderSettings] Saving with data:', {
        providerId: selectedProvider,
        name: formData.name,
        description: formData.description,
        hasBaseSettings: !!formData.baseSettings,
        hasSpecificSettings: !!formData.specificSettings
      });

      const payload = {
        ...(currentSettings?.id && { id: currentSettings.id }),
        providerId: selectedProvider,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        baseSettings: formData.baseSettings || {},
        specificSettings: formData.specificSettings || {},
        isActive: true,
        isDefault: !currentSettings || currentSettings.isDefault
      };

      const url = '/api/admin/provider-settings';
      const method = currentSettings?.id ? 'PUT' : 'POST';

      console.log(`[AdvancedProviderSettings] Sending ${method} request to ${url}`, payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Settings ${currentSettings?.id ? 'updated' : 'created'} successfully`);
        await fetchSettings();
      } else {
        const error = await response.json();
        console.error('[AdvancedProviderSettings] API Error:', error);
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBaseSettings = (key: keyof BaseProviderSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      baseSettings: {
        ...prev.baseSettings,
        [key]: value
      }
    }));
  };

  const updateSpecificSettings = (providerKey: string, settings: any) => {
    setFormData(prev => ({
      ...prev,
      specificSettings: {
        ...prev.specificSettings,
        [providerKey]: {
          ...prev.specificSettings[providerKey as keyof ProviderSpecificSettings],
          ...settings
        }
      }
    }));
  };

  const updateQualityPreset = (quality: 'fast' | 'standard' | 'high' | 'ultra', key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      baseSettings: {
        ...prev.baseSettings,
        qualityPresets: {
          ...prev.baseSettings.qualityPresets,
          [quality]: {
            ...prev.baseSettings.qualityPresets?.[quality],
            [key]: value
          }
        }
      }
    }));
  };

  const capabilities = providerCapabilities[selectedProvider];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Provider Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Provider Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure advanced parameters for AI image generation providers. Settings are applied globally for all users.
          </p>
        </CardHeader>
        <CardContent>
          {/* Provider Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Select Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex items-center gap-2">
                        {providerCapabilities[provider].name}
                        <Badge variant="outline" className="text-xs">
                          ${providerCapabilities[provider].costPerMegapixel}/MP
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider Info */}
            {capabilities && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{capabilities.name}:</strong> {capabilities.description}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Cost: ${capabilities.costPerMegapixel}/megapixel • 
                    Steps: {capabilities.inferenceSteps.min}-{capabilities.inferenceSteps.max} • 
                    Max Images: {capabilities.maxImages}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {!selectedProvider && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Loading provider settings...
                </AlertDescription>
              </Alert>
            )}

            {selectedProvider && (
              <>
                <Separator />

                {/* Settings Form */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <Sliders className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="cost" className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Cost
                </TabsTrigger>
                <TabsTrigger value="specific" className="flex items-center gap-1">
                  <Image className="h-4 w-4" />
                  Provider
                </TabsTrigger>
              </TabsList>

              {/* Basic Settings */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Settings Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., High Quality Settings"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                {capabilities && (
                  <>
                    <div>
                      <Label>Inference Steps: {formData.baseSettings.inferenceSteps || capabilities.inferenceSteps.default}</Label>
                      <Slider
                        value={[formData.baseSettings.inferenceSteps || capabilities.inferenceSteps.default]}
                        onValueChange={([value]) => updateBaseSettings('inferenceSteps', value)}
                        min={capabilities.inferenceSteps.min}
                        max={capabilities.inferenceSteps.max}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Fast ({capabilities.inferenceSteps.min})</span>
                        <span>Quality ({capabilities.inferenceSteps.max})</span>
                      </div>
                    </div>

                    <div>
                      <Label>Guidance Scale: {formData.baseSettings.guidanceScale || capabilities.guidanceScale.default}</Label>
                      <Slider
                        value={[formData.baseSettings.guidanceScale || capabilities.guidanceScale.default]}
                        onValueChange={([value]) => updateBaseSettings('guidanceScale', value)}
                        min={capabilities.guidanceScale.min}
                        max={capabilities.guidanceScale.max}
                        step={capabilities.guidanceScale.step}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Creative ({capabilities.guidanceScale.min})</span>
                        <span>Precise ({capabilities.guidanceScale.max})</span>
                      </div>
                    </div>

                    {/* Quality Presets Configuration */}
                    <div>
                      <Label>Default Quality Setting</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Choose the default quality level for all image generations. 
                        {selectedProvider === 'fal-qwen' && (
                          <span className="block mt-1 text-amber-600">
                            ⚡ Fal-Qwen: Automatic quality compensation applied for different aspect ratios (9:16 gets +50% inference steps for sharpness)
                          </span>
                        )}
                      </p>
                      <Select
                        value={formData.baseSettings.defaultQuality || 'standard'}
                        onValueChange={(value) => updateBaseSettings('defaultQuality', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">⚡</span>
                              <div>
                                <div className="font-medium">Fast</div>
                                <div className="text-xs text-muted-foreground">Quick generation, lower quality</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="standard">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">⚖️</span>
                              <div>
                                <div className="font-medium">Standard</div>
                                <div className="text-xs text-muted-foreground">Balanced speed and quality</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">🎨</span>
                              <div>
                                <div className="font-medium">High Quality</div>
                                <div className="text-xs text-muted-foreground">Better quality, slower generation</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="ultra">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">💎</span>
                              <div>
                                <div className="font-medium">Ultra Quality</div>
                                <div className="text-xs text-muted-foreground">Maximum quality, slowest generation</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quality Preset Overrides */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <Label className="text-sm font-medium">Quality Preset Customization</Label>
                      <p className="text-xs text-muted-foreground">Override default quality mappings for fine-tuned control</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Fast Quality Steps</Label>
                          <Input
                            type="number"
                            placeholder={capabilities?.inferenceSteps?.min?.toString() || "10"}
                            value={formData.baseSettings.qualityPresets?.fast?.inferenceSteps || ''}
                            onChange={(e) => updateQualityPreset('fast', 'inferenceSteps', parseInt(e.target.value) || undefined)}
                            min={capabilities?.inferenceSteps?.min || 1}
                            max={capabilities?.inferenceSteps?.max || 100}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Standard Quality Steps</Label>
                          <Input
                            type="number"
                            placeholder="25"
                            value={formData.baseSettings.qualityPresets?.standard?.inferenceSteps || ''}
                            onChange={(e) => updateQualityPreset('standard', 'inferenceSteps', parseInt(e.target.value) || undefined)}
                            min={capabilities?.inferenceSteps?.min || 1}
                            max={capabilities?.inferenceSteps?.max || 100}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">High Quality Steps</Label>
                          <Input
                            type="number"
                            placeholder="35"
                            value={formData.baseSettings.qualityPresets?.high?.inferenceSteps || ''}
                            onChange={(e) => updateQualityPreset('high', 'inferenceSteps', parseInt(e.target.value) || undefined)}
                            min={capabilities?.inferenceSteps?.min || 1}
                            max={capabilities?.inferenceSteps?.max || 100}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Ultra Quality Steps</Label>
                          <Input
                            type="number"
                            placeholder="50"
                            value={formData.baseSettings.qualityPresets?.ultra?.inferenceSteps || ''}
                            onChange={(e) => updateQualityPreset('ultra', 'inferenceSteps', parseInt(e.target.value) || undefined)}
                            min={capabilities?.inferenceSteps?.min || 1}
                            max={capabilities?.inferenceSteps?.max || 100}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
                        💡 Leave empty to use provider defaults. Higher inference steps = better quality but slower generation.
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {capabilities?.supportsSeeds && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Seed Control</Label>
                        <p className="text-xs text-muted-foreground">Allow users to set seeds for reproducible generations</p>
                      </div>
                      <Switch
                        checked={formData.baseSettings.randomizeSeed === false}
                        onCheckedChange={(checked) => updateBaseSettings('randomizeSeed', !checked)}
                      />
                    </div>
                  )}

                  {capabilities?.supportsSafetyChecker && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Safety Checker</Label>
                        <p className="text-xs text-muted-foreground">Filter inappropriate content</p>
                      </div>
                      <Switch
                        checked={formData.baseSettings.enableSafetyChecker !== false}
                        onCheckedChange={(checked) => updateBaseSettings('enableSafetyChecker', checked)}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Number of Images</Label>
                    <Select
                      value={formData.baseSettings.numImages?.toString() || '1'}
                      onValueChange={(value) => updateBaseSettings('numImages', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: capabilities?.maxImages || 1 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} image{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority Level</Label>
                    <Select
                      value={formData.baseSettings.priority || 'normal'}
                      onValueChange={(value) => updateBaseSettings('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Cost Settings */}
              <TabsContent value="cost" className="space-y-4">
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    Current cost estimate: <strong>${capabilities?.costPerMegapixel || 0}/megapixel</strong>
                    <br />
                    Average cost per image: <strong>${(capabilities?.costPerMegapixel || 0) * 1.0}+</strong>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxDailyCost">Daily Cost Limit ($)</Label>
                    <Input
                      id="maxDailyCost"
                      type="number"
                      step="0.01"
                      value={formData.baseSettings.maxDailyCost || ''}
                      onChange={(e) => updateBaseSettings('maxDailyCost', parseFloat(e.target.value) || undefined)}
                      placeholder="e.g., 10.00"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Set limit to prevent unexpected costs
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Budget Alerts</Label>
                      <p className="text-xs text-muted-foreground">Notify when approaching limit</p>
                    </div>
                    <Switch
                      checked={formData.baseSettings.budgetAlert !== false}
                      onCheckedChange={(checked) => updateBaseSettings('budgetAlert', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Provider-Specific Settings */}
              <TabsContent value="specific" className="space-y-4">
                {selectedProvider === 'fal-qwen' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Fal-AI Qwen Specific Settings</h4>
                    
                    <div>
                      <Label>Image Size</Label>
                      <Select
                        value={formData.specificSettings['fal-qwen']?.imageSize || 'square_hd'}
                        onValueChange={(value) => updateSpecificSettings('fal-qwen', { imageSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {capabilities?.supportedImageSizes.map(size => (
                            <SelectItem key={size} value={size}>
                              {size.replace(/_/g, ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sync Mode</Label>
                        <p className="text-xs text-muted-foreground">Wait for generation to complete</p>
                      </div>
                      <Switch
                        checked={formData.specificSettings['fal-qwen']?.syncMode === true}
                        onCheckedChange={(checked) => updateSpecificSettings('fal-qwen', { syncMode: checked })}
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'fal-ideogram' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Fal-AI Ideogram Specific Settings</h4>
                    
                    <div>
                      <Label>Rendering Speed</Label>
                      <Select
                        value={formData.specificSettings['fal-ideogram']?.renderingSpeed || 'BALANCED'}
                        onValueChange={(value) => updateSpecificSettings('fal-ideogram', { renderingSpeed: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TURBO">Turbo (Fast) - $0.03/megapixel</SelectItem>
                          <SelectItem value="BALANCED">Balanced - $0.06/megapixel</SelectItem>
                          <SelectItem value="QUALITY">Quality (Slow) - $0.09/megapixel</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cost varies by rendering speed: Turbo ($0.03), Balanced ($0.06), Quality ($0.09) per megapixel
                      </p>
                    </div>

                    <div>
                      <Label>Style</Label>
                      <Select
                        value={formData.specificSettings['fal-ideogram']?.style || 'AUTO'}
                        onValueChange={(value) => updateSpecificSettings('fal-ideogram', { style: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUTO">Auto</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="REALISTIC">Realistic</SelectItem>
                          <SelectItem value="DESIGN">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Expand Prompt</Label>
                      <p className="text-xs text-muted-foreground">Use MagicPrompt to enhance prompts</p>
                      <Switch
                        checked={formData.specificSettings['fal-ideogram']?.expandPrompt === true}
                        onCheckedChange={(checked) => updateSpecificSettings('fal-ideogram', { expandPrompt: checked })}
                      />
                    </div>

                    <div>
                      <Label>Negative Prompt</Label>
                      <Textarea
                        placeholder="Describe what to exclude from the image..."
                        value={formData.specificSettings['fal-ideogram']?.negativePrompt || ''}
                        onChange={(e) => updateSpecificSettings('fal-ideogram', { negativePrompt: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Image Size</Label>
                      <Select
                        value={formData.specificSettings['fal-ideogram']?.imageSize || 'square_hd'}
                        onValueChange={(value) => updateSpecificSettings('fal-ideogram', { imageSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {capabilities?.supportedImageSizes.map(size => (
                            <SelectItem key={size} value={size}>
                              {size.replace(/_/g, ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sync Mode</Label>
                        <p className="text-xs text-muted-foreground">Wait for generation to complete</p>
                      </div>
                      <Switch
                        checked={formData.specificSettings['fal-ideogram']?.syncMode === true}
                        onCheckedChange={(checked) => updateSpecificSettings('fal-ideogram', { syncMode: checked })}
                      />
                    </div>
                  </div>
                )}

                {selectedProvider === 'ideogram' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Ideogram Specific Settings</h4>
                    
                    <div>
                      <Label>Rendering Speed</Label>
                      <Select
                        value={formData.specificSettings.ideogram?.renderingSpeed || 'TURBO'}
                        onValueChange={(value) => updateSpecificSettings('ideogram', { renderingSpeed: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TURBO">Turbo (Fast)</SelectItem>
                          <SelectItem value="BALANCED">Balanced</SelectItem>
                          <SelectItem value="QUALITY">Quality (Slow)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Style Type</Label>
                      <Select
                        value={formData.specificSettings.ideogram?.styleType || 'GENERAL'}
                        onValueChange={(value) => updateSpecificSettings('ideogram', { styleType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="REALISTIC">Realistic</SelectItem>
                          <SelectItem value="DESIGN">Design</SelectItem>
                          <SelectItem value="RENDER_3D">3D Render</SelectItem>
                          <SelectItem value="ANIME">Anime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
              </>
            )}



            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={resetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={fetchSettings}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
                  {isSaving ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Preview */}
      {currentSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Active Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{currentSettings.name}</span>
                <Badge variant={currentSettings.isDefault ? 'default' : 'secondary'}>
                  {currentSettings.isDefault ? 'Default' : 'Custom'}
                </Badge>
              </div>
              {currentSettings.description && (
                <p className="text-sm text-muted-foreground">{currentSettings.description}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(currentSettings.updatedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
