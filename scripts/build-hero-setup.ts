import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupHeroDuringBuild() {
  const email = 'lucid8080@gmail.com';
  
  try {
    console.log('🦸‍♂️ Build-time HERO Setup Script');
    console.log('================================\n');
    
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
      console.log('❌ User not found in database');
      console.log('💡 User will need to register first on the production site');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === 'HERO') {
      console.log('🎉 User already has HERO privileges!');
      return;
    }

    console.log('⚠️  Granting HERO (Super Admin) privileges...');

    // Update user to HERO role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: 'HERO',
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      }
    });

    console.log('🎉 SUCCESS! HERO privileges granted!');
    console.log(`👤 User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`🦸‍♂️ New Role: ${updatedUser.role}`);

  } catch (error) {
    console.error('❌ Error during build-time HERO setup:', error);
    // Don't fail the build, just log the error
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setupHeroDuringBuild()
  .then(() => {
    console.log('✅ Build-time HERO setup completed');
  })
  .catch((error) => {
    console.error('❌ Build-time HERO setup failed:', error);
  }); 