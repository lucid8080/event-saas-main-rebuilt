#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { env } from '../env.mjs';

// Dynamic imports to avoid 'self is not defined' error during build
let S3Client: any;
let ListObjectsV2Command: any;
let DeleteObjectCommand: any;
let r2Client: any;

async function initAwsSdk() {
  if (!S3Client) {
    const awsSdk = await import('@aws-sdk/client-s3');
    S3Client = awsSdk.S3Client;
    ListObjectsV2Command = awsSdk.ListObjectsV2Command;
    DeleteObjectCommand = awsSdk.DeleteObjectCommand;
    
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

async function syncR2Database() {
  try {
    // Initialize AWS SDK
    await initAwsSdk();
    
    console.log('🔄 Syncing R2 Database...\n');

    // 1. Get database images with R2 keys
    console.log('📊 Analyzing database...');
    const dbImages = await prisma.generatedImage.findMany({
      where: {
        r2Key: {
          not: null
        }
      },
      select: {
        id: true,
        r2Key: true,
        eventType: true,
        createdAt: true
      }
    });

    console.log(`   Database images with R2 keys: ${dbImages.length}`);

    // 2. Get R2 bucket contents
    console.log('\n☁️ Analyzing R2 bucket...');
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 1000
    });

    const response = await r2Client.send(command);
    const r2Objects = response.Contents || [];
    console.log(`   R2 bucket objects: ${r2Objects.length}`);

    // 3. Find orphaned R2 objects (in R2 but not in database)
    const dbKeySet = new Set(dbImages.map(img => img.r2Key!));
    const orphanedR2Objects = r2Objects.filter(obj => 
      obj.Key && !dbKeySet.has(obj.Key)
    );

    console.log(`   Orphaned R2 objects: ${orphanedR2Objects.length}`);

    // 4. Find missing R2 objects (in database but not in R2)
    const r2KeySet = new Set(r2Objects.map(obj => obj.Key!));
    const missingR2Objects = dbImages.filter(img => 
      img.r2Key && !r2KeySet.has(img.r2Key)
    );

    console.log(`   Missing R2 objects: ${missingR2Objects.length}`);

    // 5. Show summary
    console.log('\n📋 Sync Summary:');
    console.log(`   Database R2 images: ${dbImages.length}`);
    console.log(`   R2 bucket objects: ${r2Objects.length}`);
    console.log(`   Orphaned objects: ${orphanedR2Objects.length}`);
    console.log(`   Missing objects: ${missingR2Objects.length}`);

    // 6. Ask for action
    console.log('\n🔧 Available Actions:');
    console.log('   1. Clean orphaned R2 objects (delete from R2)');
    console.log('   2. Remove R2 keys from missing objects (update database)');
    console.log('   3. Show detailed analysis only');
    console.log('   4. Exit without changes');

    // For now, just show the analysis
    console.log('\n📋 Detailed Analysis:');

    if (orphanedR2Objects.length > 0) {
      console.log('\n   Orphaned R2 Objects (not in database):');
      orphanedR2Objects.slice(0, 10).forEach(obj => {
        const size = obj.Size ? `${(obj.Size / 1024).toFixed(1)} KB` : 'Unknown';
        const date = obj.LastModified?.toISOString().split('T')[0] || 'Unknown';
        console.log(`     ${obj.Key} (${size}, ${date})`);
      });
      if (orphanedR2Objects.length > 10) {
        console.log(`     ... and ${orphanedR2Objects.length - 10} more`);
      }
    }

    if (missingR2Objects.length > 0) {
      console.log('\n   Missing R2 Objects (in database but not in R2):');
      missingR2Objects.slice(0, 10).forEach(img => {
        const date = img.createdAt.toISOString().split('T')[0];
        console.log(`     ${img.r2Key} (${img.eventType || 'Unknown'}, ${date})`);
      });
      if (missingR2Objects.length > 10) {
        console.log(`     ... and ${missingR2Objects.length - 10} more`);
      }
    }

    // 7. Provide recommendations
    console.log('\n💡 Recommendations:');
    
    if (orphanedR2Objects.length > 0) {
      console.log(`   • Consider cleaning ${orphanedR2Objects.length} orphaned R2 objects`);
      console.log('   • These objects are taking up storage space but not referenced in database');
    }
    
    if (missingR2Objects.length > 0) {
      console.log(`   • Consider removing R2 keys from ${missingR2Objects.length} database records`);
      console.log('   • These records reference R2 objects that no longer exist');
    }

    if (orphanedR2Objects.length === 0 && missingR2Objects.length === 0) {
      console.log('   ✅ Database and R2 bucket are in sync!');
    }

    // 8. Show recent activity
    console.log('\n📈 Recent Activity:');
    const recentImages = await prisma.generatedImage.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        r2Key: true,
        eventType: true,
        createdAt: true
      }
    });

    console.log('   Recent database images:');
    recentImages.forEach(img => {
      const hasR2Key = img.r2Key ? '✅' : '❌';
      const date = img.createdAt.toISOString().split('T')[0];
      console.log(`     ${hasR2Key} ${img.id} (${img.eventType || 'Unknown'}, ${date})`);
    });

  } catch (error) {
    console.error('❌ Error during sync analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync analysis
syncR2Database().catch(console.error); 