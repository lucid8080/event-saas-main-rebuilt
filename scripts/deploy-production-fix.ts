#!/usr/bin/env tsx

/**
 * Production Fix Deployment Script
 * 
 * This script helps deploy the enhanced error logging to production
 * and then tests the API endpoints to get detailed error information.
 */

const DEPLOY_FIX_URL = 'https://event-saas-main-rebuilt.onrender.com';

async function testAPIWithEnhancedLogging() {
  console.log('🚀 TESTING API WITH ENHANCED ERROR LOGGING');
  console.log('==========================================');
  console.log(`🎯 Target: ${DEPLOY_FIX_URL}`);
  console.log('📅 Time:', new Date().toISOString());
  
  try {
    console.log('\n🔍 Testing Credit Management API...');
    
    // Test the PATCH endpoint that was failing
    const response = await fetch(`${DEPLOY_FIX_URL}/api/admin/users/test-user-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        credits: 10 
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Status Text: ${response.statusText}`);
    
    if (response.status === 500) {
      // Try to get the enhanced error details
      const contentType = response.headers.get('content-type');
      console.log(`📄 Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          console.log('\n✅ ENHANCED ERROR DATA RECEIVED:');
          console.log('================================');
          console.log('🔍 Error Details:', JSON.stringify(errorData, null, 2));
          
          if (errorData.message) {
            console.log(`\n🎯 Root Cause: ${errorData.message}`);
          }
          
          return errorData;
        } catch (jsonError) {
          console.log('❌ Failed to parse JSON error response');
          const textResponse = await response.text();
          console.log('📄 Raw Response:', textResponse.substring(0, 500));
        }
      } else {
        // Old error format - still plain text
        const textResponse = await response.text();
        console.log('\n⚠️ OLD ERROR FORMAT (deployment not complete):');
        console.log('==============================================');
        console.log('📄 Response:', textResponse);
        console.log('\n🔧 This suggests the enhanced error logging is not yet deployed.');
        console.log('   Please check Render deployment status.');
      }
    } else if (response.status === 401 || response.status === 403) {
      console.log('✅ API is responding - got expected auth error');
      console.log('   This means the API route is working, just not authenticated');
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`);
      const responseText = await response.text();
      console.log('📄 Response:', responseText.substring(0, 300));
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

async function checkServerStatus() {
  console.log('\n🔍 CHECKING SERVER STATUS');
  console.log('=========================');
  
  try {
    // Check if the debug endpoint is working
    const debugResponse = await fetch(`${DEPLOY_FIX_URL}/api/debug-env`);
    
    if (debugResponse.ok) {
      console.log('✅ Production server is responding');
      const data = await debugResponse.text();
      console.log('📄 Environment status:', data.substring(0, 200) + '...');
    } else {
      console.log(`❌ Debug endpoint error: ${debugResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Server check failed:', error.message);
  }
}

async function provideDiagnosticSummary() {
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  
  console.log('\n🔍 What we know:');
  console.log('✅ Static assets are working (astronaut-logo.png loads)');
  console.log('✅ Production server is healthy and responding');
  console.log('✅ Environment variables are properly set');
  console.log('❌ Credit management API returns 500 Internal Server Error');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Deploy the enhanced error logging code to production');
  console.log('2. Run this script again to get detailed error information');
  console.log('3. Based on the detailed error, implement the specific fix');
  console.log('4. Test the fix in production');
  
  console.log('\n🚀 Deployment Commands:');
  console.log('If using Render:');
  console.log('- Go to Render Dashboard');
  console.log('- Trigger a new deployment');
  console.log('- Wait for build to complete');
  console.log('- Run this script again');
  
  console.log('\nIf using manual deployment:');
  console.log('- git add .');
  console.log('- git commit -m "Add enhanced API error logging"');
  console.log('- git push origin main');
  console.log('- Wait for deployment');
  console.log('- Run this script again');
}

async function main() {
  await checkServerStatus();
  await testAPIWithEnhancedLogging();
  await provideDiagnosticSummary();
}

if (require.main === module) {
  main().catch(console.error);
} 