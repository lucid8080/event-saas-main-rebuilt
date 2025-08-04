#!/usr/bin/env tsx

import { 
  optimizeImageForUseCase, 
  generateOptimizedVersions, 
  smartOptimize, 
  optimizeWithMetrics,
  batchOptimize,
  assessOptimizationQuality,
  WEBP_OPTIMIZATION_PRESETS 
} from '../lib/webp-optimization';
import { 
  convertToWebPWithPreset, 
  getImageMetadata,
  WEBP_QUALITY_PRESETS 
} from '../lib/webp-converter';
import { validateWebPConversion } from '../lib/webp-validation';

// Test image data (1x1 pixel PNG)
const TEST_IMAGE_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testWebPPerformance() {
  console.log('🧪 Testing WebP Performance and Optimization...\n');

  // Create test image buffer
  const testImageBuffer = Buffer.from(TEST_IMAGE_DATA, 'base64');

  // Test 1: Basic Optimization Performance
  console.log('📊 Test 1: Basic Optimization Performance');
  console.log('─'.repeat(50));
  
  const useCases = ['thumbnail', 'preview', 'full', 'highQuality', 'socialMedia'] as const;
  
  for (const useCase of useCases) {
    console.log(`\nTesting ${useCase}:`);
    try {
      const startTime = Date.now();
      const result = await optimizeImageForUseCase(testImageBuffer, useCase);
      const processingTime = Date.now() - startTime;
      
      console.log(`  ✅ Success`);
      console.log(`  Original Size: ${result.originalSize} bytes`);
      console.log(`  Optimized Size: ${result.optimizedSize} bytes`);
      console.log(`  Compression Ratio: ${result.compressionRatio.toFixed(2)}%`);
      console.log(`  Processing Time: ${processingTime}ms`);
      console.log(`  Quality: ${WEBP_OPTIMIZATION_PRESETS[useCase].quality}`);
      
      if (result.metadata) {
        console.log(`  Dimensions: ${result.metadata.width}x${result.metadata.height}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  console.log();

  // Test 2: Multiple Version Generation
  console.log('🔄 Test 2: Multiple Version Generation');
  console.log('─'.repeat(50));
  
  try {
    const startTime = Date.now();
    const versions = await generateOptimizedVersions(testImageBuffer, ['thumbnail', 'preview', 'full']);
    const totalTime = Date.now() - startTime;
    
    console.log(`Generated ${Object.keys(versions).length} versions in ${totalTime}ms`);
    
    Object.entries(versions).forEach(([useCase, data]) => {
      console.log(`  ${useCase}:`);
      console.log(`    Size: ${data.size} bytes`);
      console.log(`    Compression: ${data.compressionRatio.toFixed(2)}%`);
      console.log(`    Quality: ${data.preset.quality}`);
    });
  } catch (error) {
    console.log(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  console.log();

  // Test 3: Smart Optimization
  console.log('🧠 Test 3: Smart Optimization');
  console.log('─'.repeat(50));
  
  const imageTypes = ['photo', 'illustration', 'text', 'mixed'] as const;
  
  for (const imageType of imageTypes) {
    console.log(`\nTesting smart optimization for ${imageType}:`);
    try {
      const result = await smartOptimize(testImageBuffer, 'preview', imageType);
      
      console.log(`  ✅ Success`);
      console.log(`  Compression Ratio: ${result.compressionRatio.toFixed(2)}%`);
      console.log(`  Quality Used: ${result.settings.quality}`);
      console.log(`  Recommendations: ${result.recommendations.length}`);
      
      if (result.recommendations.length > 0) {
        result.recommendations.forEach(rec => console.log(`    - ${rec}`));
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  console.log();

  // Test 4: Performance Metrics
  console.log('⚡ Test 4: Performance Metrics');
  console.log('─'.repeat(50));
  
  for (const useCase of useCases) {
    console.log(`\nTesting metrics for ${useCase}:`);
    try {
      const metrics = await optimizeWithMetrics(testImageBuffer, useCase);
      
      console.log(`  ✅ Success`);
      console.log(`  Processing Time: ${metrics.processingTime}ms`);
      console.log(`  Compression Ratio: ${metrics.compressionRatio.toFixed(2)}%`);
      console.log(`  Quality: ${metrics.quality}`);
      console.log(`  Dimensions: ${metrics.dimensions.width}x${metrics.dimensions.height}`);
      
      // Assess quality
      const assessment = assessOptimizationQuality(
        metrics.originalSize,
        metrics.optimizedSize,
        metrics.compressionRatio,
        useCase
      );
      
      console.log(`  Quality Score: ${assessment.score}/100`);
      if (assessment.issues.length > 0) {
        console.log(`  Issues: ${assessment.issues.join(', ')}`);
      }
      if (assessment.recommendations.length > 0) {
        console.log(`  Recommendations: ${assessment.recommendations.join(', ')}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  console.log();

  // Test 5: Batch Processing
  console.log('📦 Test 5: Batch Processing');
  console.log('─'.repeat(50));
  
  const batchImages = [
    { id: 'test1', buffer: testImageBuffer, useCase: 'thumbnail' as const },
    { id: 'test2', buffer: testImageBuffer, useCase: 'preview' as const },
    { id: 'test3', buffer: testImageBuffer, useCase: 'full' as const }
  ];
  
  try {
    const startTime = Date.now();
    const results = await batchOptimize(batchImages, (progress) => {
      console.log(`  Progress: ${progress.completed}/${progress.total} - ${progress.current}`);
    });
    const totalTime = Date.now() - startTime;
    
    console.log(`\nBatch processing completed in ${totalTime}ms`);
    console.log(`Processed ${Object.keys(results).length} images`);
    
    Object.entries(results).forEach(([id, metrics]) => {
      console.log(`  ${id}: ${metrics.compressionRatio.toFixed(2)}% compression in ${metrics.processingTime}ms`);
    });
  } catch (error) {
    console.log(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  console.log();

  // Test 6: Quality Validation
  console.log('🔍 Test 6: Quality Validation');
  console.log('─'.repeat(50));
  
  try {
    const optimizedBuffer = await convertToWebPWithPreset(testImageBuffer, 'medium');
    const validation = await validateWebPConversion(testImageBuffer, optimizedBuffer);
    
    console.log(`✅ Validation Results:`);
    console.log(`  Is Valid: ${validation.isValid}`);
    console.log(`  Quality Score: ${validation.qualityScore}/100`);
    console.log(`  Compression Ratio: ${validation.compressionRatio.toFixed(2)}%`);
  } catch (error) {
    console.log(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  console.log();

  // Test 7: Memory Usage Analysis
  console.log('💾 Test 7: Memory Usage Analysis');
  console.log('─'.repeat(50));
  
  const initialMemory = process.memoryUsage();
  console.log(`Initial Memory Usage:`);
  console.log(`  RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  // Perform multiple optimizations
  for (let i = 0; i < 10; i++) {
    await optimizeImageForUseCase(testImageBuffer, 'preview');
  }
  
  const finalMemory = process.memoryUsage();
  console.log(`\nFinal Memory Usage:`);
  console.log(`  RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  const memoryIncrease = {
    rss: finalMemory.rss - initialMemory.rss,
    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed
  };
  
  console.log(`\nMemory Increase:`);
  console.log(`  RSS: ${(memoryIncrease.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Heap Used: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log();

  // Test 8: Performance Benchmarks
  console.log('🏁 Test 8: Performance Benchmarks');
  console.log('─'.repeat(50));
  
  const benchmarkResults: Record<string, number[]> = {};
  
  // Benchmark different quality presets
  for (const quality of Object.keys(WEBP_QUALITY_PRESETS)) {
    const times: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await convertToWebPWithPreset(testImageBuffer, quality as keyof typeof WEBP_QUALITY_PRESETS);
      times.push(Date.now() - startTime);
    }
    
    benchmarkResults[quality] = times;
  }
  
  Object.entries(benchmarkResults).forEach(([quality, times]) => {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`${quality}:`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime}ms`);
    console.log(`  Max: ${maxTime}ms`);
  });
  console.log();

  console.log('🎉 WebP Performance Testing Completed!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Basic optimization performance tested');
  console.log('  ✅ Multiple version generation tested');
  console.log('  ✅ Smart optimization tested');
  console.log('  ✅ Performance metrics collected');
  console.log('  ✅ Batch processing tested');
  console.log('  ✅ Quality validation performed');
  console.log('  ✅ Memory usage analyzed');
  console.log('  ✅ Performance benchmarks completed');
}

// Run the test if this script is executed directly
if (require.main === module) {
  testWebPPerformance()
    .then(() => {
      console.log('\n✅ Performance test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Performance test failed:', error);
      process.exit(1);
    });
}

export { testWebPPerformance }; 