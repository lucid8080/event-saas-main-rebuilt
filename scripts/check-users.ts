import { prisma } from "../lib/db";

async function checkUsers() {
  try {
    console.log("👥 Checking users in database...\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
    });

    // Check for admin users specifically
    const adminUsers = users.filter(user => user.role === 'ADMIN');
    console.log(`\n🔑 Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log("⚠️  No admin users found!");
    } else {
      adminUsers.forEach(user => {
        console.log(`- ${user.email}`);
      });
    }

    // Check for HERO users
    const heroUsers = users.filter(user => user.role === 'HERO');
    console.log(`\n⭐ HERO users: ${heroUsers.length}`);
    
    if (heroUsers.length === 0) {
      console.log("⚠️  No HERO users found!");
    } else {
      heroUsers.forEach(user => {
        console.log(`- ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkUsers(); 