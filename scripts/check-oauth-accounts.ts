import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOAuthAccounts() {
  console.log('🔍 Checking OAuth accounts...\n');

  try {
    // Get all OAuth accounts
    const accounts = await prisma.account.findMany({
      include: {
        user: true,
      },
    });

    console.log(`Found ${accounts.length} OAuth accounts\n`);

    if (accounts.length === 0) {
      console.log('No OAuth accounts found');
      return;
    }

    // Group by provider
    const providerGroups = new Map<string, any[]>();
    
    accounts.forEach(account => {
      if (!providerGroups.has(account.provider)) {
        providerGroups.set(account.provider, []);
      }
      providerGroups.get(account.provider)!.push(account);
    });

    console.log('📊 OAuth Accounts by Provider:');
    providerGroups.forEach((accounts, provider) => {
      console.log(`\n${provider.toUpperCase()}: ${accounts.length} accounts`);
      
      accounts.forEach(account => {
        console.log(`  - User: ${account.user.email} (${account.user.id})`);
        console.log(`    Provider Account ID: ${account.providerAccountId}`);
        console.log(`    Created: ${account.createdAt}`);
      });
    });

    // Check for potential conflicts
    console.log('\n🔍 Checking for potential OAuth conflicts...\n');

    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });

    const usersWithOAuth = users.filter(user => user.accounts.length > 0);
    const usersWithoutOAuth = users.filter(user => user.accounts.length === 0);

    console.log(`Users with OAuth accounts: ${usersWithOAuth.length}`);
    console.log(`Users without OAuth accounts: ${usersWithoutOAuth.length}`);

    if (usersWithoutOAuth.length > 0) {
      console.log('\n📧 Users without OAuth accounts (potential email/password users):');
      usersWithoutOAuth.forEach(user => {
        console.log(`  - ${user.email} (${user.id}) - Created: ${user.createdAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking OAuth accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  checkOAuthAccounts().then(() => process.exit(0));
} 