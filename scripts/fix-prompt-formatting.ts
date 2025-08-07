#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔧 Fixing prompt formatting after cleanup...\n');

async function fixPromptFormatting() {
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
      
      // Fix formatting issues
      cleanedContent = cleanedContent
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/,\s*,/g, ',') // Remove double commas again (in case of multiple)
        .replace(/^\s*,\s*/, '') // Remove leading comma
        .replace(/,\s*$/, '') // Remove trailing comma
        .replace(/,\s*,\s*/g, ', ') // Fix multiple commas with spaces
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/,\s*$/g, '') // Remove trailing comma again
        .trim();
      
      const charactersSaved = originalContent.length - cleanedContent.length;
      
      if (charactersSaved > 0 || cleanedContent !== originalContent) {
        console.log(`   ✅ Fixed content: ${cleanedContent.length} characters`);
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
        console.log(`   ℹ️  No formatting issues found`);
      }
      
      console.log('');
    }

    // Summary
    console.log('📊 Formatting Fix Summary:');
    console.log(`   Total prompts processed: ${prompts.length}`);
    console.log(`   Prompts updated: ${totalUpdated}`);
    console.log(`   Total characters saved: ${totalCharactersSaved}`);

    // Show some examples of cleaned prompts
    console.log('\n📝 Examples of final cleaned prompts:');
    const samplePrompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      take: 5,
      orderBy: { subcategory: 'asc' }
    });

    samplePrompts.forEach((prompt, index) => {
      console.log(`\n${index + 1}. ${prompt.name} (${prompt.subcategory})`);
      console.log(`   Length: ${prompt.content.length} characters`);
      console.log(`   Content: ${prompt.content}`);
    });

    console.log('\n✅ Prompt formatting fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing prompt formatting:', error);
  }
}

fixPromptFormatting()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Formatting fix complete');
    process.exit(0);
  }); 