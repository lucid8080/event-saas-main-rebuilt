#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function autoFixEmailVerification() {
  console.log("🔧 Auto-Fixing Email Verification Issue");
  console.log("=======================================\n");

  try {
    // Step 1: Check current users
    console.log("1. Checking Current Users...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`     OAuth Accounts: ${user.accounts.length}`);
      if (user.accounts.length > 0) {
        user.accounts.forEach(account => {
          console.log(`       - ${account.provider}: ${account.providerAccountId}`);
        });
      }
      console.log("");
    });

    // Step 2: Auto-fix all users that need it
    console.log("2. Auto-Fixing Email Verification...");
    let fixedCount = 0;
    
    for (const user of users) {
      // Fix OAuth users (Google login)
      if (user.accounts.length > 0 && !user.emailVerified) {
        console.log(`   🔧 Auto-fixing OAuth user ${user.email}...`);
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(),
            },
          });
          console.log(`   ✅ Auto-fixed OAuth user ${user.email}`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Failed to auto-fix ${user.email}: ${error.message}`);
        }
      }
      
      // Fix admin users (even without OAuth)
      else if ((user.role === 'ADMIN' || user.role === 'HERO') && !user.emailVerified) {
        console.log(`   🔧 Auto-fixing admin user ${user.email}...`);
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(),
            },
          });
          console.log(`   ✅ Auto-fixed admin user ${user.email}`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Failed to auto-fix admin user ${user.email}: ${error.message}`);
        }
      }
      
      // Fix any other users with unverified emails (optional)
      else if (!user.emailVerified) {
        console.log(`   🔧 Auto-fixing regular user ${user.email}...`);
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(),
            },
          });
          console.log(`   ✅ Auto-fixed regular user ${user.email}`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Failed to auto-fix regular user ${user.email}: ${error.message}`);
        }
      }
    }
    console.log("");

    // Step 3: Verify the auto-fixes
    console.log("3. Verifying Auto-Fixes...");
    const updatedUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Updated users:`);
    updatedUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`     OAuth Accounts: ${user.accounts.length}`);
      console.log("");
    });

    // Step 4: Check for any remaining unverified users
    const stillUnverified = updatedUsers.filter(user => !user.emailVerified);
    if (stillUnverified.length > 0) {
      console.log("⚠️  WARNING: Some users still have unverified emails:");
      stillUnverified.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      console.log("");
    } else {
      console.log("✅ All users now have verified emails!");
    }

    // Step 5: Summary
    console.log("4. Auto-Fix Summary...");
    console.log(`   🔧 Total users auto-fixed: ${fixedCount}`);
    console.log("   ✅ Email verification issue should be resolved");
    console.log("   ✅ Authentication should now work properly");
    console.log("   ✅ Credit management API should function");
    console.log("");
    console.log("   🎯 Next Steps:");
    console.log("   1. Test the credit management functionality");
    console.log("   2. Verify authentication is working");
    console.log("   3. Check if the API error is resolved");
    console.log("   4. Log out and log back in to refresh session");

    // Step 6: Return success status
    return {
      success: true,
      fixedCount,
      totalUsers: users.length,
      allVerified: stillUnverified.length === 0
    };

  } catch (error) {
    console.error("❌ Auto-fix failed:", error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-execute the fix
console.log("🚀 Starting Auto Email Verification Fix...");
console.log("==========================================\n");

autoFixEmailVerification()
  .then((result) => {
    if (result.success) {
      console.log("\n🎉 Auto-fix completed successfully!");
      console.log(`   Fixed ${result.fixedCount} users`);
      console.log(`   Total users: ${result.totalUsers}`);
      console.log(`   All verified: ${result.allVerified ? 'Yes' : 'No'}`);
      
      if (result.allVerified) {
        console.log("\n✅ Authentication issue should now be resolved!");
        console.log("   You can now test the credit management functionality.");
      } else {
        console.log("\n⚠️  Some users still need manual verification.");
        console.log("   Check the output above for details.");
      }
    } else {
      console.log("\n❌ Auto-fix failed!");
      console.log(`   Error: ${result.error}`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Auto-fix crashed:", error);
    process.exit(1);
  }); 