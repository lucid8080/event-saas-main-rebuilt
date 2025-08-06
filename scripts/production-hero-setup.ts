import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupProductionHero(email: string): Promise<void> {
  console.log('🦸‍♂️ Production Hero Setup Script');
  console.log('==================================\n');

  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: npx tsx scripts/production-hero-setup.ts <email>');
    console.log('Example: npx tsx scripts/production-hero-setup.ts lucid8080@gmail.com');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('\n💡 To create a new user:');
      console.log('   1. Go to your production website');
      console.log('   2. Register with the email address');
      console.log('   3. Run this script again');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`📊 Current role: ${user.role}`);
    console.log(`🆔 User ID: ${user.id}`);

    if (user.role === 'HERO') {
      console.log('ℹ️ User is already a HERO!');
      console.log('\n🎉 You can now:');
      console.log('   • Access admin dashboard at /admin');
      console.log('   • Manage blog posts at /admin/blog');
      console.log('   • View analytics and user management');
      return;
    }

    // Safety confirmation
    console.log('\n⚠️  WARNING: This will grant SUPER ADMIN privileges!');
    console.log('HERO role includes:');
    console.log('  • Full system access');
    console.log('  • Role management');
    console.log('  • System settings management');
    console.log('  • User deletion capabilities');
    console.log('  • All admin features');
    
    console.log('\n🤔 Proceeding with promotion...\n');

    // Update the user's role to HERO
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: 'HERO',
        updatedAt: new Date() // Force session refresh
      }
    });

    console.log('🎉 SUCCESS! User promoted to HERO role!');
    console.log(`👤 User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`🦸‍♂️ New Role: ${updatedUser.role}`);
    console.log(`🆔 User ID: ${updatedUser.id}`);
    
    console.log('\n🔐 HERO privileges granted:');
    console.log('  ✅ Full system access');
    console.log('  ✅ Role management');
    console.log('  ✅ System settings');
    console.log('  ✅ User management');
    console.log('  ✅ Content moderation');
    console.log('  ✅ Analytics access');
    console.log('  ✅ Billing management');
    console.log('  ✅ R2 storage management');

    console.log('\n💡 Next steps:');
    console.log('  1. Sign out of your production website');
    console.log('  2. Clear your browser cache/cookies');
    console.log('  3. Sign in again with Google OAuth');
    console.log('  4. You should now see "Admin Panel" in the sidebar');
    console.log('  5. Access admin dashboard at /admin');

    console.log('\n🔗 Admin URLs to test:');
    console.log('  - Admin Dashboard: /admin');
    console.log('  - Blog Posts: /admin/blog');
    console.log('  - Gallery: /gallery');
    console.log('  - User Management: /admin/users');

    console.log('\n🛡️ Security reminder:');
    console.log('  • Keep your credentials secure');
    console.log('  • Consider setting up 2FA if available');
    console.log('  • Monitor admin activities regularly');

  } catch (error) {
    console.error('❌ Error setting up hero account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (require.main === module) {
  setupProductionHero(email)
    .then(() => {
      console.log('\n🎉 Production hero setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Production hero setup failed:', error);
      process.exit(1);
    });
}

export { setupProductionHero }; 