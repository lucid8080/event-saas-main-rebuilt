import { prisma } from "../lib/db";

async function makeUserAdmin(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}...\n`);

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }

    console.log("👤 Found user:");
    console.log(`   Name: ${user.name || "Unnamed User"}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log("");

    if (user.role === "ADMIN") {
      console.log("ℹ️  User is already an ADMIN. No changes needed.");
      return;
    }

    // Update the user's role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("✅ Successfully updated user role to ADMIN!");
    console.log("");
    console.log("👑 Updated user details:");
    console.log(`   Name: ${updatedUser.name || "Unnamed User"}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   ID: ${updatedUser.id}`);
    console.log("");
    console.log("🎉 User now has admin privileges!");

  } catch (error) {
    console.error("❌ Error updating user role:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || "lucid8080@gmail.com";

if (!email) {
  console.log("❌ Please provide an email address as an argument.");
  console.log("Usage: npx tsx scripts/make-user-admin.ts <email>");
  process.exit(1);
}

// Run the script
makeUserAdmin(email); 