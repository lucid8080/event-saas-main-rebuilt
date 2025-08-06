#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function fixEmailVerification() {
  console.log("🔧 Fixing Email Verification Issue");
  console.log("==================================\n");

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

    // Step 2: Fix email verification for OAuth users
    console.log("2. Fixing Email Verification for OAuth Users...");
    const oauthUsers = users.filter(user => user.accounts.length > 0);
    
    if (oauthUsers.length > 0) {
      console.log(`   Found ${oauthUsers.length} OAuth users to fix:`);
      
      for (const user of oauthUsers) {
        if (!user.emailVerified) {
          console.log(`   🔧 Fixing ${user.email}...`);
          
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                emailVerified: new Date(),
              },
            });
            
            console.log(`   ✅ Fixed ${user.email}`);
          } catch (error) {
            console.log(`   ❌ Failed to fix ${user.email}: ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${user.email} already verified`);
        }
      }
    } else {
      console.log("   No OAuth users found");
    }
    console.log("");

    // Step 3: Fix email verification for admin users (even without OAuth)
    console.log("3. Fixing Email Verification for Admin Users...");
    const adminUsers = users.filter(user => 
      (user.role === 'ADMIN' || user.role === 'HERO') && !user.emailVerified
    );
    
    if (adminUsers.length > 0) {
      console.log(`   Found ${adminUsers.length} admin users to fix:`);
      
      for (const user of adminUsers) {
        console.log(`   🔧 Fixing admin user ${user.email}...`);
        
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(),
            },
          });
          
          console.log(`   ✅ Fixed admin user ${user.email}`);
        } catch (error) {
          console.log(`   ❌ Failed to fix admin user ${user.email}: ${error.message}`);
        }
      }
    } else {
      console.log("   No unverified admin users found");
    }
    console.log("");

    // Step 4: Verify the fixes
    console.log("4. Verifying Fixes...");
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

    // Step 5: Check for any remaining unverified users
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

    // Step 6: Summary
    console.log("5. Summary...");
    console.log("   ✅ Email verification issue should be fixed");
    console.log("   ✅ OAuth users now have verified emails");
    console.log("   ✅ Admin users now have verified emails");
    console.log("");
    console.log("   🔧 Next Steps:");
    console.log("   1. Deploy this fix to production");
    console.log("   2. Test the credit management functionality");
    console.log("   3. Verify authentication is working");
    console.log("   4. Check if the API error is resolved");

  } catch (error) {
    console.error("❌ Fix failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixEmailVerification().catch(console.error); 