import { prisma } from "../lib/db";

async function checkPromptLengths() {
  try {
    console.log("🔍 Checking prompt lengths in database...\n");

    // Check Wedding event type prompt
    const weddingPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category: 'event_type',
        subcategory: 'WEDDING',
        isActive: true
      }
    });
    
    console.log("📋 Wedding Event Type Prompt:");
    if (weddingPrompt) {
      console.log(`Content: ${weddingPrompt.content}`);
      console.log(`Length: ${weddingPrompt.content.length} characters\n`);
    } else {
      console.log("❌ Not found\n");
    }
    
    // Check Golden Harmony style preset
    const goldenHarmonyPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category: 'style_preset',
        subcategory: 'Golden Harmony',
        isActive: true
      }
    });
    
    console.log("🎨 Golden Harmony Style Preset:");
    if (goldenHarmonyPrompt) {
      console.log(`Content: ${goldenHarmonyPrompt.content}`);
      console.log(`Length: ${goldenHarmonyPrompt.content.length} characters\n`);
    } else {
      console.log("❌ Not found\n");
    }

    // Check Children Book style preset for comparison
    const childrenBookPrompt = await prisma.systemPrompt.findFirst({
      where: {
        category: 'style_preset',
        subcategory: 'Children Book',
        isActive: true
      }
    });
    
    console.log("📚 Children Book Style Preset:");
    if (childrenBookPrompt) {
      console.log(`Content: ${childrenBookPrompt.content}`);
      console.log(`Length: ${childrenBookPrompt.content.length} characters\n`);
    } else {
      console.log("❌ Not found\n");
    }

    // Calculate expected combined length
    if (weddingPrompt && goldenHarmonyPrompt) {
      const combined = weddingPrompt.content.length + goldenHarmonyPrompt.content.length;
      console.log(`📊 Expected combined length: ${weddingPrompt.content.length} + ${goldenHarmonyPrompt.content.length} = ${combined} characters`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPromptLengths();