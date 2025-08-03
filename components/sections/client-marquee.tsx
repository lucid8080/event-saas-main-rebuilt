"use client";

import { useState, useEffect } from "react";
import { Marquee3D } from "@/components/magicui/marquee-3d";

export function ClientMarquee() {
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);

  useEffect(() => {
    // Check marquee setting from localStorage or default to true
    const savedSetting = localStorage.getItem("marqueeEnabled");
    if (savedSetting !== null) {
      setMarqueeEnabled(savedSetting === "true");
    }
  }, []);

  if (!marqueeEnabled) return null;

  return (
    <div className="absolute opacity-20 inset-0 z-0">
      <Marquee3D />
    </div>
  );
} 