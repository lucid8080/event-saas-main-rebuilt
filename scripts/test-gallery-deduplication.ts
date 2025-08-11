// Test script to verify gallery deduplication logic
const userImages = [
  { id: '1', url: 'url1', prompt: 'prompt1', eventType: 'WEDDING', isPublic: true, createdAt: '2024-01-01' },
  { id: '2', url: 'url2', prompt: 'prompt2', eventType: 'BIRTHDAY', isPublic: false, createdAt: '2024-01-02' },
  { id: '3', url: 'url3', prompt: 'prompt3', eventType: 'CORPORATE', isPublic: true, createdAt: '2024-01-03' }
];

const publicImages = [
  { id: '1', url: 'url1', prompt: 'prompt1', eventType: 'WEDDING', isPublic: true, createdAt: '2024-01-01' }, // Duplicate
  { id: '3', url: 'url3', prompt: 'prompt3', eventType: 'CORPORATE', isPublic: true, createdAt: '2024-01-03' }, // Duplicate
  { id: '4', url: 'url4', prompt: 'prompt4', eventType: 'CONCERT', isPublic: true, createdAt: '2024-01-04' }, // Unique
  { id: '5', url: 'url5', prompt: 'prompt5', eventType: 'SPORTS', isPublic: true, createdAt: '2024-01-05' }  // Unique
];

console.log('🧪 Testing Gallery Deduplication Logic...\n');

console.log(`📊 Input:`);
console.log(`   User Images: ${userImages.length}`);
console.log(`   Public Images: ${publicImages.length}`);

// Apply the same logic as the gallery page
const allImages = [...userImages];
const userImageIds = new Set(userImages.map((img: any) => img.id));

console.log(`\n📊 Deduplication Process:`);
console.log(`   User Image IDs: [${Array.from(userImageIds).join(', ')}]`);

let addedPublicImages = 0;
publicImages.forEach((publicImg: any) => {
  if (!userImageIds.has(publicImg.id)) {
    allImages.push({
      id: publicImg.id,
      url: publicImg.url,
      prompt: publicImg.prompt,
      eventType: publicImg.eventType,
      isPublic: publicImg.isPublic,
      createdAt: publicImg.createdAt
    });
    addedPublicImages++;
    console.log(`   ✅ Added public image: ${publicImg.id}`);
  } else {
    console.log(`   ❌ Skipped duplicate: ${publicImg.id}`);
  }
});

console.log(`\n📊 Results:`);
console.log(`   Added ${addedPublicImages} unique public images (${publicImages.length - addedPublicImages} were duplicates)`);
console.log(`   Total before final deduplication: ${allImages.length}`);

// Remove any remaining duplicates by ID
const uniqueImages = allImages.filter((image, index, self) => 
  index === self.findIndex(img => img.id === image.id)
);

console.log(`   Final unique images: ${uniqueImages.length} (removed ${allImages.length - uniqueImages.length} duplicates)`);

console.log(`\n📋 Final Image List:`);
uniqueImages.forEach((img, index) => {
  console.log(`   ${index + 1}. ID: ${img.id} | Event: ${img.eventType} | Public: ${img.isPublic}`);
});

// Verify the result
const expectedCount = 5; // 3 user images + 2 unique public images
const actualCount = uniqueImages.length;

console.log(`\n✅ Test Result: ${actualCount === expectedCount ? 'PASSED' : 'FAILED'}`);
console.log(`   Expected: ${expectedCount} images`);
console.log(`   Actual: ${actualCount} images`);

if (actualCount !== expectedCount) {
  console.log(`   ❌ Test failed - deduplication not working correctly`);
} else {
  console.log(`   ✅ Test passed - deduplication working correctly`);
}
