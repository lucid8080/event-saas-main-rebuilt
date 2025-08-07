#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔍 Debugging Database Prompt Content...\n');

async function debugPromptContent() {
  try {
    // Get all style preset prompts
    const prompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      orderBy: { subcategory: 'asc' }
    });

    console.log(`Found ${prompts.length} style preset prompts:\n`);

    prompts.forEach((prompt, index) => {
      console.log(`${index + 1}. ${prompt.name} (${prompt.subcategory})`);
      console.log(`   Content: ${prompt.content}`);
      console.log(`   Length: ${prompt.content.length} characters`);
      console.log('');
    });

    // Test a specific prompt combination
    console.log('🧪 Testing Prompt Combination...\n');
    
    const testEventType = 'BIRTHDAY_PARTY';
    const testStyleName = 'Pop Art';
    const testEventDetails = {
      age: '25',
      theme: 'space',
      venue: 'community center'
    };

    console.log(`Event Type: ${testEventType}`);
    console.log(`Style Name: ${testStyleName}`);
    console.log(`Event Details:`, testEventDetails);
    console.log('');

    // Find the Pop Art prompt
    const popArtPrompt = prompts.find(p => p.subcategory === 'Pop Art');
    if (popArtPrompt) {
      console.log('📝 Pop Art Database Prompt:');
      console.log(popArtPrompt.content);
      console.log('');
      
      // Simulate what the final prompt would look like
      const eventContext = `${testEventType} flyer theme, ${testEventDetails.age}th birthday celebration, ${testEventDetails.theme} theme, at ${testEventDetails.venue}`;
      const styleContext = popArtPrompt.content;
      const basePrompt = "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design";
      
      const finalPrompt = `${eventContext}, ${styleContext}, ${basePrompt}`;
      
      console.log('🎯 Simulated Final Prompt:');
      console.log(finalPrompt);
      console.log('');
      console.log(`Total Length: ${finalPrompt.length} characters`);
    }

  } catch (error) {
    console.error('❌ Error debugging prompt content:', error);
  }
}

debugPromptContent()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  }); 