#!/usr/bin/env tsx

import 'dotenv/config';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

console.log('🔍 Checking R2 Objects...\n');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function checkR2Objects() {
  try {
    const bucketName = process.env.R2_BUCKET_NAME;
    
    if (!bucketName) {
      console.log('❌ R2_BUCKET_NAME not set');
      return;
    }

    console.log(`Checking bucket: ${bucketName}`);
    console.log(`Endpoint: ${process.env.R2_ENDPOINT}`);

    // Test R2 keys with both old and new user IDs
    const testKeys = [
      // New user ID paths (current)
      'users/cmdvsi8gw0000jy2oig4ahn5x/images/img_1754113585548_2qcy85e3m-1754113585548.png',
      'users/cmdvsi8gw0000jy2oig4ahn5x/images/img_1754113819477_4aen6e5hm-1754113819477.png',
      'users/cmdvsi8gw0000jy2oig4ahn5x/images/img_1754113978951_02szb9cqa-1754113978951.png',
      'users/cmdvsi8gw0000jy2oig4ahn5x/images/img_1754115310079_mzktew3tv-1754115310079.png',
      'users/cmdvsi8gw0000jy2oig4ahn5x/images/img_1754116040716_o0xyo4h3s-1754116040716.webp',
      // Old user ID paths (original)
      'users/cmdtnz0g70000oosf1uxkcpgc/images/img_1754113585548_2qcy85e3m-1754113585548.png',
      'users/cmdtnz0g70000oosf1uxkcpgc/images/img_1754113819477_4aen6e5hm-1754113819477.png',
      'users/cmdtnz0g70000oosf1uxkcpgc/images/img_1754113978951_02szb9cqa-1754113978951.png',
      'users/cmdtnz0g70000oosf1uxkcpgc/images/img_1754115310079_mzktew3tv-1754115310079.png',
      'users/cmdtnz0g70000oosf1uxkcpgc/images/img_1754116040716_o0xyo4h3s-1754116040716.webp'
    ];

    console.log('\n📋 Checking R2 objects:');
    
    for (const key of testKeys) {
      try {
        const command = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        
        const response = await s3Client.send(command);
        console.log(`✅ ${key} - Size: ${response.ContentLength} bytes`);
      } catch (error: any) {
        if (error.name === 'NotFound') {
          console.log(`❌ ${key} - Not found`);
        } else {
          console.log(`❌ ${key} - Error: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 R2 object check complete!');

  } catch (error) {
    console.error('❌ Error checking R2 objects:', error);
  }
}

checkR2Objects()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 object check complete');
    process.exit(0);
  }); 