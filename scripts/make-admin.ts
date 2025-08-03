#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('👑 Making User Admin...\n');

async function makeAdmin() {
  try {
    const email = 'lucid8080@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found. Please register first at http://localhost:3000/register');
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'HERO') {
      console.log('✅ User is already a HERO admin!');
      return;
    }

    // Update user to HERO role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'HERO' }
    });

    console.log(`✅ User role updated to: ${updatedUser.role}`);
    console.log('\n🎉 You are now a HERO admin!');
    console.log('\n💡 You can now access:');
    console.log('  - Gallery: http://localhost:3000/gallery');
    console.log('  - Admin Dashboard: http://localhost:3000/admin');
    console.log('  - All theme pages with your R2 images');

  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
}

makeAdmin()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Admin setup complete');
    process.exit(0);
  }); 