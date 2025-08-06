#!/usr/bin/env tsx

async function checkProductionDeployment() {
  console.log('🔍 Checking Production Deployment');
  console.log('================================\n');

  try {
    // Step 1: Check if the updated API route is deployed
    console.log('1. Checking API Route Deployment...');
    
    const response = await fetch('https://event-saas-main-rebuilt.onrender.com/api/debug-env', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.text();
      console.log('   ✅ Production server is responding');
      console.log('   📄 Response:', data.substring(0, 200) + '...');
    } else {
      console.log(`   ❌ Production server error: ${response.status}`);
    }

    // Step 2: Check if the bulletproof API route is active
    console.log('\n2. Checking Bulletproof API Route...');
    
    // Try to access the admin users API to see if it has the new error handling
    const testResponse = await fetch('https://event-saas-main-rebuilt.onrender.com/api/admin/users/test', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credits: 10 }),
    });

    console.log(`   📊 Test response status: ${testResponse.status}`);
    
    if (testResponse.status === 401) {
      console.log('   ✅ API route is responding (expected 401 for unauthenticated request)');
      console.log('   ✅ This suggests the updated API route is deployed');
    } else if (testResponse.status === 500) {
      console.log('   ❌ API route is still returning 500 errors');
      console.log('   ❌ This suggests the old API route is still deployed');
    } else {
      console.log(`   ⚠️  Unexpected response: ${testResponse.status}`);
    }

    // Step 3: Check build status
    console.log('\n3. Deployment Status Check...');
    console.log('   📋 To check if the updated code is deployed:');
    console.log('   1. Go to your Render dashboard');
    console.log('   2. Check the "Logs" tab for the latest deployment');
    console.log('   3. Look for the build command execution');
    console.log('   4. Verify the build completed successfully');
    
    console.log('\n   🔧 Expected build command:');
    console.log('   npm install; npx prisma generate && npm run build && npx tsx scripts/build-hero-setup.ts && npm run fix:final:production');
    
    console.log('\n   📊 Expected build logs should show:');
    console.log('   ✅ Database connection successful');
    console.log('   ✅ HERO user found: lucid8080@gmail.com');
    console.log('   ✅ Credit update simulation successful');
    console.log('   🎉 Final Production Fix Complete!');

    // Step 4: Recommendations
    console.log('\n4. Recommendations...');
    console.log('   🚨 If you\'re still getting 500 errors:');
    console.log('   1. The updated code hasn\'t been deployed yet');
    console.log('   2. Check Render deployment status');
    console.log('   3. Ensure the build command includes the fix script');
    console.log('   4. Wait for deployment to complete');
    console.log('   5. Clear browser cache after deployment');
    
    console.log('\n   🔧 If deployment is stuck:');
    console.log('   1. Check Render logs for build errors');
    console.log('   2. Verify all environment variables are set');
    console.log('   3. Try a manual deployment trigger');
    console.log('   4. Check if there are any build warnings');

  } catch (error) {
    console.error('❌ Production check failed:', error);
    console.log('\n📋 Manual Check Required:');
    console.log('1. Go to Render dashboard');
    console.log('2. Check deployment status');
    console.log('3. Verify build completed successfully');
    console.log('4. Check if the updated API route is deployed');
  }
}

// Run the check
checkProductionDeployment(); 