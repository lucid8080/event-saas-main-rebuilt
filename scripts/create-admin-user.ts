import { prisma } from "../lib/db";

async function createAdminUser(email: string, name: string) {
  try {
    console.log(`🔍 Creating admin user: ${email}...\n`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${email} already exists.`);
      console.log(`   Current role: ${existingUser.role}`);
      
      if (existingUser.role !== "ADMIN") {
        console.log("🔄 Updating user role to ADMIN...");
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" }
        });
        console.log("✅ User role updated to ADMIN!");
      } else {
        console.log("ℹ️  User is already an ADMIN.");
      }
      return;
    }

    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role: "ADMIN",
        credits: 1000 // Give some initial credits
      }
    });

    console.log("✅ Successfully created admin user!");
    console.log("");
    console.log("👑 New admin user details:");
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Credits: ${newUser.credits}`);
    console.log("");
    console.log("🎉 Admin user is ready to access the admin panel!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || "lucid8080@gmail.com";
const name = process.argv[3] || "Lucid D";

if (!email) {
  console.log("❌ Please provide an email address as an argument.");
  console.log("Usage: npx tsx scripts/create-admin-user.ts <email> [name]");
  process.exit(1);
}

// Run the script
createAdminUser(email, name); 