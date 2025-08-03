import { createDataBackup } from './data-preservation-backup';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface MigrationInfo {
  migrationName: string;
  timestamp: string;
  description?: string;
}

async function createPreMigrationBackup(): Promise<void> {
  console.log('🔄 Starting pre-migration backup process...\n');

  try {
    // 1. Check if we're in a development environment
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    if (!isDevelopment) {
      console.log('⚠️  Not in development mode. Skipping pre-migration backup.');
      console.log('💡 Set NODE_ENV=development to enable automatic backups.');
      return;
    }

    // 2. Check if there are pending migrations
    console.log('🔍 Checking for pending migrations...');
    
    try {
      // Get the current migration status
      const migrationStatus = execSync('npx prisma migrate status', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('📋 Current migration status:');
      console.log(migrationStatus);
      
      // Check if there are pending migrations
      if (migrationStatus.includes('Pending')) {
        console.log('⚠️  Pending migrations detected! Creating backup before migration...\n');
      } else {
        console.log('✅ No pending migrations found.');
        console.log('💡 This backup is for general data preservation.');
      }
    } catch (error) {
      console.log('⚠️  Could not check migration status. Creating backup anyway...\n');
    }

    // 3. Create comprehensive backup
    console.log('📦 Creating comprehensive data backup...');
    await createDataBackup();

    // 4. Create migration-specific backup info
    const backupDir = join(process.cwd(), 'backups');
    const backupFiles = require('fs').readdirSync(backupDir)
      .filter((file: string) => file.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length > 0) {
      const latestBackup = backupFiles[0];
      const backupPath = join(backupDir, latestBackup);
      
      // Create migration info file
      const migrationInfo: MigrationInfo = {
        migrationName: `pre-migration-${new Date().toISOString().split('T')[0]}`,
        timestamp: new Date().toISOString(),
        description: 'Automatic pre-migration backup'
      };

      const migrationInfoPath = join(backupDir, `${latestBackup.replace('.json', '')}-migration-info.json`);
      require('fs').writeFileSync(migrationInfoPath, JSON.stringify(migrationInfo, null, 2));

      console.log('\n📝 Migration info saved to:', migrationInfoPath);
    }

    console.log('\n✅ Pre-migration backup completed successfully!');
    console.log('🚀 You can now safely run database migrations.');
    console.log('💡 To restore after migration: npx tsx scripts/data-preservation-restore.ts');

  } catch (error) {
    console.error('❌ Pre-migration backup failed:', error);
    console.log('\n⚠️  WARNING: Backup failed before migration!');
    console.log('💡 Consider creating a manual backup before proceeding.');
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/pre-migration-backup.ts [options]

Description:
  Creates a comprehensive backup of all critical data before running database migrations.
  This script is designed to be run before 'npx prisma migrate dev' or similar commands.

Options:
  --force              Force backup even if no pending migrations detected
  --help, -h          Show this help message

Examples:
  npx tsx scripts/pre-migration-backup.ts
  npx tsx scripts/pre-migration-backup.ts --force

Workflow:
  1. Run this script before migrations
  2. Run your database migration
  3. If needed, restore data with: npx tsx scripts/data-preservation-restore.ts
    `);
    process.exit(0);
  }

  createPreMigrationBackup()
    .then(() => {
      console.log('\n🎉 Pre-migration backup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Pre-migration backup process failed:', error);
      process.exit(1);
    });
}

export { createPreMigrationBackup }; 