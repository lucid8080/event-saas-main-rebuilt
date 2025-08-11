// Test script to verify API pagination is working
console.log('🧪 Testing API Pagination...\n');

// Test the API endpoints directly
async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test user images API
    console.log('👤 Testing user-images API...');
    const userResponse = await fetch(`${baseUrl}/api/user-images?limit=6&offset=0`);
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User images API response:', {
        status: userResponse.status,
        imagesCount: userData.images?.length || 0,
        pagination: userData.pagination
      });
    } else {
      console.log('❌ User images API failed:', userResponse.status);
    }
    
    // Test public images API
    console.log('\n🌍 Testing public-images API...');
    const publicResponse = await fetch(`${baseUrl}/api/public-images?limit=6&offset=0`);
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('✅ Public images API response:', {
        status: publicResponse.status,
        imagesCount: publicData.images?.length || 0,
        pagination: publicData.pagination
      });
    } else {
      console.log('❌ Public images API failed:', publicResponse.status);
    }
    
    // Test second batch
    console.log('\n📄 Testing second batch (offset=6)...');
    const userResponse2 = await fetch(`${baseUrl}/api/user-images?limit=6&offset=6`);
    const publicResponse2 = await fetch(`${baseUrl}/api/public-images?limit=6&offset=6`);
    
    if (userResponse2.ok && publicResponse2.ok) {
      const userData2 = await userResponse2.json();
      const publicData2 = await publicResponse2.json();
      console.log('✅ Second batch results:', {
        userImages: userData2.images?.length || 0,
        publicImages: publicData2.images?.length || 0,
        userHasMore: userData2.pagination?.hasMore,
        publicHasMore: publicData2.pagination?.hasMore
      });
    } else {
      console.log('❌ Second batch failed');
    }
    
  } catch (error) {
    console.error('💥 API test error:', error);
  }
}

testAPIs();
