#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { env } from '../env.mjs';

// Dynamic imports to avoid 'self is not defined' error during build
let S3Client: any;
let ListObjectsV2Command: any;
let r2Client: any;

async function initAwsSdk() {
  if (!S3Client) {
    const awsSdk = await import('@aws-sdk/client-s3');
    S3Client = awsSdk.S3Client;
    ListObjectsV2Command = awsSdk.ListObjectsV2Command;
    
    r2Client = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
}

async function diagnoseR2ImageDiscrepancy() {
  console.log('🔍 R2 Image Discrepancy Diagnostic\n');

  try {
    // 1. Check database images
    console.log('📊 Database Analysis:');
    const totalImages = await prisma.generatedImage.count();
    console.log(`   Total images in database: ${totalImages}`);

    const imagesWithR2Key = await prisma.generatedImage.count({
      where: {
        r2Key: {
          not: null
        }
      }
    });
    console.log(`   Images with R2 key: ${imagesWithR2Key}`);

    const imagesWithoutR2Key = await prisma.generatedImage.count({
      where: {
        r2Key: null
      }
    });
    console.log(`   Images without R2 key: ${imagesWithoutR2Key}`);

    // 2. Check R2 bucket contents
    console.log('\n☁️ R2 Bucket Analysis:');
    try {
      await initAwsSdk();
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 1000
      });

      const response = await r2Client.send(command);
      const r2Objects = response.Contents || [];
      console.log(`   Total objects in R2 bucket: ${r2Objects.length}`);

      // Count by file type
      const pngCount = r2Objects.filter(obj => obj.Key?.endsWith('.png')).length;
      const webpCount = r2Objects.filter(obj => obj.Key?.endsWith('.webp')).length;
      const jpgCount = r2Objects.filter(obj => obj.Key?.endsWith('.jpg') || obj.Key?.endsWith('.jpeg')).length;
      
      console.log(`   PNG files: ${pngCount}`);
      console.log(`   WebP files: ${webpCount}`);
      console.log(`   JPG files: ${jpgCount}`);

      // Show recent objects
      const recentObjects = r2Objects
        .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
        .slice(0, 5);
      
      console.log('\n   Recent objects:');
      recentObjects.forEach(obj => {
        const size = obj.Size ? `${(obj.Size / 1024).toFixed(1)} KB` : 'Unknown';
        const date = obj.LastModified?.toISOString().split('T')[0] || 'Unknown';
        console.log(`     ${obj.Key} (${size}, ${date})`);
      });

    } catch (r2Error) {
      console.log('   ❌ Error accessing R2 bucket:', r2Error);
    }

    // 3. Check recent database images
    console.log('\n🗄️ Recent Database Images:');
    const recentImages = await prisma.generatedImage.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        r2Key: true,
        eventType: true,
        createdAt: true,
        url: true
      }
    });

    console.log(`   Recent images (last 10):`);
    recentImages.forEach(img => {
      const hasR2Key = img.r2Key ? '✅' : '❌';
      const date = img.createdAt.toISOString().split('T')[0];
      console.log(`     ${hasR2Key} ${img.id} (${img.eventType || 'Unknown'}, ${date})`);
      if (img.r2Key) {
        console.log(`        R2 Key: ${img.r2Key}`);
      }
    });

    // 4. Check for orphaned R2 objects
    console.log('\n🔍 Orphaned Object Analysis:');
    if (imagesWithR2Key > 0) {
      const dbR2Keys = await prisma.generatedImage.findMany({
        where: {
          r2Key: {
            not: null
          }
        },
        select: {
          r2Key: true
        }
      });

      const dbKeySet = new Set(dbR2Keys.map(img => img.r2Key!));
      
      try {
        await initAwsSdk();
        const command = new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET_NAME,
          MaxKeys: 1000
        });

        const response = await r2Client.send(command);
        const r2Objects = response.Contents || [];
        
        const orphanedObjects = r2Objects.filter(obj => 
          obj.Key && !dbKeySet.has(obj.Key)
        );

        console.log(`   Orphaned R2 objects (not in database): ${orphanedObjects.length}`);
        if (orphanedObjects.length > 0) {
          console.log('   Orphaned object keys:');
          orphanedObjects.slice(0, 5).forEach(obj => {
            console.log(`     ${obj.Key}`);
          });
          if (orphanedObjects.length > 5) {
            console.log(`     ... and ${orphanedObjects.length - 5} more`);
          }
        }
      } catch (r2Error) {
        console.log('   ❌ Error checking for orphaned objects:', r2Error);
      }
    }

    // 5. Summary and recommendations
    console.log('\n📋 Summary:');
    console.log(`   Database total: ${totalImages}`);
    console.log(`   Database with R2 key: ${imagesWithR2Key}`);
    console.log(`   Database without R2 key: ${imagesWithoutR2Key}`);
    
    try {
      await initAwsSdk();
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 1000
      });
      const response = await r2Client.send(command);
      const r2Objects = response.Contents || [];
      console.log(`   R2 bucket objects: ${r2Objects.length}`);
      
      const discrepancy = Math.abs(imagesWithR2Key - r2Objects.length);
      if (discrepancy > 0) {
        console.log(`   ⚠️  Discrepancy: ${discrepancy} objects`);
      } else {
        console.log(`   ✅ Database and R2 bucket match`);
      }
    } catch (r2Error) {
      console.log('   ❌ Could not verify R2 bucket contents');
    }

    console.log('\n💡 Recommendations:');
    if (imagesWithoutR2Key > 0) {
      console.log('   1. Some images in database don\'t have R2 keys - they may be using direct URLs');
    }
    console.log('   2. Check if new images are being uploaded to R2 correctly');
    console.log('   3. Verify R2 upload process in image generation flow');
    console.log('   4. Consider running a sync script to match database and R2');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnostic
diagnoseR2ImageDiscrepancy().catch(console.error); 