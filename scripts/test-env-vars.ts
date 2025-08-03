#!/usr/bin/env tsx

import 'dotenv/config';
import { env } from '../env.mjs';

console.log('🔍 Testing Environment Variables...\n');

console.log('Direct process.env access:');
console.log(`  R2_ACCESS_KEY_ID: ${process.env.R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`  R2_SECRET_ACCESS_KEY: ${process.env.R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  R2_BUCKET_NAME: ${process.env.R2_BUCKET_NAME ? '✅ Set' : '❌ Missing'}`);
console.log(`  R2_ENDPOINT: ${process.env.R2_ENDPOINT ? '✅ Set' : '❌ Missing'}`);

console.log('\nVia env.mjs:');
console.log(`  R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`  R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  R2_BUCKET_NAME: ${env.R2_BUCKET_NAME ? '✅ Set' : '❌ Missing'}`);
console.log(`  R2_ENDPOINT: ${env.R2_ENDPOINT ? '✅ Set' : '❌ Missing'}`);

console.log('\nValues (first 10 chars):');
console.log(`  R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID?.substring(0, 10) || 'Not set'}...`);
console.log(`  R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY?.substring(0, 10) || 'Not set'}...`);
console.log(`  R2_BUCKET_NAME: ${env.R2_BUCKET_NAME || 'Not set'}`);
console.log(`  R2_ENDPOINT: ${env.R2_ENDPOINT || 'Not set'}`);

console.log('\n✅ Environment test complete'); 