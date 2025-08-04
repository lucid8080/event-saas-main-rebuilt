#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('📝 Checking System Prompts...\n');

async function checkSystemPrompts() {
  try {
    // Get all system prompts
    const systemPrompts = await prisma.systemPrompt.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${systemPrompts.length} system prompts:`);

    systemPrompts.forEach((prompt, index) => {
      console.log(`\n${index + 1}. ${prompt.name}`);
      console.log(`   Active: ${prompt.isActive ? '✅' : '❌'}`);
      console.log(`   Created: ${prompt.createdAt.toISOString()}`);
      console.log(`   Content: ${prompt.content.substring(0, 100)}...`);
    });

    // Check active prompts by type
    const activePrompts = systemPrompts.filter(p => p.isActive);
    console.log(`\n📊 Active prompts: ${activePrompts.length}`);

    if (systemPrompts.length === 0) {
      console.log('\n⚠️  No system prompts found!');
      console.log('💡 This might be why you lost access to system prompts.');
    }

  } catch (error) {
    console.error('❌ Error checking system prompts:', error);
  }
}

checkSystemPrompts()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ System prompts check complete');
    process.exit(0);
  }); 