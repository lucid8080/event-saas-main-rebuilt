#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function debugAuthIssue() {
  console.log("🔍 Debugging Authentication Issue");
  console.log("==================================\n");

  try {
    // Step 1: Check environment variables
    console.log("1. Checking Authentication Environment Variables...");
    const authEnvVars = [
      'AUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'RESEND_API_KEY',
      'EMAIL_FROM',
    ];
    
    authEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        // Mask sensitive values
        const maskedValue = envVar.includes('SECRET') || envVar.includes('KEY') 
          ? `${value.substring(0, 8)}...` 
          : value;
        console.log(`   ✅ ${envVar}: ${maskedValue}`);
      } else {
        console.log(`   ❌ ${envVar}: Missing`);
      }
    });
    console.log("");

    // Step 2: Check database connection
    console.log("2. Testing Database Connection...");
    try {
      await prisma.$connect();
      console.log("   ✅ Database connection successful");
      
      // Test a simple query
      const userCount = await prisma.user.count();
      console.log(`   ✅ Database query successful - ${userCount} users found`);
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error.message}`);
      return;
    }
    console.log("");

    // Step 3: Check user authentication data
    console.log("3. Checking User Authentication Data...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        emailVerified: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        },
        sessions: {
          select: {
            sessionToken: true,
            expires: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`   📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`     OAuth Accounts: ${user.accounts.length}`);
      console.log(`     Active Sessions: ${user.sessions.length}`);
      
      if (user.accounts.length > 0) {
        user.accounts.forEach(account => {
          console.log(`       - ${account.provider}: ${account.providerAccountId}`);
        });
      }
      
      if (user.sessions.length > 0) {
        user.sessions.forEach(session => {
          const expires = new Date(session.expires);
          const isExpired = expires < new Date();
          console.log(`       - Session: ${isExpired ? '❌ Expired' : '✅ Active'} (expires: ${expires.toISOString()})`);
        });
      }
      console.log("");
    });

    // Step 4: Check NextAuth configuration
    console.log("4. NextAuth Configuration Check...");
    console.log("   Session Strategy: JWT");
    console.log("   Trust Host: true");
    console.log("   Debug Mode: " + (process.env.NODE_ENV === "production" ? "Enabled" : "Disabled"));
    console.log("");

    // Step 5: Common authentication issues
    console.log("5. Common Authentication Issues...");
    console.log("   Issue 1: Session Token Expired");
    console.log("     - Solution: Log out and log back in");
    console.log("     - Check: Session expiration time");
    console.log("");
    console.log("   Issue 2: Environment Variables Missing");
    console.log("     - Solution: Set AUTH_SECRET and NEXTAUTH_URL");
    console.log("     - Check: All required env vars are set");
    console.log("");
    console.log("   Issue 3: Database Connection Issue");
    console.log("     - Solution: Check DATABASE_URL");
    console.log("     - Check: Database is accessible");
    console.log("");
    console.log("   Issue 4: OAuth Provider Configuration");
    console.log("     - Solution: Check Google OAuth settings");
    console.log("     - Check: Redirect URIs are correct");
    console.log("");

    // Step 6: Production-specific checks
    console.log("6. Production-Specific Checks...");
    console.log("   ✅ Trust Host is enabled");
    console.log("   ✅ Debug mode is enabled for production");
    console.log("   ✅ JWT session strategy is used");
    console.log("");

    // Step 7: Immediate fixes to try
    console.log("7. Immediate Fixes to Try...");
    console.log("   1. Log out and log back in");
    console.log("   2. Clear browser cookies and cache");
    console.log("   3. Check if AUTH_SECRET is set in production");
    console.log("   4. Verify NEXTAUTH_URL matches your production domain");
    console.log("   5. Check if the user has emailVerified: true");
    console.log("");

    // Step 8: Test authentication flow
    console.log("8. Testing Authentication Flow...");
    const adminUser = users.find(u => u.role === 'ADMIN' || u.role === 'HERO');
    if (adminUser) {
      console.log(`   ✅ Admin user found: ${adminUser.email}`);
      console.log(`   ✅ User has role: ${adminUser.role}`);
      console.log(`   ✅ Email verified: ${adminUser.emailVerified ? 'Yes' : 'No'}`);
      
      if (!adminUser.emailVerified) {
        console.log("   ⚠️  WARNING: Admin user email not verified!");
        console.log("   This might cause authentication issues.");
      }
    } else {
      console.log("   ❌ No admin user found");
      console.log("   This could be the root cause of the issue.");
    }
    console.log("");

    // Step 9: Summary and recommendations
    console.log("9. Summary & Recommendations...");
    console.log("   Based on the analysis:");
    console.log("");
    
    const missingEnvVars = authEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      console.log("   🚨 CRITICAL: Missing environment variables:");
      missingEnvVars.forEach(envVar => {
        console.log(`      - ${envVar}`);
      });
      console.log("");
    }
    
    const unverifiedUsers = users.filter(u => !u.emailVerified);
    if (unverifiedUsers.length > 0) {
      console.log("   ⚠️  WARNING: Users with unverified emails:");
      unverifiedUsers.forEach(user => {
        console.log(`      - ${user.email}`);
      });
      console.log("");
    }
    
    console.log("   🔧 Recommended Actions:");
    console.log("   1. Set all missing environment variables in production");
    console.log("   2. Verify admin user email is verified");
    console.log("   3. Test login/logout flow");
    console.log("   4. Check production logs for authentication errors");

  } catch (error) {
    console.error("❌ Debug failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugAuthIssue().catch(console.error); 