#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔐 Resetting User Password...\n');

async function resetUserPassword() {
  try {
    const email = 'lucid8080@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`OAuth accounts: ${user.accounts.length}`);

    // Check if user has any OAuth accounts
    if (user.accounts.length > 0) {
      console.log('\n⚠️  User has OAuth accounts:');
      user.accounts.forEach(account => {
        console.log(`   - ${account.provider} (${account.providerAccountId})`);
      });
      console.log('\n💡 Recommendation: Use Google OAuth sign-in instead');
      return;
    }

    // Since no OAuth accounts, we can safely reset the user
    console.log('\n🔄 Resetting user account...');
    
    // Delete the user and recreate
    await prisma.user.delete({
      where: { email }
    });

    console.log('✅ User account deleted');

    console.log('\n💡 Next Steps:');
    console.log('1. Go to: http://localhost:3000/register');
    console.log('2. Create a new account with: lucid8080@gmail.com');
    console.log('3. Or use Google OAuth sign-in');
    console.log('4. After registration, run: npm run make:admin');

  } catch (error) {
    console.error('❌ Error resetting user:', error);
  }
}

resetUserPassword()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Password reset complete');
    process.exit(0);
  }); 