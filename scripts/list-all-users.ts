import { prisma } from "../lib/db";
import { format } from "date-fns";

async function listAllUsers() {
  try {
    console.log("🔍 Fetching all users from database...\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        _count: {
          select: {
            generatedImages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (users.length === 0) {
      console.log("❌ No users found in the database.");
      return;
    }

    console.log(`📊 Found ${users.length} user(s) in the system:\n`);

    // Calculate statistics
    const adminCount = users.filter(user => user.role === "ADMIN").length;
    const userCount = users.filter(user => user.role === "USER").length;
    const totalImages = users.reduce((sum, user) => sum + user._count.generatedImages, 0);
    const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);
    const activeSubscriptions = users.filter(user => 
      user.stripeSubscriptionId && 
      user.stripeCurrentPeriodEnd && 
      new Date(user.stripeCurrentPeriodEnd) > new Date()
    ).length;

    console.log("📈 SYSTEM STATISTICS:");
    console.log(`   • Total Users: ${users.length}`);
    console.log(`   • Admins: ${adminCount}`);
    console.log(`   • Regular Users: ${userCount}`);
    console.log(`   • Total Images Generated: ${totalImages}`);
    console.log(`   • Total Credits: ${totalCredits}`);
    console.log(`   • Active Subscriptions: ${activeSubscriptions}`);
    console.log("");

    console.log("👥 USER DETAILS:");
    console.log("=".repeat(120));

    users.forEach((user, index) => {
      const isSubscriptionActive = user.stripeCurrentPeriodEnd && 
        new Date(user.stripeCurrentPeriodEnd) > new Date();
      
      const subscriptionStatus = user.stripeSubscriptionId 
        ? (isSubscriptionActive ? "🟢 ACTIVE" : "🔴 EXPIRED")
        : "⚪ NONE";

      console.log(`${index + 1}. ${user.name || "Unnamed User"}`);
      console.log(`   📧 Email: ${user.email || "No email"}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   👑 Role: ${user.role === "ADMIN" ? "👑 ADMIN" : "👤 USER"}`);
      console.log(`   💰 Credits: ${user.credits}`);
      console.log(`   🖼️  Images Generated: ${user._count.generatedImages}`);
      console.log(`   📅 Joined: ${format(new Date(user.createdAt), "MMM dd, yyyy 'at' h:mm a")}`);
      console.log(`   💳 Subscription: ${subscriptionStatus}`);
      
      if (user.stripeCustomerId) {
        console.log(`   🆔 Stripe Customer: ${user.stripeCustomerId}`);
      }
      
      if (user.stripeSubscriptionId) {
        console.log(`   🔗 Stripe Subscription: ${user.stripeSubscriptionId}`);
      }
      
      if (user.stripeCurrentPeriodEnd) {
        console.log(`   ⏰ Period Ends: ${format(new Date(user.stripeCurrentPeriodEnd), "MMM dd, yyyy")}`);
      }
      
      console.log("");
    });

    console.log("=".repeat(120));
    console.log("✅ User listing completed successfully!");

  } catch (error) {
    console.error("❌ Error fetching users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
listAllUsers(); 