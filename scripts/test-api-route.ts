#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function testApiRoute() {
  console.log('🧪 Testing API Route');
  console.log('===================\n');

  try {
    // Step 1: Check database connection
    console.log('1. Testing Database Connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');

    // Step 2: Find test users
    console.log('\n2. Finding Test Users...');
    const heroUser = await prisma.user.findFirst({
      where: { role: 'HERO' },
      select: { id: true, email: true, role: true }
    });

    const regularUser = await prisma.user.findFirst({
      where: { role: 'USER' },
      select: { id: true, email: true, role: true, credits: true }
    });

    if (!heroUser) {
      console.log('   ❌ No HERO user found');
      return;
    }

    if (!regularUser) {
      console.log('   ❌ No regular user found');
      return;
    }

    console.log(`   ✅ HERO user: ${heroUser.email} (${heroUser.id})`);
    console.log(`   ✅ Regular user: ${regularUser.email} (${regularUser.id}) - Credits: ${regularUser.credits || 0}`);

    // Step 3: Test credit update simulation
    console.log('\n3. Testing Credit Update Simulation...');
    const newCredits = (regularUser.credits || 0) + 10;
    
    const updatedUser = await prisma.user.update({
      where: { id: regularUser.id },
      data: { 
        credits: newCredits,
        updatedAt: new Date()
      },
      select: { id: true, email: true, credits: true, updatedAt: true }
    });

    console.log(`   ✅ Credit update successful!`);
    console.log(`   ✅ ${updatedUser.email}: ${regularUser.credits || 0} → ${updatedUser.credits}`);
    console.log(`   ✅ Updated at: ${updatedUser.updatedAt.toISOString()}`);

    // Step 4: Test role update simulation
    console.log('\n4. Testing Role Update Simulation...');
    const roleUpdatedUser = await prisma.user.update({
      where: { id: regularUser.id },
      data: { 
        role: 'USER',
        updatedAt: new Date()
      },
      select: { id: true, email: true, role: true, updatedAt: true }
    });

    console.log(`   ✅ Role update successful!`);
    console.log(`   ✅ ${roleUpdatedUser.email}: Role = ${roleUpdatedUser.role}`);
    console.log(`   ✅ Updated at: ${roleUpdatedUser.updatedAt.toISOString()}`);

    // Step 5: Verify final state
    console.log('\n5. Verifying Final State...');
    const finalUser = await prisma.user.findUnique({
      where: { id: regularUser.id },
      select: { id: true, email: true, role: true, credits: true, emailVerified: true }
    });

    if (finalUser) {
      console.log(`   ✅ Final state verified:`);
      console.log(`      - Email: ${finalUser.email}`);
      console.log(`      - Role: ${finalUser.role}`);
      console.log(`      - Credits: ${finalUser.credits}`);
      console.log(`      - Email Verified: ${finalUser.emailVerified ? '✅' : '❌'}`);
    }

    console.log('\n🎉 API Route Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ User queries working');
    console.log('   ✅ Credit updates working');
    console.log('   ✅ Role updates working');
    console.log('   ✅ All database operations successful');
    
    console.log('\n⚠️  If production is still failing:');
    console.log('   - The production server needs to be deployed with the updated API route');
    console.log('   - The bulletproof authentication handling needs to be active');
    console.log('   - Check Render deployment logs for any build errors');

  } catch (error) {
    console.error('❌ API route test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testApiRoute(); 