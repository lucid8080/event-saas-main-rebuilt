#!/usr/bin/env tsx

import { prisma } from "@/lib/db";

async function checkUserRoles() {
  console.log("🔍 Checking User Roles...\n");

  try {
    await prisma.$connect();
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        name: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${users.length} user(s):\n`);

    if (users.length === 0) {
      console.log("❌ No users found in database!");
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'}`);
      console.log(`   Name: ${user.name || 'No name'}`);
      console.log(`   Role: ${user.role || 'No role'}`);
      console.log(`   Created: ${user.createdAt.toDateString()}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });

    const adminUsers = users.filter(u => u.role === 'ADMIN');
    const heroUsers = users.filter(u => u.role === 'HERO');
    const regularUsers = users.filter(u => !u.role || u.role === 'USER');

    console.log("📊 Role Summary:");
    console.log(`   Admin Users: ${adminUsers.length}`);
    console.log(`   Hero Users: ${heroUsers.length}`);
    console.log(`   Regular Users: ${regularUsers.length}`);

    if (adminUsers.length === 0) {
      console.log("\n❌ No admin users found!");
      console.log("   To fix the admin dashboard, you need to:");
      console.log("   1. Create a user with role: 'ADMIN'");
      console.log("   2. Or update an existing user's role to 'ADMIN'");
      
      if (users.length > 0) {
        console.log("\n💡 Suggested fix - Update first user to admin:");
        console.log(`   UPDATE "User" SET role = 'ADMIN' WHERE id = '${users[0].id}';`);
      }
    }

  } catch (error) {
    console.error("❌ Error checking user roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles().catch(console.error); 