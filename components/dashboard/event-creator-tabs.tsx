"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGenerator } from "./image-generator";
import { CarouselMaker } from "./carousel-maker";
import { ImageIcon, Layers } from "lucide-react";

export function EventCreatorTabs() {
  const [activeTab, setActiveTab] = useState("event-generator");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full mb-6">
        <TabsTrigger value="event-generator" className="flex items-center gap-2">
          <ImageIcon className="size-4" />
          Event Generator
        </TabsTrigger>
        <TabsTrigger value="carousel-maker" className="flex items-center gap-2">
          <Layers className="size-4" />
          Carousel Maker
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="event-generator" className="mt-0">
        <ImageGenerator />
      </TabsContent>
      
      <TabsContent value="carousel-maker" className="mt-0">
        <CarouselMaker />
      </TabsContent>
    </Tabs>
  );
} 