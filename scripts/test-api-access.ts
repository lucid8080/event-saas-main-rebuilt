#!/usr/bin/env tsx

/**
 * Test API Access
 * 
 * This script tests API access to understand the authentication issue
 */

async function testAPIAccess() {
  console.log('🔍 TESTING API ACCESS');
  console.log('====================');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server availability...');
    const healthResponse = await fetch(`${baseUrl}/api/debug-env`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log(`   Response: ${healthData.substring(0, 100)}...`);
    }
    
    // Test 2: Test admin API without authentication
    console.log('\n2. Testing admin API without authentication...');
    const adminResponse = await fetch(`${baseUrl}/api/admin/users/test-user-id`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credits: 10 })
    });
    
    console.log(`   Status: ${adminResponse.status}`);
    console.log(`   Status Text: ${adminResponse.statusText}`);
    
    if (adminResponse.status === 401) {
      console.log('   ✅ Expected: 401 Unauthorized (no authentication)');
    } else if (adminResponse.status === 500) {
      const errorData = await adminResponse.text();
      console.log(`   ❌ Unexpected 500 error: ${errorData.substring(0, 200)}...`);
    } else {
      console.log(`   ⚠️ Unexpected status: ${adminResponse.status}`);
    }
    
    // Test 3: Test with a simple GET request
    console.log('\n3. Testing simple GET request...');
    const getResponse = await fetch(`${baseUrl}/api/admin/users`);
    console.log(`   Status: ${getResponse.status}`);
    
    if (getResponse.status === 401) {
      console.log('   ✅ Expected: 401 Unauthorized (no authentication)');
    } else {
      console.log(`   ⚠️ Unexpected status: ${getResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('   Make sure the development server is running on http://localhost:3000');
  }
}

if (require.main === module) {
  testAPIAccess().catch(console.error);
} 