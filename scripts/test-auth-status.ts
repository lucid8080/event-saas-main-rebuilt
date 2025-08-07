#!/usr/bin/env tsx

/**
 * Test Authentication Status
 * 
 * This script tests the authentication status to understand why req.auth is undefined
 */

import { prisma } from "@/lib/db";

async function testAuthStatus() {
  console.log('🔍 TESTING AUTHENTICATION STATUS');
  console.log('================================');
  
  try {
    // Check if there are any users in the database
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ['HERO', 'ADMIN'] },
        emailVerified: { not: null }
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        emailVerified: true
      }
    });
    
    console.log(`📊 Admin users found: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Verified: ${!!user.emailVerified}`);
    });
    
    // Check for any users with sessions
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });
    
    console.log('\n📊 Recent users:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });
    
    // Test database connection
    console.log('\n🔧 Testing database connection...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
  } catch (error) {
    console.error('❌ Error testing auth status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testAuthStatus().catch(console.error);
} 