#!/usr/bin/env tsx

import 'dotenv/config';
import { env } from '../env.mjs';
import { testR2Connection } from '../lib/r2';
import { prisma } from '../lib/db';

console.log('🔍 Cloudflare R2 Admin Connection Diagnostic');
console.log('============================================\n');

async function runDiagnostics() {
  console.log('📋 Phase 1: Environment Configuration Check');
  console.log('--------------------------------------------');
  
  // Check environment variables
  const envVars = {
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: env.R2_BUCKET_NAME,
    R2_ENDPOINT: env.R2_ENDPOINT,
  };

  console.log('Environment Variables Status:');
  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅ Set' : '❌ Missing';
    const displayValue = value ? `${value.substring(0, 10)}...` : 'Not configured';
    console.log(`  ${key}: ${status} (${displayValue})`);
  });

  const missingVars = Object.entries(envVars).filter(([_, value]) => !value);
  if (missingVars.length > 0) {
    console.log('\n❌ Missing Environment Variables:');
    missingVars.forEach(([key]) => {
      console.log(`  - ${key}`);
    });
    console.log('\n💡 To fix this, add the missing variables to your .env file:');
    console.log('   R2_ACCESS_KEY_ID=your_access_key_here');
    console.log('   R2_SECRET_ACCESS_KEY=your_secret_key_here');
    console.log('   R2_BUCKET_NAME=your_bucket_name');
    console.log('   R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com');
    return;
  }

  console.log('\n📋 Phase 2: R2 Connection Test');
  console.log('-------------------------------');
  
  try {
    console.log('Testing R2 connection...');
    const isConnected = await testR2Connection();
    
    if (isConnected) {
      console.log('✅ R2 connection successful!');
    } else {
      console.log('❌ R2 connection failed');
      console.log('\n💡 Possible issues:');
      console.log('  - Invalid API credentials');
      console.log('  - Incorrect bucket name');
      console.log('  - Wrong endpoint URL');
      console.log('  - Network connectivity issues');
      console.log('  - R2 bucket permissions');
    }
  } catch (error) {
    console.log('❌ R2 connection test error:', error);
  }

  console.log('\n📋 Phase 3: Database R2 Data Check');
  console.log('-----------------------------------');
  
  try {
    // Check for R2 images in database
    const totalImages = await prisma.generatedImage.count();
    const r2Images = await prisma.generatedImage.count({
      where: { r2Key: { not: null } }
    });
    
    console.log(`Total images in database: ${totalImages}`);
    console.log(`Images with R2 keys: ${r2Images}`);
    console.log(`R2 integration rate: ${totalImages > 0 ? Math.round((r2Images / totalImages) * 100) : 0}%`);
    
    if (r2Images === 0) {
      console.log('\n⚠️  No R2 images found in database');
      console.log('💡 This could mean:');
      console.log('  - Images are not being uploaded to R2');
      console.log('  - R2 keys are not being saved to database');
      console.log('  - Database migration for R2 support not applied');
    }
  } catch (error) {
    console.log('❌ Database check error:', error);
  }

  console.log('\n📋 Phase 4: Admin User Check');
  console.log('-----------------------------');
  
  try {
    const adminUsers = await prisma.user.findMany({
      where: { 
        role: { in: ['ADMIN', 'HERO'] }
      },
      select: { id: true, email: true, role: true }
    });
    
    console.log(`Admin users found: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    if (adminUsers.length === 0) {
      console.log('\n⚠️  No admin users found');
      console.log('💡 You need an admin user (ADMIN or HERO role) to access R2 analytics');
      
      // Show all users for debugging
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
      });
      
      if (allUsers.length > 0) {
        console.log('\n📋 All users in database:');
        allUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.role})`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Admin user check error:', error);
  }

  console.log('\n📋 Phase 5: Recommendations');
  console.log('----------------------------');
  
  console.log('🔧 To reconnect admin with Cloudflare R2 data:');
  console.log('');
  console.log('1. Verify your .env file has all required R2 variables');
  console.log('2. Check your Cloudflare R2 dashboard for correct credentials');
  console.log('3. Ensure your R2 bucket exists and is accessible');
  console.log('4. Verify your admin user has proper permissions');
  console.log('5. Test the connection using: npm run test:r2');
  console.log('');
  console.log('📚 For detailed setup instructions, see: CLOUDFLARE_R2_SETUP_GUIDE.md');
  console.log('🔗 Test R2 connection at: /api/test-r2 (admin access required)');
  console.log('📊 View R2 analytics at: /admin (R2 Analytics tab)');
}

runDiagnostics()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Diagnostic complete');
    process.exit(0);
  }); 