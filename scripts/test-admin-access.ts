#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔧 Testing Admin Access for HERO Users...\n');

async function testAdminAccess() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    
    // Find the current user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        generatedImages: true,
        accounts: true
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
      console.log('💡 All admin APIs should now be accessible.');
      
      console.log('\n📋 Admin APIs that should work:');
      console.log('   - /api/analytics/r2-dashboard (R2 Analytics)');
      console.log('   - /api/admin/users (User Management)');
      console.log('   - /api/admin/system-prompts (System Prompts)');
      console.log('   - /api/admin/r2-alerts (R2 Alerts)');
      console.log('   - /api/test-r2 (R2 Connection Test)');
      console.log('   - /api/test-r2-integration (R2 Integration Test)');
      
      console.log('\n🎯 Next Steps:');
      console.log('1. Refresh your browser');
      console.log('2. Go to: http://localhost:3000/admin');
      console.log('3. Check the R2 Analytics tab');
      console.log('4. Check the Users tab');
      console.log('5. All data should now be visible');
      
    } else {
      console.log('\n❌ User does not have admin access');
      console.log('💡 Current role:', user.role);
      console.log('🔧 Run: npm run make:admin to grant admin access');
    }

  } catch (error) {
    console.error('❌ Error testing admin access:', error);
  }
}

testAdminAccess()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Admin access test complete');
    process.exit(0);
  }); 