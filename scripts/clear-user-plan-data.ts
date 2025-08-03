import { prisma } from '@/lib/db';

async function clearUserPlanData(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        credits: true,
      }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log('📊 Current plan data:');
    console.log(`  - Stripe Customer ID: ${user.stripeCustomerId || 'None'}`);
    console.log(`  - Stripe Subscription ID: ${user.stripeSubscriptionId || 'None'}`);
    console.log(`  - Stripe Price ID: ${user.stripePriceId || 'None'}`);
    console.log(`  - Current Period End: ${user.stripeCurrentPeriodEnd || 'None'}`);
    console.log(`  - Credits: ${user.credits || 0}`);

    // Clear all plan-related data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        credits: 0, // Reset credits to 0
      },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        credits: true,
      }
    });

    console.log('\n✅ Plan data cleared successfully!');
    console.log('📊 Updated user data:');
    console.log(`  - Stripe Customer ID: ${updatedUser.stripeCustomerId || 'None'}`);
    console.log(`  - Stripe Subscription ID: ${updatedUser.stripeSubscriptionId || 'None'}`);
    console.log(`  - Stripe Price ID: ${updatedUser.stripePriceId || 'None'}`);
    console.log(`  - Current Period End: ${updatedUser.stripeCurrentPeriodEnd || 'None'}`);
    console.log(`  - Credits: ${updatedUser.credits}`);

    console.log('\n🎯 User is now on the free plan with 0 credits');

  } catch (error) {
    console.error('❌ Error clearing user plan data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address as an argument');
  console.log('Usage: npx tsx scripts/clear-user-plan-data.ts <email>');
  process.exit(1);
}

// Run the script
clearUserPlanData(email); 