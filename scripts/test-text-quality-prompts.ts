import { prisma } from '../lib/prisma';
import { getDefaultPrompts } from '../lib/system-prompts';

async function testTextQualityPrompts() {
  try {
    console.log('🧪 Testing enhanced text quality prompts...\n');

    // Test 1: Check default prompts
    console.log('📋 Test 1: Checking default prompts in code...');
    const defaultPrompts = getDefaultPrompts();
    
    const eventTypes = ['BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE', 'BREAKDANCING', 'POTTERY'];
    let defaultPromptsValid = true;
    
    for (const eventType of eventTypes) {
      const prompt = defaultPrompts[eventType];
      if (prompt) {
        const hasTextQualityControl = prompt.includes('no gibberish text') && 
                                    prompt.includes('no fake letters') && 
                                    prompt.includes('no strange characters') &&
                                    prompt.includes('only real readable words');
        
        console.log(`  ${eventType}: ${hasTextQualityControl ? '✅' : '❌'} Text quality control present`);
        if (!hasTextQualityControl) {
          defaultPromptsValid = false;
        }
      }
    }

    // Test 2: Check database prompts (latest versions only)
    console.log('\n📋 Test 2: Checking database prompts (latest versions)...');
    const dbPrompts = await prisma.systemPrompt.findMany({
      where: {
        isActive: true,
        category: 'event_type'
      },
      orderBy: { version: 'desc' }
    });

    // Get only the latest version for each subcategory
    const seenSubcategories = new Set<string>();
    const latestDbPrompts = dbPrompts.filter(prompt => {
      const subcategory = prompt.subcategory || '';
      if (seenSubcategories.has(subcategory)) {
        return false;
      }
      seenSubcategories.add(subcategory);
      return true;
    });

    // Only check the event types we've updated (v2 versions)
    const updatedEventTypes = ['BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'HOLIDAY_CELEBRATION', 'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE', 'BREAKDANCING', 'POTTERY', 'OTHER'];
    
    let dbPromptsValid = true;
    for (const prompt of latestDbPrompts) {
      const isUpdatedEventType = updatedEventTypes.includes(prompt.subcategory || '');
      const hasTextQualityControl = prompt.content.includes('no gibberish text') && 
                                  prompt.content.includes('no fake letters') && 
                                  prompt.content.includes('no strange characters') &&
                                  prompt.content.includes('only real readable words');
      
      if (isUpdatedEventType) {
        console.log(`  ${prompt.name} (v${prompt.version}): ${hasTextQualityControl ? '✅' : '❌'} Text quality control present`);
        if (!hasTextQualityControl) {
          dbPromptsValid = false;
        }
      } else {
        console.log(`  ${prompt.name} (v${prompt.version}): ⏭️  Skipped (not updated yet)`);
      }
    }

    // Test 3: Check text generation prompts (latest versions only)
    console.log('\n📋 Test 3: Checking text generation prompts (latest versions)...');
    const textPrompts = await prisma.systemPrompt.findMany({
      where: {
        isActive: true,
        category: 'text_generation'
      },
      orderBy: { version: 'desc' }
    });

    // Get only the latest version for each subcategory
    const seenTextSubcategories = new Set<string>();
    const latestTextPrompts = textPrompts.filter(prompt => {
      const subcategory = prompt.subcategory || '';
      if (seenTextSubcategories.has(subcategory)) {
        return false;
      }
      seenTextSubcategories.add(subcategory);
      return true;
    });

    let textPromptsValid = true;
    for (const prompt of latestTextPrompts) {
      const hasTextQualityControl = prompt.content.includes('no gibberish') && 
                                  prompt.content.includes('no fake letters') && 
                                  prompt.content.includes('no strange characters') &&
                                  prompt.content.includes('real, readable English words');
      
      console.log(`  ${prompt.name} (v${prompt.version}): ${hasTextQualityControl ? '✅' : '❌'} Text quality control present`);
      if (!hasTextQualityControl) {
        textPromptsValid = false;
      }
    }

    // Test 4: Check style preset prompts (latest versions only)
    console.log('\n📋 Test 4: Checking style preset prompts (latest versions)...');
    const stylePrompts = await prisma.systemPrompt.findMany({
      where: {
        isActive: true,
        category: 'style_preset'
      },
      orderBy: { version: 'desc' }
    });

    // Get only the latest version for each subcategory
    const seenStyleSubcategories = new Set<string>();
    const latestStylePrompts = stylePrompts.filter(prompt => {
      const subcategory = prompt.subcategory || '';
      if (seenStyleSubcategories.has(subcategory)) {
        return false;
      }
      seenStyleSubcategories.add(subcategory);
      return true;
    });

    let stylePromptsValid = true;
    for (const prompt of latestStylePrompts) {
      const hasTextQualityControl = prompt.content.includes('no gibberish text') && 
                                  prompt.content.includes('no fake letters') && 
                                  prompt.content.includes('no strange characters') &&
                                  prompt.content.includes('only real readable words');
      
      console.log(`  ${prompt.name} (v${prompt.version}): ${hasTextQualityControl ? '✅' : '❌'} Text quality control present`);
      if (!hasTextQualityControl) {
        stylePromptsValid = false;
      }
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`  Default Prompts: ${defaultPromptsValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Database Event Prompts: ${dbPromptsValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Text Generation Prompts: ${textPromptsValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Style Preset Prompts: ${stylePromptsValid ? '✅ PASS' : '❌ FAIL'}`);

    const allTestsPassed = defaultPromptsValid && dbPromptsValid && textPromptsValid && stylePromptsValid;
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! Text quality controls are properly implemented.');
      console.log('✅ Enhanced prompts should now prevent gibberish text and ensure real words appear on generated flyers.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }

  } catch (error) {
    console.error('❌ Error testing text quality prompts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTextQualityPrompts(); 