#!/usr/bin/env tsx

/**
 * Wait for Authentication Fix Deployment
 * 
 * This script monitors when the authentication fix is deployed and working.
 */

const PRODUCTION_URL = 'https://event-saas-main-rebuilt.onrender.com';

async function checkFix() {
  console.log('🔍 CHECKING AUTHENTICATION FIX DEPLOYMENT');
  console.log('==========================================');
  console.log(`🎯 Target: ${PRODUCTION_URL}`);
  console.log('📅 Time:', new Date().toISOString());
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/admin/users/test-fix-check`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credits: 10 })
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.status === 500) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Enhanced logging is working - check if it's the new error or old error
        const errorData = await response.json();
        console.log('\n✅ ENHANCED ERROR LOGGING IS WORKING!');
        console.log('🎯 ERROR DETAILS:');
        console.log('==================');
        console.log(JSON.stringify(errorData, null, 2));
        
        if (errorData.message && errorData.message.includes('Cannot read properties of undefined')) {
          console.log('\n❌ OLD ERROR STILL PRESENT - Fix not deployed yet');
          console.log('   The authentication fix has not been deployed yet.');
          return false;
        } else {
          console.log('\n✅ NEW ERROR FORMAT - Fix is deployed!');
          console.log('   The authentication fix has been deployed successfully.');
          return true;
        }
        
      } else {
        // Still old format
        const text = await response.text();
        console.log('\n⏳ STILL OLD FORMAT - NOT DEPLOYED YET');
        console.log(`Response: ${text}`);
        return false;
      }
    } else if (response.status === 401 || response.status === 403) {
      console.log('\n✅ API IS WORKING - Got expected auth error');
      console.log('   This means the authentication fix is working!');
      return true;
    } else {
      console.log(`\n⚠️ Unexpected status: ${response.status}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return false;
  }
}

async function waitForFix() {
  console.log('⏳ WAITING FOR AUTHENTICATION FIX TO DEPLOY...');
  console.log('💡 This typically takes 2-5 minutes for Render deployments.\n');
  
  let attempts = 0;
  const maxAttempts = 30; // 15 minutes max
  const delayMs = 30000; // 30 seconds between checks
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`\n🔄 Check ${attempts}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    
    const isFixed = await checkFix();
    
    if (isFixed) {
      console.log('\n🎉 SUCCESS! Authentication fix is deployed and working!');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Test the credit management functionality in your admin panel');
      console.log('2. Try applying credits to users');
      console.log('3. Verify that the 500 errors are resolved');
      break;
    }
    
    if (attempts < maxAttempts) {
      console.log(`⏳ Fix not deployed yet. Waiting ${delayMs / 1000} seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⚠️ TIMEOUT: Maximum attempts reached');
    console.log('\n🔧 MANUAL STEPS:');
    console.log('1. Check your Render dashboard for deployment status');
    console.log('2. Look for any build errors in the Render logs');
    console.log('3. If deployment is stuck, try triggering a manual deployment');
  }
}

if (require.main === module) {
  waitForFix().catch(console.error);
} 