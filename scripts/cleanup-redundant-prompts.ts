#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🧹 Cleaning up redundant phrases from system prompts...\n');

// Define redundant phrases to remove
const redundantPhrases = [
  'no text unless otherwise specified',
  'no gibberish text',
  'no fake letters',
  'no strange characters',
  'only real readable words if text is included',
  'no blur',
  'no distortion',
  'high quality',
  'professional',
  'professional design',
  'authentic design',
  'family-friendly design',
  'premium design',
  'modern design',
  'enchanting design'
];

async function cleanupRedundantPrompts() {
  try {
    // Get all system prompts
    const prompts = await prisma.systemPrompt.findMany({
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' }
      ]
    });

    console.log(`Found ${prompts.length} total prompts to process\n`);

    let totalUpdated = 0;
    let totalCharactersSaved = 0;

    for (const prompt of prompts) {
      console.log(`📝 Processing: ${prompt.name} (${prompt.category}/${prompt.subcategory})`);
      console.log(`   Original length: ${prompt.content.length} characters`);
      
      let cleanedContent = prompt.content;
      let originalContent = prompt.content;
      
      // Remove redundant phrases (case insensitive)
      for (const phrase of redundantPhrases) {
        const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        cleanedContent = cleanedContent.replace(regex, '');
      }
      
      // Clean up extra commas and spaces
      cleanedContent = cleanedContent
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/^\s*,\s*/, '') // Remove leading comma
        .replace(/,\s*$/, '') // Remove trailing comma
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      const charactersSaved = originalContent.length - cleanedContent.length;
      
      if (charactersSaved > 0) {
        console.log(`   ✅ Cleaned content: ${cleanedContent.length} characters`);
        console.log(`   📉 Characters saved: ${charactersSaved}`);
        console.log(`   📝 New content: ${cleanedContent}`);
        
        // Update the prompt in the database
        await prisma.systemPrompt.update({
          where: { id: prompt.id },
          data: { content: cleanedContent }
        });
        
        totalUpdated++;
        totalCharactersSaved += charactersSaved;
      } else {
        console.log(`   ℹ️  No changes needed`);
      }
      
      console.log('');
    }

    // Summary
    console.log('📊 Cleanup Summary:');
    console.log(`   Total prompts processed: ${prompts.length}`);
    console.log(`   Prompts updated: ${totalUpdated}`);
    console.log(`   Total characters saved: ${totalCharactersSaved}`);
    console.log(`   Average characters saved per prompt: ${totalUpdated > 0 ? Math.round(totalCharactersSaved / totalUpdated) : 0}`);

    // Show some examples of cleaned prompts
    console.log('\n📝 Examples of cleaned prompts:');
    const samplePrompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      take: 3,
      orderBy: { subcategory: 'asc' }
    });

    samplePrompts.forEach((prompt, index) => {
      console.log(`\n${index + 1}. ${prompt.name} (${prompt.subcategory})`);
      console.log(`   Length: ${prompt.content.length} characters`);
      console.log(`   Content: ${prompt.content}`);
    });

    console.log('\n✅ Redundant phrase cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error cleaning up redundant prompts:', error);
  }
}

cleanupRedundantPrompts()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Redundant cleanup complete');
    process.exit(0);
  }); 