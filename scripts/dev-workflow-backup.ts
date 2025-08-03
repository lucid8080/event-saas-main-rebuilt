#!/usr/bin/env node

import { createDataBackup } from './data-preservation-backup';
import { restoreDataBackup } from './data-preservation-restore';
import { preserveAdminAccount } from './admin-account-preservation';
import { restoreAdminAccount } from './admin-account-preservation';
import { execSync } from 'child_process';

interface WorkflowOptions {
  adminEmail?: string;
  dryRun?: boolean;
  skipImages?: boolean;
  skipAnalytics?: boolean;
}

async function createDevelopmentBackup(options: WorkflowOptions = {}): Promise<void> {
  console.log('🚀 Starting development backup workflow...\n');

  const { adminEmail } = options;

  try {
    // 1. Create comprehensive data backup
    console.log('📦 Step 1: Creating comprehensive data backup...');
    await createDataBackup();

    // 2. Create admin account backup (if email provided)
    if (adminEmail) {
      console.log(`\n👑 Step 2: Creating admin account backup for ${adminEmail}...`);
      await preserveAdminAccount(adminEmail);
    }

    console.log('\n✅ Development backup completed successfully!');
    console.log('💡 You can now safely make database changes.');
    console.log('🔄 To restore after changes: npx tsx scripts/dev-workflow-backup.ts restore');

  } catch (error) {
    console.error('❌ Development backup failed:', error);
    throw error;
  }
}

async function restoreDevelopmentData(options: WorkflowOptions = {}): Promise<void> {
  console.log('🔄 Starting development data restoration...\n');

  const { adminEmail, dryRun = false, skipImages = false, skipAnalytics = false } = options;

  try {
    // 1. Restore comprehensive data
    console.log('📦 Step 1: Restoring comprehensive data...');
    await restoreDataBackup({
      dryRun,
      skipImages,
      skipAnalytics
    });

    // 2. Restore admin account (if email provided)
    if (adminEmail) {
      console.log(`\n👑 Step 2: Restoring admin account for ${adminEmail}...`);
      await restoreAdminAccount(adminEmail);
    }

    console.log('\n✅ Development data restoration completed successfully!');

  } catch (error) {
    console.error('❌ Development data restoration failed:', error);
    throw error;
  }
}

async function quickAdminRestore(adminEmail: string): Promise<void> {
  console.log(`⚡ Quick admin restore for: ${adminEmail}\n`);

  try {
    await restoreAdminAccount(adminEmail);
    console.log('\n✅ Quick admin restore completed!');
  } catch (error) {
    console.error('❌ Quick admin restore failed:', error);
    throw error;
  }
}

async function checkBackupStatus(): Promise<void> {
  console.log('📊 Checking backup status...\n');

  try {
    const { readdirSync, existsSync } = require('fs');
    const { join } = require('path');

    const backupDir = join(process.cwd(), 'backups');
    
    if (!existsSync(backupDir)) {
      console.log('❌ No backup directory found.');
      return;
    }

    const files = readdirSync(backupDir);
    const backupFiles = files.filter((file: string) => file.endsWith('.json'));
    const adminBackups = files.filter((file: string) => file.includes('admin-account-'));
    const dataBackups = files.filter((file: string) => file.startsWith('backup-'));

    console.log(`📁 Backup directory: ${backupDir}`);
    console.log(`📦 Total backup files: ${backupFiles.length}`);
    console.log(`👑 Admin account backups: ${adminBackups.length}`);
    console.log(`📊 Data backups: ${dataBackups.length}`);

    if (dataBackups.length > 0) {
      const latestDataBackup = dataBackups.sort().reverse()[0];
      console.log(`🕒 Latest data backup: ${latestDataBackup}`);
    }

    if (adminBackups.length > 0) {
      const latestAdminBackup = adminBackups.sort().reverse()[0];
      console.log(`🕒 Latest admin backup: ${latestAdminBackup}`);
    }

    console.log('\n✅ Backup status check completed!');

  } catch (error) {
    console.error('❌ Backup status check failed:', error);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'backup':
      const adminEmail = args[1];
      createDevelopmentBackup({ adminEmail })
        .then(() => {
          console.log('\n🎉 Development backup workflow completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Development backup workflow failed:', error);
          process.exit(1);
        });
      break;

    case 'restore':
      const restoreAdminEmail = args[1];
      const dryRun = args.includes('--dry-run');
      const skipImages = args.includes('--skip-images');
      const skipAnalytics = args.includes('--skip-analytics');
      
      restoreDevelopmentData({
        adminEmail: restoreAdminEmail,
        dryRun,
        skipImages,
        skipAnalytics
      })
        .then(() => {
          console.log('\n🎉 Development data restoration completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Development data restoration failed:', error);
          process.exit(1);
        });
      break;

    case 'admin-restore':
      const quickAdminEmail = args[1];
      if (!quickAdminEmail) {
        console.log('Usage: npx tsx scripts/dev-workflow-backup.ts admin-restore <admin-email>');
        process.exit(1);
      }
      quickAdminRestore(quickAdminEmail)
        .then(() => {
          console.log('\n🎉 Quick admin restore completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Quick admin restore failed:', error);
          process.exit(1);
        });
      break;

    case 'status':
      checkBackupStatus()
        .then(() => {
          console.log('\n🎉 Backup status check completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Backup status check failed:', error);
          process.exit(1);
        });
      break;

    case '--help':
    case '-h':
      console.log(`
Development Workflow Backup System

This script provides easy commands for the complete backup and restoration workflow.

Usage: npx tsx scripts/dev-workflow-backup.ts <command> [options]

Commands:
  backup [admin-email]           Create comprehensive backup (with optional admin backup)
  restore [admin-email] [options] Restore all data (with optional admin restore)
  admin-restore <admin-email>    Quick admin account restore only
  status                         Check backup status and list available backups

Options for restore:
  --dry-run                     Test restoration without making changes
  --skip-images                 Skip restoring generated images and carousels
  --skip-analytics              Skip restoring R2 analytics data

Examples:
  # Create backup before making changes
  npx tsx scripts/dev-workflow-backup.ts backup lucid8080@gmail.com

  # Restore everything after database wipe
  npx tsx scripts/dev-workflow-backup.ts restore lucid8080@gmail.com

  # Quick admin restore only
  npx tsx scripts/dev-workflow-backup.ts admin-restore lucid8080@gmail.com

  # Test restoration without making changes
  npx tsx scripts/dev-workflow-backup.ts restore --dry-run

  # Check what backups are available
  npx tsx scripts/dev-workflow-backup.ts status

Workflow:
  1. Before making changes: npx tsx scripts/dev-workflow-backup.ts backup <your-email>
  2. Make your database changes
  3. If data is lost: npx tsx scripts/dev-workflow-backup.ts restore <your-email>
  4. If only admin access is lost: npx tsx scripts/dev-workflow-backup.ts admin-restore <your-email>

This ensures your critical data is always protected during development!
      `);
      process.exit(0);
      break;

    default:
      console.log('❌ Unknown command. Use --help for usage information.');
      process.exit(1);
  }
}

export { createDevelopmentBackup, restoreDevelopmentData, quickAdminRestore, checkBackupStatus }; 