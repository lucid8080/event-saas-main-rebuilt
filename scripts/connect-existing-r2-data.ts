#!/usr/bin/env tsx

import 'dotenv/config';
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

console.log('🔗 Connecting Existing R2 Data to Database...\n');

async function connectExistingR2Data() {
  try {
    // Initialize AWS SDK
    await initAwsSdk();
    
    // Check environment variables
    if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME || !env.R2_ENDPOINT) {
      console.log('❌ R2 environment variables not configured');
      console.log('Please set the following in your .env file:');
      console.log('  R2_ACCESS_KEY_ID=your_access_key_here');
      console.log('  R2_SECRET_ACCESS_KEY=your_secret_key_here');
      console.log('  R2_BUCKET_NAME=event-images');
      console.log('  R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com');
      return;
    }

    console.log('✅ Environment variables configured');
    console.log(`Bucket: ${env.R2_BUCKET_NAME}`);
    console.log(`Endpoint: ${env.R2_ENDPOINT}`);

    // List all objects in R2 bucket
    console.log('\n📋 Fetching existing R2 objects...');
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
    });

    const response = await r2Client.send(command);
    const objects = response.Contents || [];

    console.log(`Found ${objects.length} objects in R2 bucket`);

    if (objects.length === 0) {
      console.log('No objects found in R2 bucket');
      return;
    }

    // Get admin user for ownership (check both ADMIN and HERO roles)
    const adminUser = await prisma.user.findFirst({
      where: { 
        role: { in: ['ADMIN', 'HERO'] }
      },
      select: { id: true, email: true, role: true }
    });

    if (!adminUser) {
      console.log('❌ No admin user found');
      console.log('Please create an admin user with role ADMIN or HERO first');
      console.log('Available users:');
      
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
      });
      
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
      
      return;
    }

    console.log(`Using admin user: ${adminUser.email} (${adminUser.role})`);

    // Process each R2 object
    let createdCount = 0;
    let skippedCount = 0;

    for (const object of objects) {
      if (!object.Key) continue;

      // Check if this R2 key already exists in database
      const existingImage = await prisma.generatedImage.findFirst({
        where: { r2Key: object.Key }
      });

      if (existingImage) {
        console.log(`⏭️  Skipping ${object.Key} (already exists in database)`);
        skippedCount++;
        continue;
      }

      // Extract information from the key
      const keyParts = object.Key.split('/');
      const fileName = keyParts[keyParts.length - 1];
      
      // Generate a unique image ID
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine content type from file extension
      const extension = fileName.split('.').pop()?.toLowerCase();
      const contentType = extension === 'webp' ? 'image/webp' : 
                         extension === 'png' ? 'image/png' : 
                         extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 
                         'image/png';

      // Create database record
      try {
        await prisma.generatedImage.create({
          data: {
            id: imageId,
            userId: adminUser.id,
            r2Key: object.Key,
            url: '', // Will be generated when needed
            prompt: `Imported from R2: ${fileName}`,
            eventType: 'OTHER',
            eventDetails: {
              importedFrom: 'R2',
              originalFileName: fileName,
              contentType: contentType,
              fileSize: object.Size || 0,
              importedAt: new Date().toISOString()
            },
            createdAt: object.LastModified || new Date(),
          }
        });

        console.log(`✅ Created record for ${object.Key}`);
        createdCount++;
      } catch (error) {
        console.log(`❌ Failed to create record for ${object.Key}:`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Created: ${createdCount} new database records`);
    console.log(`  Skipped: ${skippedCount} existing records`);
    console.log(`  Total processed: ${objects.length} objects`);

    if (createdCount > 0) {
      console.log('\n🎉 Successfully connected existing R2 data to database!');
      console.log('Your admin dashboard should now show the R2 analytics data.');
    }

  } catch (error) {
    console.error('❌ Error connecting R2 data:', error);
  }
}

connectExistingR2Data()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 data connection complete');
    process.exit(0);
  }); 