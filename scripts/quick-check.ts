#!/usr/bin/env tsx

/**
 * Quick Deployment Check
 * 
 * Run this manually to check if the enhanced error logging is deployed
 */

const QUICK_CHECK_PRODUCTION_URL = 'https://event-saas-main-rebuilt.onrender.com';

async function quickCheck() {
  console.log('🔍 QUICK DEPLOYMENT CHECK');
  console.log('=========================');
  console.log(`🎯 Target: ${QUICK_CHECK_PRODUCTION_URL}`);
  console.log('📅 Time:', new Date().toISOString());
  
  try {
    const response = await fetch(`${QUICK_CHECK_PRODUCTION_URL}/api/admin/users/test-quick-check`, {
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
        // Enhanced logging is working!
        const errorData = await response.json();
        console.log('\n✅ ENHANCED ERROR LOGGING IS WORKING!');
        console.log('🎯 DETAILED ERROR INFORMATION:');
        console.log('=====================================');
        console.log(JSON.stringify(errorData, null, 2));
        
        console.log('\n🔍 ERROR ANALYSIS:');
        if (errorData.message) {
          console.log(`Root Cause: ${errorData.message}`);
        }
        if (errorData.route) {
          console.log(`Route: ${errorData.route}`);
        }
        if (errorData.timestamp) {
          console.log(`Timestamp: ${errorData.timestamp}`);
        }
        
      } else {
        // Still old format
        const text = await response.text();
        console.log('\n⏳ STILL OLD FORMAT - NOT DEPLOYED YET');
        console.log(`Response: ${text}`);
        console.log('\n💡 The deployment is likely still in progress.');
        console.log('   Check your Render dashboard or wait a few more minutes.');
      }
    } else {
      console.log(`\n⚠️ Unexpected status: ${response.status}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  quickCheck().catch(console.error);
}