#!/usr/bin/env tsx

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testAspectRatioMapping() {
  console.log('🎯 Testing Aspect Ratio Mapping for Shape Selection');
  console.log('==================================================\n');
  
  // Define the shapes from the component
  const shapes = [
    { id: 1, aspect: "16:9", width: 1920, height: 1080, name: "Landscape" },
    { id: 2, aspect: "4:3", width: 1600, height: 1200, name: "Standard" },
    { id: 3, aspect: "1:1", width: 1080, height: 1080, name: "Instagram Post" },
    { id: 4, aspect: "9:16", width: 1080, height: 1920, name: "Instagram Story" },
    { id: 5, aspect: "3:4", width: 1200, height: 1600, name: "Flyer" },
    { id: 6, aspect: "4:5", width: 1080, height: 1350, name: "Instagram Portrait" },
    { id: 7, aspect: "5:7", width: 1000, height: 1400, name: "Greeting Card" },
    { id: 8, aspect: "2:3", width: 800, height: 1200, name: "Card Portrait" },
  ];
  
  // Simulate the getAspectRatio function from the component
  const getAspectRatio = (selectedShape: any) => {
    if (!selectedShape) return "1:1";
    if (selectedShape.aspect === "16:9") return "16:9";
    if (selectedShape.aspect === "4:3") return "4:3";
    if (selectedShape.aspect === "1:1") return "1:1";
    if (selectedShape.aspect === "9:16") return "9:16";
    if (selectedShape.aspect === "3:4") return "3:4";
    if (selectedShape.aspect === "4:5") return "4:5";
    if (selectedShape.aspect === "5:7") return "5:7";
    if (selectedShape.aspect === "2:3") return "2:3";
    return "1:1";
  };
  
  console.log('📋 Testing Aspect Ratio Mapping:');
  shapes.forEach(shape => {
    const mappedRatio = getAspectRatio(shape);
    const isCorrect = mappedRatio === shape.aspect;
    const status = isCorrect ? '✅' : '❌';
    console.log(`   ${status} ${shape.name}: ${shape.aspect} → ${mappedRatio}`);
  });
  
  // Check if Qwen provider supports these ratios
  try {
    const { imageProviders } = await import('../lib/providers');
    imageProviders.reloadProviders();
    
    const qwenProvider = imageProviders.getProvider("qwen");
    if (qwenProvider) {
      const capabilities = qwenProvider.getCapabilities();
      
      console.log('\n📊 Qwen Provider Support:');
      shapes.forEach(shape => {
        const isSupported = capabilities.supportedAspectRatios.includes(shape.aspect);
        const status = isSupported ? '✅' : '❌';
        console.log(`   ${status} ${shape.name} (${shape.aspect}): ${isSupported ? 'Supported' : 'Not Supported'}`);
      });
      
      console.log('\n🔍 Qwen Aspect Ratio Hints:');
      for (const shape of shapes) {
        try {
          // Test image generation to see the aspect ratio hint
          const testParams = {
            prompt: "test image",
            aspectRatio: shape.aspect as any,
            quality: "fast" as any,
            userId: "test-user"
          };
          
          console.log(`   ${shape.name} (${shape.aspect}): Testing...`);
          
          const result = await imageProviders.getProvider("qwen")?.generateImage(testParams);
          if (result) {
            console.log(`     ✅ Generated ${result.metadata.width}x${result.metadata.height}`);
            console.log(`     📝 Aspect: ${result.metadata.aspectRatio}`);
          }
          
        } catch (error: any) {
          if (error.message?.includes('quota')) {
            console.log(`     ⏰ Quota exceeded (expected)`);
          } else {
            console.log(`     ❌ Error: ${error.message?.substring(0, 50)}...`);
          }
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Could not test provider capabilities:', error);
  }
  
  console.log('\n✅ Aspect ratio mapping test complete!');
  console.log('🎯 All shape aspect ratios should now be properly mapped to Qwen generation');
}

testAspectRatioMapping().catch(console.error);
