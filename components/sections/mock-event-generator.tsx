"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const eventTypes = [
  { value: "wedding", label: "Wedding", available: true },
  { value: "birthday", label: "Birthday Party", available: false },
  { value: "corporate", label: "Corporate Event", available: false },
  { value: "anniversary", label: "Anniversary", available: false },
  { value: "graduation", label: "Graduation", available: false },
  { value: "holiday", label: "Holiday Celebration", available: false },
];

const stylePresets = [
  { 
    value: "golden-harmony", 
    label: "Golden Harmony", 
    available: true,
    image: "/styles/4_golden_harmony.jpg"
  },
  { 
    value: "pop-art", 
    label: "Pop Art", 
    available: false,
    image: "/styles/2_Pop_Art.jpg"
  },
  { 
    value: "vintage", 
    label: "Vintage", 
    available: false,
    image: "/styles/5_Vintage_Film_Poster.jpg"
  },
  { 
    value: "cyberpunk", 
    label: "Cyberpunk", 
    available: false,
    image: "/styles/7_Cyberpunk.jpg"
  },
  { 
    value: "minimalist", 
    label: "Minimalist", 
    available: false,
    image: "/styles/1_no_style.jpg"
  },
  { 
    value: "watercolor", 
    label: "Watercolor", 
    available: false,
    image: "/styles/3_children_book.jpg"
  },
];

export default function MockEventGenerator() {
  const [selectedEventType, setSelectedEventType] = useState("wedding");
  const [selectedStyle, setSelectedStyle] = useState("golden-harmony");
  const [additionalDetails, setAdditionalDetails] = useState("Come celebrate with John & Kate on June 16th at 3:00 PM");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation time
    setTimeout(() => {
      setIsGenerating(false);
      setShowResult(true);
    }, 2000);
  };

  return (
    <div className="py-16 bg-gradient-to-b from-background via-slate-900/50 to-background">
      <MaxWidthWrapper className="px-2.5 lg:px-7">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Demo</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Try Our AI Event Generator
          </h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Experience how our AI transforms your event details into stunning visual designs
          </p>
        </div>

                 <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                     {/* Generator Panel */}
           <Card className="border border-purple-500/20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-white">
                 <Sparkles className="h-5 w-5 text-purple-400" />
                 Event Generator
               </CardTitle>
             </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((eventType) => (
                      <SelectItem 
                        key={eventType.value} 
                        value={eventType.value}
                        disabled={!eventType.available}
                        className={!eventType.available ? "opacity-50" : ""}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{eventType.label}</span>
                          {!eventType.available && (
                            <Badge variant="secondary" className="text-xs">
                              Available Inside
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

                             {/* Style Selection */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">Style Preset</label>
                 <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {stylePresets.map((style) => (
                       <SelectItem 
                         key={style.value} 
                         value={style.value}
                         disabled={!style.available}
                         className={!style.available ? "opacity-50" : ""}
                       >
                         <div className="flex items-center gap-3 w-full">
                           <div className="w-12 h-8 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                             <img
                               src={style.image}
                               alt={style.label}
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div className="flex items-center justify-between flex-1">
                             <span className="font-medium">{style.label}</span>
                             {!style.available && (
                               <Badge variant="secondary" className="text-xs">
                                 Available Inside
                               </Badge>
                             )}
                           </div>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Details</label>
                <Textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Describe your event details..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Event Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

                     {/* Result Panel */}
           <Card className="border border-purple-500/20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-white">
                 <Sparkles className="h-5 w-5 text-purple-400" />
                 Your Event Will Appear Here
               </CardTitle>
             </CardHeader>
                         <CardContent className="flex flex-col h-full">
               <div className="flex-1 rounded-xl overflow-hidden border border-dashed border-purple-400/30 bg-gradient-to-br from-slate-700/20 to-slate-800/20">
                                 {showResult ? (
                   <div className="relative w-full h-full">
                     <img
                       src="/img_1754883599006_y587xpzgi_2025-08-11_wedding_1_1_default_clean_unknown_ideogram.webp"
                       alt="Generated wedding event design"
                       className="w-full h-full object-cover"
                     />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-purple-600 text-white">
                        Golden Harmony Style
                      </Badge>
                    </div>
                  </div>
                                 ) : (
                   <div className="flex items-center justify-center h-full">
                     <div className="text-center text-slate-300">
                       <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                       <p className="text-lg font-medium">Click Generate to see your event</p>
                       <p className="text-sm">Your AI-generated event design will appear here</p>
                     </div>
                   </div>
                 )}
              </div>
              
              
            </CardContent>
          </Card>
        </div>

                 <div className="text-center mt-8">
           <p className="text-sm text-slate-400">
             This is a demonstration. Sign up to generate unlimited custom event designs!
           </p>
         </div>
      </MaxWidthWrapper>
    </div>
  );
}
