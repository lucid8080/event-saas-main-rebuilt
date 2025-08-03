#!/usr/bin/env tsx

import 'dotenv/config';
import { testR2Connection } from '../lib/r2';
import { env } from '../env.mjs';

console.log('🔗 Testing Cloudflare R2 Connection...\n');

async function testConnection() {
  // Check environment variables
  const hasAccessKey = !!env.R2_ACCESS_KEY_ID;
  const hasSecretKey = !!env.R2_SECRET_ACCESS_KEY;
  const hasBucket = !!env.R2_BUCKET_NAME;
  const hasEndpoint = !!env.R2_ENDPOINT;

  console.log('Environment Check:');
  console.log(`  Access Key: ${hasAccessKey ? '✅' : '❌'}`);
  console.log(`  Secret Key: ${hasSecretKey ? '✅' : '❌'}`);
  console.log(`  Bucket Name: ${hasBucket ? '✅' : '❌'}`);
  console.log(`  Endpoint: ${hasEndpoint ? '✅' : '❌'}`);

  if (!hasAccessKey || !hasSecretKey || !hasBucket || !hasEndpoint) {
    console.log('\n❌ Missing required environment variables');
    console.log('Please check your .env file and ensure all R2 variables are set');
    return;
  }

  console.log('\nTesting connection...');
  
  try {
    const isConnected = await testR2Connection();
    
    if (isConnected) {
      console.log('✅ R2 connection successful!');
      console.log('Your admin dashboard should now be able to access R2 data');
    } else {
      console.log('❌ R2 connection failed');
      console.log('Check your credentials and bucket permissions');
    }
  } catch (error) {
    console.log('❌ Connection test error:', error);
  }
}

testConnection()
  .catch(console.error)
  .finally(() => process.exit(0)); 