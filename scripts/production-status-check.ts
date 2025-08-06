#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function checkProductionStatus() {
  console.log("🔍 Production Status Check");
  console.log("=========================\n");

  // Check feature flags
  console.log("1. Feature Flags Status:");
  const featureFlags = {
    charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS === 'true',
    animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS === 'true',
    cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true',
    imageProcessing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING === 'true',
    performanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERF_MONITORING === 'true',
  };

  Object.entries(featureFlags).forEach(([feature, enabled]) => {
    const status = enabled ? '✅ Enabled' : '❌ Disabled';
    const critical = ['charts', 'cloudServices'].includes(feature);
    const indicator = critical ? '🚨' : '⚠️';
    console.log(`   ${indicator} ${feature}: ${status}`);
  });
  console.log("");

  // Check critical environment variables
  console.log("2. Critical Environment Variables:");
  const criticalEnvVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXTAUTH_URL',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_ENDPOINT',
  ];

  criticalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: Set`);
    } else {
      console.log(`   ❌ ${envVar}: Missing`);
    }
  });
  console.log("");

  // Check database and users
  try {
    console.log("3. Database & User Status:");
    await prisma.$connect();
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`   📊 Total Users: ${users.length}`);
    
    const adminUsers = users.filter(u => u.role === 'ADMIN' || u.role === 'HERO');
    console.log(`   👑 Admin Users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.role})`);
      });
    } else {
      console.log("      ❌ No admin users found!");
    }

    const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);
    console.log(`   💰 Total Credits: ${totalCredits}`);
    
    console.log("   ✅ Database connection working");
  } catch (error) {
    console.log(`   ❌ Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
  console.log("");

  // Summary and recommendations
  console.log("4. Summary & Recommendations:");
  
  const criticalFeaturesDisabled = !featureFlags.charts || !featureFlags.cloudServices;
  const criticalEnvVarsMissing = criticalEnvVars.some(envVar => !process.env[envVar]);
  
  if (criticalFeaturesDisabled) {
    console.log("   🚨 CRITICAL ISSUES:");
    if (!featureFlags.cloudServices) {
      console.log("      - Cloud services disabled (R2 storage not working)");
    }
    if (!featureFlags.charts) {
      console.log("      - Charts disabled (admin dashboard limited)");
    }
    console.log("");
    console.log("   🔧 IMMEDIATE ACTIONS:");
    console.log("      1. Set NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true");
    console.log("      2. Set NEXT_PUBLIC_ENABLE_CHARTS=true");
    console.log("      3. Verify R2 environment variables are set");
  }
  
  if (criticalEnvVarsMissing) {
    console.log("   🚨 MISSING ENVIRONMENT VARIABLES:");
    console.log("      - Set all required environment variables in production");
  }
  
  if (!criticalFeaturesDisabled && !criticalEnvVarsMissing) {
    console.log("   ✅ All critical features and environment variables are configured");
  }
  
  console.log("");
  console.log("5. Next Steps:");
  console.log("   - Deploy with environment variables set");
  console.log("   - Test admin login and credit management");
  console.log("   - Verify image generation and storage");
  console.log("   - Check admin dashboard functionality");
}

// Run the status check
checkProductionStatus().catch(console.error); 