#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🧹 Cleaning up duplicate system prompts...\n');

async function cleanupDuplicatePrompts() {
  try {
    // Get all style preset prompts
    const allPrompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      orderBy: [
        { subcategory: 'asc' },
        { version: 'desc' }
      ]
    });

    console.log(`Found ${allPrompts.length} total style preset prompts`);

    // Group by subcategory to identify duplicates
    const groupedPrompts = allPrompts.reduce((acc, prompt) => {
      const key = prompt.subcategory || 'null';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(prompt);
      return acc;
    }, {} as Record<string, any[]>);

    // Find groups with multiple versions
    const duplicateGroups = Object.entries(groupedPrompts).filter(([key, prompts]) => prompts.length > 1);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicate prompts found!');
      return;
    }

    console.log(`Found ${duplicateGroups.length} prompt groups with multiple versions:`);
    
    let totalDeleted = 0;
    
    for (const [subcategory, prompts] of duplicateGroups) {
      console.log(`\n📝 Processing: ${subcategory}`);
      
      // Keep the latest version (highest version number)
      const latestPrompt = prompts[0]; // Already sorted by version desc
      const duplicatesToDelete = prompts.slice(1);
      
      console.log(`   Keeping: Version ${latestPrompt.version} - ${latestPrompt.name}`);
      console.log(`   Deleting: ${duplicatesToDelete.length} duplicate(s)`);
      
      // Delete duplicate prompts
      for (const duplicate of duplicatesToDelete) {
        await prisma.systemPrompt.delete({
          where: { id: duplicate.id }
        });
        console.log(`     ✅ Deleted: Version ${duplicate.version} - ${duplicate.name}`);
        totalDeleted++;
      }
    }

    // Verify cleanup
    const remainingPrompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      orderBy: { subcategory: 'asc' }
    });

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Original prompts: ${allPrompts.length}`);
    console.log(`   Deleted duplicates: ${totalDeleted}`);
    console.log(`   Remaining prompts: ${remainingPrompts.length}`);
    
    // Show remaining prompts
    console.log(`\n📝 Remaining style preset prompts:`);
    remainingPrompts.forEach((prompt, index) => {
      console.log(`   ${index + 1}. ${prompt.name} (${prompt.subcategory}) - Version ${prompt.version}`);
    });

    console.log('\n✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error cleaning up duplicate prompts:', error);
  }
}

cleanupDuplicatePrompts()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Duplicate cleanup complete');
    process.exit(0);
  }); 