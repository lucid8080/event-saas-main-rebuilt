#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔍 Checking Prompt Truncation Details...\n');

async function checkPromptTruncation() {
  try {
    // Get all style preset prompts
    const prompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      orderBy: { subcategory: 'asc' }
    });

    console.log(`Found ${prompts.length} style preset prompts:\n`);

    prompts.forEach((prompt, index) => {
      const fullContent = prompt.content;
      const truncatedContent = fullContent.split(',')[0]; // Take first part before first comma
      
      console.log(`${index + 1}. ${prompt.name} (${prompt.subcategory})`);
      console.log(`   Full Length: ${fullContent.length} characters`);
      console.log(`   Truncated Length: ${truncatedContent.length} characters`);
      console.log(`   Characters Saved: ${fullContent.length - truncatedContent.length}`);
      console.log(`   Full Content: ${fullContent}`);
      console.log(`   Truncated Content: ${truncatedContent}`);
      console.log('');
    });

    // Summary
    const totalFullLength = prompts.reduce((sum, prompt) => sum + prompt.content.length, 0);
    const totalTruncatedLength = prompts.reduce((sum, prompt) => sum + prompt.content.split(',')[0].length, 0);
    const totalSaved = totalFullLength - totalTruncatedLength;

    console.log('📊 Summary:');
    console.log(`   Total Full Length: ${totalFullLength} characters`);
    console.log(`   Total Truncated Length: ${totalTruncatedLength} characters`);
    console.log(`   Total Characters Saved: ${totalSaved} characters`);
    console.log(`   Average Full Length: ${Math.round(totalFullLength / prompts.length)} characters`);
    console.log(`   Average Truncated Length: ${Math.round(totalTruncatedLength / prompts.length)} characters`);

  } catch (error) {
    console.error('❌ Error checking prompt truncation:', error);
  }
}

checkPromptTruncation()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Prompt truncation check complete');
    process.exit(0);
  }); 