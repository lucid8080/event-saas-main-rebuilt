"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Logo {
  id: string;
  name: string;
  svg: string;
  url: string;
  category?: string;
}

interface LogoSearchProps {
  onLogoSelect: (logo: Logo) => void;
  onClose: () => void;
}

export function LogoSearch({ onLogoSelect, onClose }: LogoSearchProps) {
  const [uploadedLogos, setUploadedLogos] = useState<Logo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          // Check if it's an SVG file
          if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
            const newLogo: Logo = {
              id: `uploaded-${Date.now()}-${Math.random()}`,
              name: file.name.replace('.svg', ''),
              svg: content,
              url: '',
              category: 'uploaded'
            };
            setUploadedLogos(prev => [...prev, newLogo]);
            toast.success(`Uploaded ${file.name}`);
          } else {
            toast.error(`${file.name} is not a valid SVG file`);
          }
        }
      };
      reader.readAsText(file);
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadedLogo = (logoId: string) => {
    setUploadedLogos(prev => prev.filter(logo => logo.id !== logoId));
    toast.success("Logo removed");
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Upload Your Logos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload SVG logo files to add to your generated image
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-xl font-medium mb-2">Upload Your Logo</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Upload SVG files to add your own logos to the generated image
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="mb-4"
              >
                <Plus className="h-5 w-5 mr-2" />
                Choose SVG Files
              </Button>
              <p className="text-xs text-gray-500">
                Only SVG files are supported
              </p>
            </div>

            {/* Uploaded Logos */}
            {uploadedLogos.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Uploaded Logos ({uploadedLogos.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedLogos.map((logo) => (
                    <Card key={logo.id} className="relative group hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-center h-24 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div
                            className="w-16 h-16"
                            dangerouslySetInnerHTML={{ __html: logo.svg }}
                          />
                        </div>
                        <p className="text-sm font-medium text-center mb-3 truncate">
                          {logo.name}
                        </p>
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onLogoSelect(logo)}
                                className="flex-1"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add to image</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeUploadedLogo(logo.id)}
                                className="text-red-500 hover:text-red-700 hover:border-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove</TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 