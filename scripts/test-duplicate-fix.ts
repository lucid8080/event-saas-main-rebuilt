#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔍 Testing System Prompts Duplicate Fix...\n');

async function testDuplicateFix() {
  try {
    // Test 1: Check all system prompts to see if there are duplicates
    console.log('📝 Test 1: Checking for duplicate entries...');
    
    const allPrompts = await prisma.systemPrompt.findMany({
      where: { category: 'style_preset' },
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' },
        { version: 'desc' }
      ]
    });

    console.log(`Found ${allPrompts.length} total style preset prompts`);

    // Group by category-subcategory to identify duplicates
    const groupedPrompts = allPrompts.reduce((acc, prompt) => {
      const key = `${prompt.category}-${prompt.subcategory || 'null'}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(prompt);
      return acc;
    }, {} as Record<string, any[]>);

    // Check for duplicates
    const duplicates = Object.entries(groupedPrompts).filter(([key, prompts]) => prompts.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} prompt groups with multiple versions:`);
      duplicates.forEach(([key, prompts]) => {
        console.log(`\n   ${key}:`);
        prompts.forEach(prompt => {
          console.log(`     - Version ${prompt.version}: ${prompt.name} (${prompt.isActive ? 'Active' : 'Inactive'})`);
        });
      });
    } else {
      console.log('✅ No duplicate entries found!');
    }

    // Test 2: Simulate the API fix logic
    console.log('\n📝 Test 2: Testing API fix logic...');
    
    // Apply the same filtering logic as the API route
    const latestPrompts = allPrompts.reduce((acc, prompt) => {
      const key = `${prompt.category}-${prompt.subcategory || 'null'}`;
      if (!acc[key] || acc[key].version < prompt.version) {
        acc[key] = prompt;
      }
      return acc;
    }, {} as Record<string, any>);

    const filteredPrompts = Object.values(latestPrompts);
    
    console.log(`After filtering: ${filteredPrompts.length} unique prompts`);
    
    // Check if filtering worked
    if (filteredPrompts.length < allPrompts.length) {
      console.log(`✅ Filtering successful! Removed ${allPrompts.length - filteredPrompts.length} duplicate entries`);
    } else {
      console.log('ℹ️  No duplicates to filter out');
    }

    // Test 3: Check active prompts only
    console.log('\n📝 Test 3: Checking active prompts only...');
    
    const activePrompts = await prisma.systemPrompt.findMany({
      where: { 
        category: 'style_preset',
        isActive: true 
      },
      orderBy: [
        { category: 'asc' },
        { subcategory: 'asc' },
        { version: 'desc' }
      ]
    });

    // Apply filtering to active prompts
    const latestActivePrompts = activePrompts.reduce((acc, prompt) => {
      const key = `${prompt.category}-${prompt.subcategory || 'null'}`;
      if (!acc[key] || acc[key].version < prompt.version) {
        acc[key] = prompt;
      }
      return acc;
    }, {} as Record<string, any>);

    const filteredActivePrompts = Object.values(latestActivePrompts);
    
    console.log(`Active prompts: ${activePrompts.length} total, ${filteredActivePrompts.length} unique`);
    
    if (filteredActivePrompts.length < activePrompts.length) {
      console.log(`✅ Active filtering successful! Removed ${activePrompts.length - filteredActivePrompts.length} duplicate active entries`);
    }

    // Test 4: Show sample of filtered results
    console.log('\n📝 Test 4: Sample of filtered results...');
    filteredActivePrompts.slice(0, 5).forEach((prompt, index) => {
      console.log(`\n${index + 1}. ${prompt.name}`);
      console.log(`   Subcategory: ${prompt.subcategory || 'N/A'}`);
      console.log(`   Version: ${prompt.version}`);
      console.log(`   Active: ${prompt.isActive ? '✅' : '❌'}`);
      console.log(`   Content: ${prompt.content.substring(0, 80)}...`);
    });

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total style preset prompts: ${allPrompts.length}`);
    console.log(`   Unique prompts after filtering: ${filteredPrompts.length}`);
    console.log(`   Active prompts: ${activePrompts.length}`);
    console.log(`   Unique active prompts: ${filteredActivePrompts.length}`);
    
    if (duplicates.length > 0) {
      console.log(`   Duplicate groups found: ${duplicates.length}`);
      console.log('   ⚠️  The API fix should resolve these duplicates');
    } else {
      console.log('   ✅ No duplicates found - system is clean');
    }

  } catch (error) {
    console.error('❌ Error testing duplicate fix:', error);
  }
}

testDuplicateFix()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Duplicate fix test complete');
    process.exit(0);
  }); 