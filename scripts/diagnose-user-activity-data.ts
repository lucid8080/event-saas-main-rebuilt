#!/usr/bin/env tsx

/**
 * Diagnose User Activity Data Issue
 * This script checks the database for actual user activity data
 * and tests the chart statistics functions
 */

import { prisma } from '@/lib/db';
import { getDailyStats, getChartStats } from '@/lib/statistics';

async function diagnoseUserActivityData() {
  console.log('🔍 Diagnosing User Activity Data...\n');

  try {
    // Check basic database connectivity
    console.log('✅ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Check user count
    console.log('📊 Checking database tables:');
    const userCount = await prisma.user.count();
    console.log(`👥 Total Users: ${userCount}`);

    const generatedImageCount = await prisma.generatedImage.count();
    console.log(`🖼️  Total Generated Images: ${generatedImageCount}`);

    const userActivityCount = await prisma.userActivity.count();
    console.log(`📈 Total User Activities: ${userActivityCount}`);

    const imageStatsCount = await prisma.imageGenerationStats.count();
    console.log(`📊 Total Image Generation Stats: ${imageStatsCount}\n`);

    // Check recent activity
    console.log('🕐 Checking recent activity (last 7 days):');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });
    console.log(`👥 New Users (last 7 days): ${recentUsers}`);

    const recentImages = await prisma.generatedImage.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });
    console.log(`🖼️  Images Generated (last 7 days): ${recentImages}`);

    const recentActivity = await prisma.userActivity.count({
      where: {
        timestamp: { gte: sevenDaysAgo }
      }
    });
    console.log(`📈 User Activities (last 7 days): ${recentActivity}\n`);

    // Test the statistics functions
    console.log('🧪 Testing statistics functions:');
    console.log('📊 Getting daily stats (last 30 days)...');
    const dailyStats = await getDailyStats(30);
    
    console.log(`📈 Daily Stats Results: ${dailyStats.length} days of data`);
    if (dailyStats.length > 0) {
      console.log('📅 Sample data (last 3 days):');
      dailyStats.slice(-3).forEach((day, index) => {
        console.log(`  Day ${index + 1}: ${day.date}`);
        console.log(`    New Users: ${day.newUsers}`);
        console.log(`    Images Generated: ${day.imagesGenerated}`);
        console.log(`    Active Users: ${day.activeUsers}`);
        console.log(`    Revenue: ${day.revenue}`);
      });
    } else {
      console.log('❌ No daily stats data found');
    }

    console.log('\n🔬 Testing full chart stats...');
    const chartStats = await getChartStats();
    
    console.log('📊 Chart Stats Results:');
    console.log(`  User Activity: ${chartStats.userActivity.length} days`);
    console.log(`  Device Distribution: ${chartStats.deviceDistribution.length} devices`);
    console.log(`  Event Type Distribution: ${chartStats.eventTypeDistribution.length} event types`);
    console.log(`  Style Preferences: ${chartStats.stylePreferences.length} styles`);
    console.log(`  Performance Metrics: ${chartStats.performanceMetrics.length} metrics`);

    // Check if we have any actual data to display
    const hasUserActivityData = chartStats.userActivity.some(day => 
      day.newUsers > 0 || day.imagesGenerated > 0 || day.activeUsers > 0
    );

    console.log('\n🎯 DIAGNOSIS RESULTS:');
    if (hasUserActivityData) {
      console.log('✅ User Activity data exists and should display in charts');
      console.log('🔍 If charts are not showing, the issue is in the frontend component or API authentication');
    } else {
      console.log('❌ No meaningful user activity data found');
      console.log('💡 Recommendations:');
      console.log('   1. Create some test users');
      console.log('   2. Generate some test images');
      console.log('   3. Record some user activities');
      console.log('   4. Charts will then populate with real data');
    }

    // Show raw chart data for debugging
    console.log('\n🔍 Raw Chart Data (for debugging):');
    console.log('User Activity Data:');
    console.log(JSON.stringify(chartStats.userActivity.slice(-5), null, 2));

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
diagnoseUserActivityData().catch(console.error);