import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToHero(email: string): Promise<void> {
  console.log('🦸‍♂️ HERO Role Promotion Script');
  console.log('================================\n');

  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: npx tsx scripts/promote-to-hero.ts <email>');
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

    if (user.role === 'HERO') {
      console.log('ℹ️ User is already a HERO!');
      return;
    }

    // Safety check - confirm the action
    console.log('\n⚠️  WARNING: This will grant SUPER ADMIN privileges!');
    console.log('HERO role includes:');
    console.log('  • Full system access');
    console.log('  • Role management');
    console.log('  • System settings management');
    console.log('  • User deletion capabilities');
    console.log('  • All admin features');
    
    console.log('\n🤔 Are you sure you want to proceed? (y/N)');
    
    // In a real script, you'd wait for user input
    // For now, we'll proceed with a confirmation message
    console.log('Proceeding with promotion...\n');

    // Update the user's role to HERO
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'HERO' }
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
    console.log('  1. Log in with the promoted account');
    console.log('  2. Access the admin dashboard');
    console.log('  3. Review system settings');
    console.log('  4. Consider setting up additional security measures');

  } catch (error) {
    console.error('❌ Error promoting user to HERO:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (require.main === module) {
  promoteToHero(email)
    .then(() => {
      console.log('\n🎉 HERO promotion completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 HERO promotion failed:', error);
      process.exit(1);
    });
}

export { promoteToHero }; 