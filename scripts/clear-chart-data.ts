import { prisma } from "../lib/db";

async function clearChartData() {
  console.log("🧹 Clearing chart data and preparing for fresh statistics tracking...");

  try {
    // Clear any existing statistics data
    await prisma.userActivity.deleteMany({});
    await prisma.imageGenerationStats.deleteMany({});
    
    console.log("✅ Cleared all existing statistics data");
    console.log("📊 System is now ready to track new statistics");
    console.log("📈 Charts will populate as users interact with the system");
    
  } catch (error) {
    console.error("❌ Error clearing chart data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearChartData(); 