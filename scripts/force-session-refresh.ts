import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceSessionRefresh(email: string): Promise<void> {
  console.log('🔄 Force Session Refresh Script');
  console.log('================================\n');

  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: npx tsx scripts/force-session-refresh.ts <email>');
    process.exit(1);
  }

  try {
    // Find the user
    console.log(`🔍 Looking for user with email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`📊 Current role: ${user.role}`);
    console.log(`🆔 User ID: ${user.id}`);

    // Update the user's updatedAt timestamp to force session refresh
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        updatedAt: new Date() // This will force a session refresh
      }
    });

    console.log('🎉 Session refresh triggered!');
    console.log(`👤 User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`🦸‍♂️ Role: ${updatedUser.role}`);
    console.log(`🕒 Updated: ${updatedUser.updatedAt}`);
    
    console.log('\n💡 Next steps:');
    console.log('  1. Sign out of your application completely');
    console.log('  2. Clear your browser cache/cookies');
    console.log('  3. Sign in again with Google OAuth');
    console.log('  4. You should now see admin/hero privileges');
    console.log('  5. Check the sidebar for "Admin Panel"');

    console.log('\n🔗 Admin URLs to test:');
    console.log('  - Admin Dashboard: /admin');
    console.log('  - Blog Posts: /admin/blog');
    console.log('  - Gallery: /gallery');

  } catch (error) {
    console.error('❌ Error refreshing session:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (require.main === module) {
  forceSessionRefresh(email)
    .then(() => {
      console.log('\n🎉 Session refresh completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Session refresh failed:', error);
      process.exit(1);
    });
}

export { forceSessionRefresh }; 