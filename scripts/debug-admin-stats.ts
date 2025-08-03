#!/usr/bin/env tsx

import { prisma } from "@/lib/db";

async function debugAdminStats() {
  console.log("🔍 Debugging Admin Stats API...\n");

  try {
    // Test database connection
    console.log("1. Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful\n");

    // Check if we have any users
    console.log("2. Checking user data...");
    const totalUsers = await prisma.user.count();
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
    const totalImages = await prisma.generatedImage.count();
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Admins: ${totalAdmins}`);
    console.log(`   Total Images: ${totalImages}\n`);

    // Check subscription data
    console.log("3. Checking subscription data...");
    const activeSubscriptions = await prisma.user.count({
      where: {
        stripeSubscriptionId: { not: null },
        stripeCurrentPeriodEnd: { gt: new Date() },
      },
    });
    console.log(`   Active Subscriptions: ${activeSubscriptions}\n`);

    // Check monthly user growth
    console.log("4. Checking monthly user growth...");
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });
    
    const newUsersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    console.log(`   New Users This Month: ${newUsersThisMonth}`);
    console.log(`   New Users Last Month: ${newUsersLastMonth}`);

    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;
    console.log(`   User Growth: ${Math.round(userGrowth * 10) / 10}%\n`);

    // Check for any admin users
    console.log("5. Checking admin users...");
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found!");
      console.log("   This could be why the admin dashboard is not loading data.");
      console.log("   Make sure you have at least one user with role: 'ADMIN'");
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Created: ${user.createdAt.toDateString()}`);
      });
    }

    // Test the exact API endpoint logic
    console.log("\n6. Testing API endpoint logic...");
    const stats = {
      totalUsers,
      totalAdmins,
      totalImages,
      activeSubscriptions,
      newUsersThisMonth,
      userGrowth: Math.round(userGrowth * 10) / 10,
    };

    console.log("✅ API Response would be:", JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error("❌ Error during debugging:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug function
debugAdminStats().catch(console.error); 