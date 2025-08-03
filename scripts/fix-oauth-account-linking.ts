import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicateAccounts() {
  console.log('🔍 Checking for duplicate accounts...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });

    console.log(`Found ${users.length} total users\n`);

    // Group users by email
    const emailGroups = new Map<string, any[]>();
    
    users.forEach(user => {
      if (user.email) {
        if (!emailGroups.has(user.email)) {
          emailGroups.set(user.email, []);
        }
        emailGroups.get(user.email)!.push(user);
      }
    });

    // Find emails with multiple accounts
    const duplicates = Array.from(emailGroups.entries())
      .filter(([email, accounts]) => accounts.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate email accounts found');
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} emails with multiple accounts:\n`);

    duplicates.forEach(([email, accounts]) => {
      console.log(`📧 Email: ${email}`);
      console.log(`   Accounts: ${accounts.length}`);
      
      accounts.forEach((account, index) => {
        console.log(`   ${index + 1}. User ID: ${account.id}`);
        console.log(`      Name: ${account.name || 'N/A'}`);
        console.log(`      Created: ${account.createdAt}`);
        console.log(`      Auth Methods: ${account.accounts.map(acc => acc.provider).join(', ') || 'Email/Password'}`);
        console.log('');
      });
    });

    console.log('💡 Solutions:');
    console.log('1. Delete the duplicate account(s) manually from the database');
    console.log('2. Link the accounts by updating the OAuth provider');
    console.log('3. Use a different email address for the new account');
    console.log('4. Contact support for assistance\n');

    console.log('🔧 To delete a duplicate account, use:');
    console.log('   await prisma.user.delete({ where: { id: "USER_ID" } })');

  } catch (error) {
    console.error('❌ Error checking duplicate accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteUserById(userId: string) {
  try {
    console.log(`🗑️  Deleting user with ID: ${userId}`);
    
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`✅ Successfully deleted user: ${user.email}`);
  } catch (error) {
    console.error(`❌ Error deleting user ${userId}:`, error);
  }
}

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === 'delete' && args[1]) {
    deleteUserById(args[1]).then(() => process.exit(0));
  } else {
    checkDuplicateAccounts().then(() => process.exit(0));
  }
} 