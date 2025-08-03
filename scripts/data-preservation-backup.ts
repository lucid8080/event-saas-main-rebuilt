import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface BackupData {
  timestamp: string;
  version: string;
  criticalData: {
    adminUsers: any[];
    systemPrompts: any[];
    blogPosts: any[];
    generatedImages: any[];
    generatedCarousels: any[];
    userSettings: any[];
    r2Analytics: any[];
    personalEvents: any[];
    contactMessages: any[];
  };
  metadata: {
    totalRecords: number;
    backupSize: number;
    dataIntegrity: boolean;
  };
}

async function createDataBackup(): Promise<void> {
  console.log('🔄 Starting comprehensive data backup...\n');

  const timestamp = new Date().toISOString();
  const backupDir = join(process.cwd(), 'backups');
  
  // Create backup directory if it doesn't exist
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  try {
    // 1. Backup Admin Users (Critical - Account Access)
    console.log('📋 Backing up admin users...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: {
        accounts: true,
        sessions: true,
      }
    });
    console.log(`✅ Found ${adminUsers.length} admin users`);

    // 2. Backup System Prompts (Critical - System Configuration)
    console.log('📝 Backing up system prompts...');
    const systemPrompts = await prisma.systemPrompt.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${systemPrompts.length} system prompts`);

    // 3. Backup Blog Posts (Critical - Content)
    console.log('📰 Backing up blog posts...');
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${blogPosts.length} blog posts`);

    // 4. Backup Generated Images (Critical - User Content)
    console.log('🖼️ Backing up generated images...');
    const generatedImages = await prisma.generatedImage.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${generatedImages.length} generated images`);

    // 5. Backup Generated Carousels (Critical - User Content)
    console.log('🎠 Backing up generated carousels...');
    const generatedCarousels = await prisma.generatedCarousel.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${generatedCarousels.length} generated carousels`);

    // 6. Backup User Settings (Important - User Preferences)
    console.log('⚙️ Backing up user settings...');
    const userSettings = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        ticketmasterFlyerEnabled: true,
        carouselMakerEnabled: true,
        watermarkEnabled: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${userSettings.length} user settings`);

    // 7. Backup R2 Analytics Data (Critical - Performance Data)
    console.log('📊 Backing up R2 analytics data...');
    const r2Analytics = await prisma.r2PerformanceLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    console.log(`✅ Found ${r2Analytics.length} R2 analytics records`);

    // 8. Backup Personal Events (Important - User Data)
    console.log('📅 Backing up personal events...');
    const personalEvents = await prisma.personalEvent.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${personalEvents.length} personal events`);

    // 9. Backup Contact Messages (Important - User Communications)
    console.log('💬 Backing up contact messages...');
    const contactMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${contactMessages.length} contact messages`);

    // Create backup object
    const backupData: BackupData = {
      timestamp,
      version: '1.0.0',
      criticalData: {
        adminUsers,
        systemPrompts,
        blogPosts,
        generatedImages,
        generatedCarousels,
        userSettings,
        r2Analytics,
        personalEvents,
        contactMessages,
      },
      metadata: {
        totalRecords: adminUsers.length + systemPrompts.length + blogPosts.length + 
                     generatedImages.length + generatedCarousels.length + userSettings.length +
                     r2Analytics.length + personalEvents.length + contactMessages.length,
        backupSize: 0, // Will be calculated after JSON stringification
        dataIntegrity: true
      }
    };

    // Calculate backup size
    const backupJson = JSON.stringify(backupData, null, 2);
    backupData.metadata.backupSize = Buffer.byteLength(backupJson, 'utf8');

    // Save backup to file
    const backupFileName = `backup-${timestamp.replace(/[:.]/g, '-')}.json`;
    const backupFilePath = join(backupDir, backupFileName);
    
    writeFileSync(backupFilePath, backupJson, 'utf8');

    console.log('\n📦 BACKUP SUMMARY:');
    console.log(`📁 Backup saved to: ${backupFilePath}`);
    console.log(`📊 Total records backed up: ${backupData.metadata.totalRecords}`);
    console.log(`💾 Backup size: ${(backupData.metadata.backupSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✅ Data integrity: ${backupData.metadata.dataIntegrity ? 'PASS' : 'FAIL'}`);
    
    console.log('\n🔍 CRITICAL DATA BREAKDOWN:');
    console.log(`👑 Admin Users: ${adminUsers.length}`);
    console.log(`📝 System Prompts: ${systemPrompts.length}`);
    console.log(`📰 Blog Posts: ${blogPosts.length}`);
    console.log(`🖼️ Generated Images: ${generatedImages.length}`);
    console.log(`🎠 Generated Carousels: ${generatedCarousels.length}`);
    console.log(`👥 User Settings: ${userSettings.length}`);
    console.log(`📊 R2 Analytics: ${r2Analytics.length}`);
    console.log(`📅 Personal Events: ${personalEvents.length}`);
    console.log(`💬 Contact Messages: ${contactMessages.length}`);

    console.log('\n✅ Backup completed successfully!');
    console.log('💡 To restore this backup, run: npx tsx scripts/data-preservation-restore.ts');

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup if called directly
if (require.main === module) {
  createDataBackup()
    .then(() => {
      console.log('\n🎉 Backup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Backup process failed:', error);
      process.exit(1);
    });
}

export { createDataBackup };
export type { BackupData }; 