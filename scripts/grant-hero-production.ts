import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantHeroProduction() {
  const email = 'lucid8080@gmail.com';
  
  try {
    console.log('🦸‍♂️ Production HERO Rights Grant Script');
    console.log('========================================\n');
    
    console.log(`🔍 Looking for user: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      console.log('❌ User not found in production database');
      console.log('\n💡 Solutions:');
      console.log('1. Make sure you have registered on the production site');
      console.log('2. Check if the email is correct');
      console.log('3. Try signing in with Google OAuth first');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Updated: ${user.updatedAt}`);

    if (user.role === 'HERO') {
      console.log('\n🎉 User already has HERO privileges!');
      console.log('\n💡 If you still can\'t access admin features:');
      console.log('1. Sign out completely');
      console.log('2. Clear browser cache/cookies');
      console.log('3. Sign in again');
      console.log('4. Check for "Admin Panel" in the sidebar');
      return;
    }

    console.log('\n⚠️  Granting HERO (Super Admin) privileges...');
    console.log('This will give you full system access including:');
    console.log('  • Role management');
    console.log('  • System settings');
    console.log('  • User deletion capabilities');
    console.log('  • All admin features');

    // Update user to HERO role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: 'HERO',
        updatedAt: new Date() // Force session refresh
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      }
    });

    console.log('\n🎉 SUCCESS! HERO privileges granted!');
    console.log(`👤 User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`🦸‍♂️ New Role: ${updatedUser.role}`);
    console.log(`🆔 User ID: ${updatedUser.id}`);
    console.log(`🕒 Updated: ${updatedUser.updatedAt}`);

    console.log('\n🔐 HERO privileges include:');
    console.log('  ✅ Full system access');
    console.log('  ✅ Role management');
    console.log('  ✅ System settings');
    console.log('  ✅ User management');
    console.log('  ✅ Content moderation');
    console.log('  ✅ Analytics access');
    console.log('  ✅ Billing management');
    console.log('  ✅ R2 storage management');

    console.log('\n💡 Next steps:');
    console.log('1. Sign out of your production website');
    console.log('2. Clear your browser cache/cookies');
    console.log('3. Sign in again with Google OAuth');
    console.log('4. You should now see "Admin Panel" in the sidebar');
    console.log('5. Access admin dashboard at /admin');

    console.log('\n🔗 Admin URLs to test:');
    console.log('  - Admin Dashboard: /admin');
    console.log('  - Blog Posts: /admin/blog');
    console.log('  - Gallery: /gallery');
    console.log('  - User Management: /admin/users');

    console.log('\n🛡️ Security reminder:');
    console.log('  • Keep your credentials secure');
    console.log('  • Monitor admin activities regularly');
    console.log('  • Consider setting up 2FA if available');

  } catch (error) {
    console.error('❌ Error granting HERO rights:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check database connection');
    console.log('2. Verify environment variables');
    console.log('3. Check if user exists');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
grantHeroProduction()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 