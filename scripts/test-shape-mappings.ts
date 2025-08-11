#!/usr/bin/env tsx

/**
 * Test script to verify shape mappings for all UI shapes
 */

// UI shapes from image-generator.tsx
const shapes = [
  { id: 1, aspect: "16:9", width: 1920, height: 1080, name: "Landscape", description: "Perfect for banners, wide displays, and TikTok landscape videos" },
  { id: 2, aspect: "4:3", width: 1600, height: 1200, name: "Standard", description: "Traditional format for presentations" },
  { id: 3, aspect: "1:1", width: 1080, height: 1080, name: "Instagram Post", description: "Instagram feed posts, Facebook posts, and LinkedIn (1080x1080)" },
  { id: 4, aspect: "9:16", width: 1080, height: 1920, name: "Instagram Story", description: "Instagram Stories and TikTok videos (1080x1920)" },
  { id: 5, aspect: "3:4", width: 1200, height: 1600, name: "Flyer", description: "Perfect for event flyers, posters, and promotional materials" },
  { id: 6, aspect: "4:5", width: 1080, height: 1350, name: "Instagram Portrait", description: "Instagram portrait posts (1080x1350)" },
  { id: 7, aspect: "5:7", width: 1000, height: 1400, name: "Greeting Card", description: "Perfect for birthday cards, anniversary cards, and milestone celebrations" },
  { id: 8, aspect: "2:3", width: 800, height: 1200, name: "Card Portrait", description: "Ideal for vertical greeting cards and invitations" },
];

// Fal-AI aspect ratio mapping from fal-qwen-provider.ts
const aspectRatioToImageSize = {
  "1:1": "square_hd",
  "16:9": "landscape_16_9", 
  "9:16": "portrait_16_9",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
  "4:5": "portrait_4_3",   // Closest available: 3:4 is similar to 4:5
  "5:7": "portrait_16_9",  // Closest available: 9:16 is similar to 5:7
  "3:2": "landscape_4_3",  // Fallback to closest
  "2:3": "portrait_4_3"    // Fallback to closest
};

console.log("🔍 Testing Shape to Fal-AI Image Size Mappings\n");

console.log("UI Shapes and their Fal-AI mappings:");
console.log("==========================================");

for (const shape of shapes) {
  const aspect = shape.aspect;
  const falImageSize = aspectRatioToImageSize[aspect as keyof typeof aspectRatioToImageSize] || "square_hd";
  
  console.log(`${shape.name.padEnd(20)} | ${aspect.padEnd(6)} | ${falImageSize.padEnd(16)} | ${shape.description}`);
  
  // Check if the aspect ratio is roughly preserved
  const [widthRatio, heightRatio] = aspect.split(':').map(Number);
  const actualRatio = widthRatio / heightRatio;
  
  // Calculate expected ratios for Fal-AI image sizes (rough estimates)
  const falRatios: Record<string, number> = {
    "square_hd": 1.0,           // 1:1
    "landscape_16_9": 16/9,     // 1.78
    "portrait_16_9": 9/16,      // 0.56
    "landscape_4_3": 4/3,       // 1.33
    "portrait_4_3": 3/4,        // 0.75
  };
  
  const falRatio = falRatios[falImageSize] || 1.0;
  const ratioDifference = Math.abs(actualRatio - falRatio);
  
  if (ratioDifference > 0.2) {
    console.log(`   ⚠️  WARNING: Aspect ratio mismatch! UI ${aspect} (${actualRatio.toFixed(2)}) → Fal ${falImageSize} (${falRatio.toFixed(2)})`);
  } else {
    console.log(`   ✅ Good mapping`);
  }
  console.log("");
}

console.log("\n📊 Summary of Fal-AI Image Size Usage:");
const usageCount: Record<string, string[]> = {};
for (const shape of shapes) {
  const falImageSize = aspectRatioToImageSize[shape.aspect as keyof typeof aspectRatioToImageSize] || "square_hd";
  if (!usageCount[falImageSize]) {
    usageCount[falImageSize] = [];
  }
  usageCount[falImageSize].push(`${shape.aspect} (${shape.name})`);
}

for (const [falSize, shapes] of Object.entries(usageCount)) {
  console.log(`${falSize}:`);
  shapes.forEach(shape => console.log(`  - ${shape}`));
  console.log("");
}

console.log("🎯 Recommendations:");
console.log("- 4:5 and 5:7 are mapped to closest available Fal-AI sizes");
console.log("- Users selecting these shapes will get slightly different aspect ratios");
console.log("- Consider adding a UI warning for shapes that don't have exact matches");
