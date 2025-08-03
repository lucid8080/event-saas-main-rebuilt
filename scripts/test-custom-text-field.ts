#!/usr/bin/env tsx

import { getEventTypeConfig } from '../lib/event-questions';
import { generateEnhancedPrompt } from '../lib/prompt-generator';

console.log('🧪 Testing Custom Text Field Implementation\n');

// Test 1: Check if custom text field exists in all event types
console.log('📋 Test 1: Verifying custom text field in all event types...');

const eventTypes = [
  'BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'HOLIDAY_CELEBRATION',
  'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE', 'FAMILY_GATHERING', 'BBQ',
  'PARK_GATHERING', 'COMMUNITY_EVENT', 'FUNDRAISER', 'WORKSHOP', 'MEETUP',
  'CELEBRATION', 'REUNION', 'POTLUCK', 'GAME_NIGHT', 'BOOK_CLUB', 'ART_CLASS',
  'FITNESS_CLASS', 'BREAKDANCING', 'POTTERY'
];

let allEventTypesHaveCustomText = true;

eventTypes.forEach(eventType => {
  const config = getEventTypeConfig(eventType);
  if (!config) {
    console.log(`❌ Event type ${eventType} not found`);
    allEventTypesHaveCustomText = false;
    return;
  }

  const hasCustomText = config.questions.some(q => q.id === 'customText');
  if (!hasCustomText) {
    console.log(`❌ ${eventType} missing custom text field`);
    allEventTypesHaveCustomText = false;
  } else {
    console.log(`✅ ${eventType} has custom text field`);
  }
});

console.log(`\n${allEventTypesHaveCustomText ? '✅' : '❌'} All event types have custom text field: ${allEventTypesHaveCustomText}\n`);

// Test 2: Test prompt generation with custom text
console.log('📝 Test 2: Testing prompt generation with custom text...');

const testCases = [
  {
    eventType: 'BIRTHDAY_PARTY',
    eventDetails: {
      age: 25,
      theme: 'superhero',
      customText: 'Join us for a celebration!'
    },
    expected: 'with text: "Join us for a celebration!"'
  },
  {
    eventType: 'WEDDING',
    eventDetails: {
      style: 'Modern',
      colors: 'white and gold',
      customText: 'RSVP by December 1st'
    },
    expected: 'with text: "RSVP by December 1st"'
  },
  {
    eventType: 'CORPORATE_EVENT',
    eventDetails: {
      eventType: 'Conference',
      industry: 'technology',
      customText: 'Register now for early bird pricing'
    },
    expected: 'with text: "Register now for early bird pricing"'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n🧪 Test Case ${index + 1}: ${testCase.eventType}`);
  
  const prompt = generateEnhancedPrompt(
    'professional event flyer design',
    testCase.eventType,
    testCase.eventDetails
  );
  
  console.log(`📝 Generated prompt: ${prompt}`);
  
  const hasCustomText = prompt.includes(testCase.expected);
  console.log(`${hasCustomText ? '✅' : '❌'} Custom text included: ${hasCustomText}`);
  
  if (!hasCustomText) {
    console.log(`Expected: ${testCase.expected}`);
  }
});

// Test 3: Test prompt generation without custom text
console.log('\n📝 Test 3: Testing prompt generation without custom text...');

const testCaseWithoutText = {
  eventType: 'BIRTHDAY_PARTY',
  eventDetails: {
    age: 30,
    theme: 'princess'
    // No customText field
  }
};

const promptWithoutText = generateEnhancedPrompt(
  'professional event flyer design',
  testCaseWithoutText.eventType,
  testCaseWithoutText.eventDetails
);

console.log(`📝 Generated prompt: ${promptWithoutText}`);

const hasNoCustomText = !promptWithoutText.includes('with text:');
console.log(`${hasNoCustomText ? '✅' : '❌'} No custom text when not provided: ${hasNoCustomText}`);

// Test 4: Test empty custom text
console.log('\n📝 Test 4: Testing prompt generation with empty custom text...');

const testCaseEmptyText = {
  eventType: 'WEDDING',
  eventDetails: {
    style: 'Traditional',
    customText: '' // Empty string
  }
};

const promptEmptyText = generateEnhancedPrompt(
  'professional event flyer design',
  testCaseEmptyText.eventType,
  testCaseEmptyText.eventDetails
);

console.log(`📝 Generated prompt: ${promptEmptyText}`);

const hasNoEmptyText = !promptEmptyText.includes('with text:');
console.log(`${hasNoEmptyText ? '✅' : '❌'} No custom text when empty: ${hasNoEmptyText}`);

console.log('\n🎉 Custom Text Field Testing Complete!'); 