#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔄 Refreshing Admin Session...\n');

async function refreshAdminSession() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        accounts: true,
        generatedImages: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📊 Current User Status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Images: ${user.generatedImages.length}`);
    console.log(`   OAuth accounts: ${user.accounts.length}`);

    if (user.role === 'HERO' || user.role === 'ADMIN') {
      console.log('\n✅ User has admin access!');
      console.log('💡 Admin tools should be visible in the sidebar.');
      
      console.log('\n🔧 If you still don\'t see admin tools:');
      console.log('1. Sign out completely');
      console.log('2. Clear your browser cache/cookies');
      console.log('3. Sign in again with Google');
      console.log('4. Check the sidebar for "Admin Panel" and "Blog Posts"');
      
      console.log('\n📋 Admin URLs you can access:');
      console.log('   - Admin Dashboard: http://localhost:3000/admin');
      console.log('   - Blog Posts: http://localhost:3000/admin/blog');
      console.log('   - Gallery: http://localhost:3000/gallery');
      
    } else {
      console.log('\n❌ User does not have admin access');
      console.log('💡 Current role:', user.role);
      console.log('🔧 Run: npm run make:admin to grant admin access');
    }

  } catch (error) {
    console.error('❌ Error refreshing session:', error);
  }
}

refreshAdminSession()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Session refresh complete');
    process.exit(0);
  }); 