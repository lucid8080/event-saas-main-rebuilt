#!/usr/bin/env tsx

import 'dotenv/config';
import { generateEnhancedPromptWithSystemPrompts } from '../lib/prompt-generator';

console.log('🧪 Testing Prompt Balance Fix...\n');

async function testPromptBalance() {
  try {
    const testCases = [
      {
        eventType: 'BIRTHDAY_PARTY',
        styleName: 'Pop Art',
        eventDetails: {
          age: '25',
          theme: 'space',
          venue: 'community center'
        }
      },
      {
        eventType: 'WEDDING',
        styleName: 'Golden Harmony',
        eventDetails: {
          style: 'modern',
          colors: 'white and gold',
          venue: 'garden'
        }
      },
      {
        eventType: 'CORPORATE_EVENT',
        styleName: 'Cyberpunk',
        eventDetails: {
          eventType: 'conference',
          industry: 'technology',
          venue: 'convention center'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`📝 Test Case: ${testCase.eventType} + ${testCase.styleName}`);
      console.log(`Event Details:`, testCase.eventDetails);
      
      const enhancedPrompt = await generateEnhancedPromptWithSystemPrompts(
        "no text unless otherwise specified, no blur, no distortion, high quality, professional event flyer design",
        testCase.eventType,
        testCase.eventDetails,
        testCase.styleName
      );

      console.log(`\n🎯 Generated Prompt:`);
      console.log(enhancedPrompt);
      console.log(`Length: ${enhancedPrompt.length} characters`);
      console.log('\n' + '='.repeat(80) + '\n');
    }

  } catch (error) {
    console.error('❌ Error testing prompt balance:', error);
  }
}

testPromptBalance()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Prompt balance test complete');
    process.exit(0);
  }); 