import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkOAuthAccount(email: string, providerAccountId: string) {
  console.log(`🔗 Linking OAuth account for email: ${email}`);
  console.log(`Provider Account ID: ${providerAccountId}\n`);

  try {
    // Find the user with the email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      console.log('❌ User not found with that email');
      return;
    }

    console.log(`Found user: ${user.id}`);
    console.log(`Current accounts: ${user.accounts.length}`);

    // Check if this OAuth account is already linked to another user
    const existingOAuthAccount = await prisma.account.findFirst({
      where: { 
        providerAccountId,
        provider: 'google'
      },
      include: { user: true },
    });

    if (existingOAuthAccount) {
      console.log(`⚠️  This Google account is already linked to: ${existingOAuthAccount.user.email}`);
      
      if (existingOAuthAccount.user.email === email) {
        console.log('✅ The account is already correctly linked!');
        return;
      } else {
        console.log('❌ Cannot link - this Google account is linked to a different email');
        return;
      }
    }

    // Create the OAuth account link
    const newAccount = await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: providerAccountId,
        refresh_token: null,
        access_token: null,
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null,
      },
    });

    console.log(`✅ Successfully linked OAuth account: ${newAccount.id}`);
    console.log(`User ${email} can now sign in with Google!`);

  } catch (error) {
    console.error('❌ Error linking OAuth account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function showLinkingOptions() {
  console.log('🔍 Current OAuth linking situation:\n');

  try {
    const users = await prisma.user.findMany({
      include: { accounts: true },
    });

    const emailPasswordUsers = users.filter(user => user.accounts.length === 0);
    const oauthUsers = users.filter(user => user.accounts.length > 0);

    console.log('📧 Email/Password Users (can be linked to OAuth):');
    emailPasswordUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });

    console.log('\n🔗 OAuth Users:');
    oauthUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
      user.accounts.forEach(account => {
        console.log(`    Provider: ${account.provider}, ID: ${account.providerAccountId}`);
      });
    });

    console.log('\n💡 To link an account, use:');
    console.log('   npx tsx scripts/link-oauth-account.ts <email> <providerAccountId>');

  } catch (error) {
    console.error('❌ Error showing linking options:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    linkOAuthAccount(args[0], args[1]);
  } else {
    showLinkingOptions();
  }
} 