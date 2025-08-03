import { PrismaClient } from '@prisma/client';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface AdminAccountData {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN';
  credits: number;
  ticketmasterFlyerEnabled: boolean;
  carouselMakerEnabled: boolean;
  watermarkEnabled: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  accounts: any[];
  sessions: any[];
}

async function preserveAdminAccount(adminEmail: string): Promise<void> {
  console.log(`🔄 Preserving admin account: ${adminEmail}\n`);

  try {
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        accounts: true,
        sessions: true,
      }
    });

    if (!adminUser) {
      throw new Error(`Admin user not found: ${adminEmail}`);
    }

    if (adminUser.role !== 'ADMIN') {
      throw new Error(`User ${adminEmail} is not an admin`);
    }

    // Create admin account data
    const adminData: AdminAccountData = {
      id: adminUser.id,
      email: adminUser.email!,
      name: adminUser.name!,
      role: 'ADMIN',
      credits: adminUser.credits,
      ticketmasterFlyerEnabled: adminUser.ticketmasterFlyerEnabled,
      carouselMakerEnabled: adminUser.carouselMakerEnabled,
      watermarkEnabled: adminUser.watermarkEnabled,
      stripeCustomerId: adminUser.stripeCustomerId || undefined,
      stripeSubscriptionId: adminUser.stripeSubscriptionId || undefined,
      stripePriceId: adminUser.stripePriceId || undefined,
      stripeCurrentPeriodEnd: adminUser.stripeCurrentPeriodEnd || undefined,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
      accounts: adminUser.accounts,
      sessions: adminUser.sessions,
    };

    // Create backup directory if it doesn't exist
    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    // Save admin account data
    const timestamp = new Date().toISOString();
    const fileName = `admin-account-${adminEmail.replace('@', '-at-')}-${timestamp.replace(/[:.]/g, '-')}.json`;
    const filePath = join(backupDir, fileName);

    writeFileSync(filePath, JSON.stringify(adminData, null, 2), 'utf8');

    console.log('✅ Admin account preserved successfully!');
    console.log(`📁 Saved to: ${filePath}`);
    console.log(`👤 Admin: ${adminData.email}`);
    console.log(`💰 Credits: ${adminData.credits}`);
    console.log(`⚙️ Features: ${Object.entries({
      ticketmasterFlyer: adminData.ticketmasterFlyerEnabled,
      carouselMaker: adminData.carouselMakerEnabled,
      watermark: adminData.watermarkEnabled,
    }).filter(([, enabled]) => enabled).map(([feature]) => feature).join(', ') || 'None'}`);

  } catch (error) {
    console.error('❌ Failed to preserve admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreAdminAccount(adminEmail: string, backupFile?: string): Promise<void> {
  console.log(`🔄 Restoring admin account: ${adminEmail}\n`);

  try {
    let adminData: AdminAccountData;
    const backupDir = join(process.cwd(), 'backups');

    if (backupFile) {
      // Use specified backup file
      const filePath = join(backupDir, backupFile);
      if (!existsSync(filePath)) {
        throw new Error(`Backup file not found: ${backupFile}`);
      }
      const fileContent = readFileSync(filePath, 'utf8');
      adminData = JSON.parse(fileContent);
    } else {
      // Find the most recent admin backup for this email
      const files = require('fs').readdirSync(backupDir)
        .filter((file: string) => file.includes(`admin-account-${adminEmail.replace('@', '-at-')}`))
        .sort()
        .reverse();

      if (files.length === 0) {
        throw new Error(`No admin backup found for: ${adminEmail}`);
      }

      const filePath = join(backupDir, files[0]);
      const fileContent = readFileSync(filePath, 'utf8');
      adminData = JSON.parse(fileContent);
      console.log(`📁 Using backup file: ${files[0]}`);
    }

    // Check if admin user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingUser) {
      // Update existing user to admin
      await prisma.user.update({
        where: { email: adminData.email },
        data: {
          role: 'ADMIN',
          credits: adminData.credits,
          ticketmasterFlyerEnabled: adminData.ticketmasterFlyerEnabled,
          carouselMakerEnabled: adminData.carouselMakerEnabled,
          watermarkEnabled: adminData.watermarkEnabled,
          stripeCustomerId: adminData.stripeCustomerId,
          stripeSubscriptionId: adminData.stripeSubscriptionId,
          stripePriceId: adminData.stripePriceId,
          stripeCurrentPeriodEnd: adminData.stripeCurrentPeriodEnd,
          updatedAt: new Date()
        }
      });
      console.log(`✅ Updated existing user to admin: ${adminData.email}`);
    } else {
      // Create new admin user
      await prisma.user.create({
        data: {
          email: adminData.email,
          name: adminData.name,
          role: 'ADMIN',
          credits: adminData.credits,
          ticketmasterFlyerEnabled: adminData.ticketmasterFlyerEnabled,
          carouselMakerEnabled: adminData.carouselMakerEnabled,
          watermarkEnabled: adminData.watermarkEnabled,
          stripeCustomerId: adminData.stripeCustomerId,
          stripeSubscriptionId: adminData.stripeSubscriptionId,
          stripePriceId: adminData.stripePriceId,
          stripeCurrentPeriodEnd: adminData.stripeCurrentPeriodEnd,
        }
      });
      console.log(`✅ Created new admin user: ${adminData.email}`);
    }

    console.log('\n✅ Admin account restored successfully!');
    console.log(`👤 Admin: ${adminData.email}`);
    console.log(`💰 Credits: ${adminData.credits}`);
    console.log(`⚙️ Features restored: ${Object.entries({
      ticketmasterFlyer: adminData.ticketmasterFlyerEnabled,
      carouselMaker: adminData.carouselMakerEnabled,
      watermark: adminData.watermarkEnabled,
    }).filter(([, enabled]) => enabled).map(([feature]) => feature).join(', ') || 'None'}`);

  } catch (error) {
    console.error('❌ Failed to restore admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function listAdminBackups(): Promise<void> {
  console.log('📋 Listing admin account backups...\n');

  try {
    const backupDir = join(process.cwd(), 'backups');
    
    if (!existsSync(backupDir)) {
      console.log('❌ No backup directory found.');
      return;
    }

    const files = require('fs').readdirSync(backupDir)
      .filter((file: string) => file.includes('admin-account-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('❌ No admin account backups found.');
      return;
    }

    console.log(`Found ${files.length} admin account backup(s):\n`);

    for (const file of files) {
      try {
        const filePath = join(backupDir, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const adminData: AdminAccountData = JSON.parse(fileContent);
        
        console.log(`📁 ${file}`);
        console.log(`   👤 Admin: ${adminData.email}`);
        console.log(`   📅 Created: ${new Date(adminData.createdAt).toLocaleString()}`);
        console.log(`   💰 Credits: ${adminData.credits}`);
        console.log(`   ⚙️ Features: ${Object.entries({
          ticketmasterFlyer: adminData.ticketmasterFlyerEnabled,
          carouselMaker: adminData.carouselMakerEnabled,
          watermark: adminData.watermarkEnabled,
        }).filter(([, enabled]) => enabled).map(([feature]) => feature).join(', ') || 'None'}`);
        console.log('');
      } catch (error) {
        console.log(`📁 ${file} (corrupted or invalid)`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to list admin backups:', error);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'preserve':
      if (!args[1]) {
        console.log('Usage: npx tsx scripts/admin-account-preservation.ts preserve <admin-email>');
        process.exit(1);
      }
      preserveAdminAccount(args[1])
        .then(() => {
          console.log('\n🎉 Admin account preservation completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Admin account preservation failed:', error);
          process.exit(1);
        });
      break;

    case 'restore':
      if (!args[1]) {
        console.log('Usage: npx tsx scripts/admin-account-preservation.ts restore <admin-email> [backup-file]');
        process.exit(1);
      }
      restoreAdminAccount(args[1], args[2])
        .then(() => {
          console.log('\n🎉 Admin account restoration completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Admin account restoration failed:', error);
          process.exit(1);
        });
      break;

    case 'list':
      listAdminBackups()
        .then(() => {
          console.log('\n🎉 Admin backup listing completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Admin backup listing failed:', error);
          process.exit(1);
        });
      break;

    case '--help':
    case '-h':
      console.log(`
Admin Account Preservation System

Usage: npx tsx scripts/admin-account-preservation.ts <command> [options]

Commands:
  preserve <admin-email>     Preserve admin account data
  restore <admin-email> [backup-file]  Restore admin account data
  list                      List all admin account backups

Examples:
  npx tsx scripts/admin-account-preservation.ts preserve admin@example.com
  npx tsx scripts/admin-account-preservation.ts restore admin@example.com
  npx tsx scripts/admin-account-preservation.ts restore admin@example.com admin-account-admin-at-example-com-2024-01-01.json
  npx tsx scripts/admin-account-preservation.ts list

This system ensures admin access is always preserved and can be restored quickly.
      `);
      process.exit(0);
      break;

    default:
      console.log('❌ Unknown command. Use --help for usage information.');
      process.exit(1);
  }
}

export { preserveAdminAccount, restoreAdminAccount, listAdminBackups }; 