#!/usr/bin/env tsx

/**
 * Test Charts API with Authentication Context
 * This script simulates the frontend API call to test what data is being returned
 */

import { getChartStats } from '@/lib/statistics';

async function testChartsApiAuthenticated() {
  console.log('🔍 Testing Charts API (simulating authenticated call)...\n');

  try {
    // Simulate what the API endpoint does
    console.log('📊 Fetching chart statistics...');
    const stats = await getChartStats();
    
    console.log('✅ Chart stats fetched successfully');
    console.log('📈 Results:');
    console.log(`  User Activity: ${stats.userActivity.length} days`);
    console.log(`  Device Distribution: ${stats.deviceDistribution.length} devices`);
    console.log(`  Event Type Distribution: ${stats.eventTypeDistribution.length} event types`);
    console.log(`  Style Preferences: ${stats.stylePreferences.length} styles`);
    console.log(`  Performance Metrics: ${stats.performanceMetrics.length} metrics\n`);

    // Check if we have meaningful data
    const hasUserActivityData = stats.userActivity.some(day => 
      day.newUsers > 0 || day.imagesGenerated > 0 || day.activeUsers > 0
    );

    console.log('🎯 Data Analysis:');
    if (hasUserActivityData) {
      console.log('✅ User Activity data exists');
      
      // Show sample of recent data
      console.log('\n📅 Recent User Activity (last 7 days):');
      const recentData = stats.userActivity.slice(-7);
      recentData.forEach(day => {
        if (day.newUsers > 0 || day.imagesGenerated > 0) {
          console.log(`  ${day.date}: ${day.newUsers} new users, ${day.imagesGenerated} images generated`);
        }
      });
      
      // Calculate totals
      const totals = stats.userActivity.reduce((acc, day) => ({
        newUsers: acc.newUsers + day.newUsers,
        imagesGenerated: acc.imagesGenerated + day.imagesGenerated,
        activeUsers: acc.activeUsers + day.activeUsers
      }), { newUsers: 0, imagesGenerated: 0, activeUsers: 0 });
      
      console.log('\n📊 30-Day Totals:');
      console.log(`  Total New Users: ${totals.newUsers}`);
      console.log(`  Total Images Generated: ${totals.imagesGenerated}`);
      console.log(`  Total Active Users: ${totals.activeUsers}`);
      
    } else {
      console.log('❌ No meaningful user activity data found');
    }

    console.log('\n🔍 Event Type Distribution:');
    if (stats.eventTypeDistribution.length > 0) {
      stats.eventTypeDistribution.forEach(event => {
        console.log(`  ${event.eventType}: ${event.count} images`);
      });
    } else {
      console.log('  No event type data');
    }

    console.log('\n📋 Full API Response Structure:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ Error testing charts API:', error);
  }
}

// Run the test
testChartsApiAuthenticated().catch(console.error);