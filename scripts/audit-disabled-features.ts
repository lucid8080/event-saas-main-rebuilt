#!/usr/bin/env tsx

async function auditDisabledFeatures() {
  console.log("🔍 Auditing Disabled Features");
  console.log("=============================\n");

  // Step 1: Check feature flags
  console.log("1. Checking Feature Flags...");
  const featureFlags = {
    charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS === 'true',
    animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS === 'true',
    cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true',
    imageProcessing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING === 'true',
    performanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERF_MONITORING === 'true',
  };

  console.log("   Feature Flag Status:");
  Object.entries(featureFlags).forEach(([feature, enabled]) => {
    const status = enabled ? '✅ Enabled' : '❌ Disabled';
    const envVar = `NEXT_PUBLIC_ENABLE_${feature.toUpperCase()}`;
    const value = process.env[envVar];
    console.log(`   - ${feature}: ${status} (${envVar}=${value || 'undefined'})`);
  });
  console.log("");

  // Step 2: Analyze impact of disabled features
  console.log("2. Analyzing Impact of Disabled Features...");
  
  const featureImpact = {
    charts: {
      description: "Admin dashboard charts and analytics",
      impact: "HIGH",
      affected: ["Admin Dashboard", "Analytics Pages", "Data Visualization"],
      critical: true,
      reason: "Core admin functionality for monitoring system health"
    },
    animations: {
      description: "UI animations and transitions",
      impact: "LOW",
      affected: ["User Experience", "Visual Feedback"],
      critical: false,
      reason: "Enhances user experience but not critical for functionality"
    },
    cloudServices: {
      description: "R2 storage and cloud features",
      impact: "HIGH",
      affected: ["Image Storage", "File Upload", "R2 Integration"],
      critical: true,
      reason: "Core functionality for image storage and management"
    },
    imageProcessing: {
      description: "Advanced image processing features",
      impact: "MEDIUM",
      affected: ["Image Editing", "Watermarking", "Image Optimization"],
      critical: false,
      reason: "Enhances image features but basic functionality still works"
    },
    performanceMonitoring: {
      description: "Development tools and performance monitoring",
      impact: "LOW",
      affected: ["Development Tools", "Performance Tracking"],
      critical: false,
      reason: "Development-only features, not needed in production"
    }
  };

  console.log("   Impact Analysis:");
  Object.entries(featureImpact).forEach(([feature, info]) => {
    const isEnabled = featureFlags[feature as keyof typeof featureFlags];
    const status = isEnabled ? '✅' : '❌';
    console.log(`   ${status} ${feature.toUpperCase()}:`);
    console.log(`     Description: ${info.description}`);
    console.log(`     Impact: ${info.impact}`);
    console.log(`     Critical: ${info.critical ? 'YES' : 'NO'}`);
    console.log(`     Affected: ${info.affected.join(', ')}`);
    console.log(`     Reason: ${info.reason}`);
    console.log("");
  });

  // Step 3: Check environment variables
  console.log("3. Checking Environment Variables...");
  const requiredEnvVars = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'STRIPE_API_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_ENDPOINT',
    'NEXT_PUBLIC_IDEOGRAM_API_KEY',
  ];

  const optionalEnvVars = [
    'NEXT_PUBLIC_ENABLE_CHARTS',
    'NEXT_PUBLIC_ENABLE_ANIMATIONS',
    'NEXT_PUBLIC_ENABLE_CLOUD_SERVICES',
    'NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING',
    'NEXT_PUBLIC_ENABLE_PERF_MONITORING',
  ];

  console.log("   Required Environment Variables:");
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: Set`);
    } else {
      console.log(`   ❌ ${envVar}: Missing`);
    }
  });

  console.log("\n   Optional Feature Flag Variables:");
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`   📝 ${envVar}: ${value}`);
    } else {
      console.log(`   ⚪ ${envVar}: Not set (defaults to disabled)`);
    }
  });
  console.log("");

  // Step 4: Recommendations
  console.log("4. Recommendations...");
  
  const criticalFeatures = Object.entries(featureImpact)
    .filter(([_, info]) => info.critical)
    .map(([feature, _]) => feature);

  const disabledCriticalFeatures = criticalFeatures.filter(
    feature => !featureFlags[feature as keyof typeof featureFlags]
  );

  if (disabledCriticalFeatures.length > 0) {
    console.log("   🚨 CRITICAL FEATURES DISABLED:");
    disabledCriticalFeatures.forEach(feature => {
      const info = featureImpact[feature as keyof typeof featureImpact];
      console.log(`   - ${feature.toUpperCase()}: ${info.description}`);
      console.log(`     Impact: ${info.impact} - ${info.reason}`);
    });
    console.log("");
    console.log("   🔧 RECOMMENDED ACTIONS:");
    console.log("   1. Re-enable critical features immediately");
    console.log("   2. Set required environment variables");
    console.log("   3. Test functionality after re-enabling");
  } else {
    console.log("   ✅ All critical features are enabled");
  }

  // Step 5: Safe re-enablement plan
  console.log("5. Safe Re-enablement Plan...");
  console.log("   Phase 1 - Critical Features:");
  console.log("   - Set NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true");
  console.log("   - Set NEXT_PUBLIC_ENABLE_CHARTS=true");
  console.log("   - Verify R2 environment variables are set");
  console.log("");
  console.log("   Phase 2 - Enhanced Features:");
  console.log("   - Set NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true");
  console.log("   - Set NEXT_PUBLIC_ENABLE_ANIMATIONS=true");
  console.log("   - Monitor for any performance issues");
  console.log("");
  console.log("   Phase 3 - Development Features:");
  console.log("   - Set NEXT_PUBLIC_ENABLE_PERF_MONITORING=true (dev only)");
  console.log("   - Monitor system performance");
  console.log("");

  // Step 6: Summary
  console.log("6. Summary...");
  const totalFeatures = Object.keys(featureFlags).length;
  const enabledFeatures = Object.values(featureFlags).filter(Boolean).length;
  const disabledFeatures = totalFeatures - enabledFeatures;
  const criticalDisabled = disabledCriticalFeatures.length;

  console.log(`   Total Features: ${totalFeatures}`);
  console.log(`   Enabled: ${enabledFeatures}`);
  console.log(`   Disabled: ${disabledFeatures}`);
  console.log(`   Critical Disabled: ${criticalDisabled}`);
  console.log("");
  
  if (criticalDisabled > 0) {
    console.log("   🚨 URGENT: Critical features are disabled!");
    console.log("   This may affect core application functionality.");
  } else {
    console.log("   ✅ All critical features are enabled.");
    console.log("   Optional features can be re-enabled as needed.");
  }
}

// Run the audit
auditDisabledFeatures().catch(console.error); 