#!/usr/bin/env tsx

/**
 * Deployment Monitor Script
 * 
 * This script monitors the production deployment to see when the enhanced
 * error logging is deployed and then tests the API to get detailed error info.
 */

const MONITOR_PRODUCTION_URL = 'https://event-saas-main-rebuilt.onrender.com';

async function checkDeploymentStatus(): Promise<boolean> {
  try {
    console.log('🔍 Checking if enhanced error logging is deployed...');
    
    const response = await fetch(`${MONITOR_PRODUCTION_URL}/api/admin/users/test-deployment-check`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credits: 10 })
    });

    const contentType = response.headers.get('content-type');
    
    if (response.status === 500 && contentType && contentType.includes('application/json')) {
      // Enhanced error logging is deployed!
      try {
        const errorData = await response.json();
        console.log('✅ ENHANCED ERROR LOGGING IS DEPLOYED!');
        console.log('🎯 DETAILED ERROR INFORMATION:');
        console.log('=====================================');
        console.log(JSON.stringify(errorData, null, 2));
        
        if (errorData.message) {
          console.log(`\n🔍 Root Cause: ${errorData.message}`);
        }
        
        return true;
      } catch (parseError) {
        console.log('⚠️ Enhanced logging deployed but JSON parse failed');
        return false;
      }
    } else if (response.status === 500) {
      // Still old error format
      const textResponse = await response.text();
      if (textResponse === 'Internal server error') {
        console.log('⏳ Still old error format - deployment not complete yet');
        return false;
      }
    }
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Content-Type: ${contentType}`);
    return false;
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function monitorDeployment() {
  console.log('🚀 MONITORING PRODUCTION DEPLOYMENT');
  console.log('===================================');
  console.log(`🎯 Target: ${MONITOR_PRODUCTION_URL}`);
  console.log('📅 Started:', new Date().toISOString());
  console.log('\n⏳ Waiting for Render to deploy enhanced error logging...');
  console.log('💡 This typically takes 2-5 minutes for Render deployments.\n');
  
  let attempts = 0;
  const maxAttempts = 20; // 10 minutes max
  const delayMs = 30000; // 30 seconds between checks
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔄 Check ${attempts}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    
    const isDeployed = await checkDeploymentStatus();
    
    if (isDeployed) {
      console.log('\n🎉 SUCCESS! Enhanced error logging is deployed and working!');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Review the detailed error information above');
      console.log('2. Identify the root cause of the 500 error');
      console.log('3. Implement the specific fix based on the error details');
      console.log('4. Deploy the fix and test again');
      break;
    }
    
    if (attempts < maxAttempts) {
      console.log(`⏳ Not deployed yet. Waiting ${delayMs / 1000} seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⚠️ TIMEOUT: Deployment monitoring reached maximum attempts');
    console.log('\n🔧 MANUAL STEPS:');
    console.log('1. Check your Render dashboard for deployment status');
    console.log('2. Look for any build errors in the Render logs');
    console.log('3. If deployment is complete, run: npx tsx scripts/deploy-production-fix.ts');
    console.log('4. If deployment failed, check the build logs and fix any issues');
  }
}

if (require.main === module) {
  monitorDeployment().catch(console.error);
}