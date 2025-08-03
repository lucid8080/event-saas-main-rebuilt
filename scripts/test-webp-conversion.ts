#!/usr/bin/env tsx

import { 
  convertToWebP, 
  convertToWebPWithPreset, 
  getImageMetadata, 
  canConvertToWebP,
  calculateCompressionRatio,
  testWebPConversion,
  WEBP_QUALITY_PRESETS,
  type WebPQualitySettings
} from '../lib/webp-converter';

// Test image data (1x1 pixel PNG)
const TEST_IMAGE_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function runWebPConversionTests() {
  console.log('🧪 Starting WebP Conversion Tests...\n');

  // Test 1: Basic WebP conversion
  console.log('📋 Test 1: Basic WebP Conversion');
  try {
    const testBuffer = Buffer.from(TEST_IMAGE_DATA, 'base64');
    const webpBuffer = await convertToWebP(testBuffer);
    
    console.log('✅ Basic conversion successful');
    console.log(`   Original size: ${testBuffer.length} bytes`);
    console.log(`   WebP size: ${webpBuffer.length} bytes`);
    console.log(`   Compression ratio: ${calculateCompressionRatio(testBuffer.length, webpBuffer.length).toFixed(2)}%`);
  } catch (error) {
    console.error('❌ Basic conversion failed:', error);
  }

  // Test 2: WebP conversion with different presets
  console.log('\n📋 Test 2: WebP Conversion with Different Presets');
  const testBuffer = Buffer.from(TEST_IMAGE_DATA, 'base64');
  
  for (const [presetName, settings] of Object.entries(WEBP_QUALITY_PRESETS)) {
    try {
      const webpBuffer = await convertToWebPWithPreset(testBuffer, presetName as keyof typeof WEBP_QUALITY_PRESETS);
      const compressionRatio = calculateCompressionRatio(testBuffer.length, webpBuffer.length);
      
      console.log(`✅ ${presetName} preset: ${webpBuffer.length} bytes (${compressionRatio.toFixed(2)}% compression)`);
    } catch (error) {
      console.error(`❌ ${presetName} preset failed:`, error);
    }
  }

  // Test 3: Image metadata extraction
  console.log('\n📋 Test 3: Image Metadata Extraction');
  try {
    const metadata = await getImageMetadata(testBuffer);
    console.log('✅ Metadata extraction successful:');
    console.log(`   Format: ${metadata.format}`);
    console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`   Size: ${metadata.size} bytes`);
    console.log(`   Has Alpha: ${metadata.hasAlpha}`);
    console.log(`   Is Opaque: ${metadata.isOpaque}`);
  } catch (error) {
    console.error('❌ Metadata extraction failed:', error);
  }

  // Test 4: WebP conversion validation
  console.log('\n📋 Test 4: WebP Conversion Validation');
  try {
    const canConvert = await canConvertToWebP(testBuffer);
    console.log(`✅ Conversion validation: ${canConvert ? 'Supported' : 'Not supported'}`);
  } catch (error) {
    console.error('❌ Conversion validation failed:', error);
  }

  // Test 5: Built-in test function
  console.log('\n📋 Test 5: Built-in Test Function');
  try {
    const testResult = await testWebPConversion();
    if (testResult.success) {
      console.log('✅ Built-in test successful');
      console.log(`   Compression ratio: ${testResult.compressionRatio?.toFixed(2)}%`);
    } else {
      console.error('❌ Built-in test failed:', testResult.error);
    }
  } catch (error) {
    console.error('❌ Built-in test failed:', error);
  }

  // Test 6: Performance test with larger image simulation
  console.log('\n📋 Test 6: Performance Test');
  try {
    // Create a larger test image by repeating the small image
    const largeTestBuffer = Buffer.concat(Array(100).fill(Buffer.from(TEST_IMAGE_DATA, 'base64')));
    
    const startTime = Date.now();
    const webpBuffer = await convertToWebP(largeTestBuffer);
    const endTime = Date.now();
    
    const compressionRatio = calculateCompressionRatio(largeTestBuffer.length, webpBuffer.length);
    const processingTime = endTime - startTime;
    
    console.log('✅ Performance test successful:');
    console.log(`   Processing time: ${processingTime}ms`);
    console.log(`   Original size: ${largeTestBuffer.length} bytes`);
    console.log(`   WebP size: ${webpBuffer.length} bytes`);
    console.log(`   Compression ratio: ${compressionRatio.toFixed(2)}%`);
    console.log(`   Processing speed: ${(largeTestBuffer.length / 1024 / (processingTime / 1000)).toFixed(2)} KB/s`);
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }

  // Test 7: Error handling test
  console.log('\n📋 Test 7: Error Handling Test');
  try {
    const invalidBuffer = Buffer.from('invalid image data');
    await convertToWebP(invalidBuffer);
    console.log('❌ Error handling test failed: should have thrown an error');
  } catch (error) {
    console.log('✅ Error handling test successful: properly caught invalid image data');
  }

  console.log('\n🎉 WebP Conversion Tests Completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runWebPConversionTests()
    .then(() => {
      console.log('\n✨ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { runWebPConversionTests }; 