#!/usr/bin/env tsx

import { prisma } from "../lib/db";

async function checkUserCredits() {
  console.log("🔍 User Credits Check");
  console.log("====================\n");

  try {
    // Get all users and their credit balances
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      const status = user.credits > 0 ? "✅" : "❌";
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Credits: ${user.credits} ${status}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log("");
    });

    // Check if any users have insufficient credits
    const usersWithNoCredits = users.filter(user => user.credits <= 0);
    
    if (usersWithNoCredits.length > 0) {
      console.log("⚠️  Users with insufficient credits:");
      usersWithNoCredits.forEach(user => {
        console.log(`   - ${user.email}: ${user.credits} credits`);
      });
      
      console.log("\n🔧 Would you like to add credits to these users? (y/n)");
      
      // For now, let's automatically add credits to users with 0 or negative credits
      console.log("Auto-adding 50 credits to users with insufficient credits...");
      
      for (const user of usersWithNoCredits) {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: 50 }
        });
        console.log(`✅ Added 50 credits to ${user.email}`);
      }
      
      console.log("\n🎉 Credit update complete!");
    } else {
      console.log("✅ All users have sufficient credits!");
    }

    // Show updated credit balances
    console.log("\n📊 Updated credit balances:");
    const updatedUsers = await prisma.user.findMany({
      select: {
        email: true,
        credits: true
      }
    });
    
    updatedUsers.forEach(user => {
      console.log(`   ${user.email}: ${user.credits} credits`);
    });

  } catch (error) {
    console.error("❌ Error checking user credits:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserCredits();
