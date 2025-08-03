import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { BackupData } from './data-preservation-backup';

const prisma = new PrismaClient();

interface RestoreOptions {
  backupFile?: string;
  dryRun?: boolean;
  skipImages?: boolean;
  skipAnalytics?: boolean;
  adminOnly?: boolean;
}

async function restoreDataBackup(options: RestoreOptions = {}): Promise<void> {
  console.log('🔄 Starting data restoration process...\n');

  const {
    backupFile,
    dryRun = false,
    skipImages = false,
    skipAnalytics = false,
    adminOnly = false
  } = options;

  try {
    // Find backup file
    let backupFilePath: string;
    const backupDir = join(process.cwd(), 'backups');

    if (!existsSync(backupDir)) {
      throw new Error('Backup directory not found. No backups available.');
    }

    if (backupFile) {
      backupFilePath = join(backupDir, backupFile);
      if (!existsSync(backupFilePath)) {
        throw new Error(`Backup file not found: ${backupFile}`);
      }
    } else {
      // Find the most recent backup
      const backupFiles = readdirSync(backupDir)
        .filter(file => file.endsWith('.json'))
        .sort()
        .reverse();

      if (backupFiles.length === 0) {
        throw new Error('No backup files found in backups directory.');
      }

      backupFilePath = join(backupDir, backupFiles[0]);
      console.log(`📁 Using most recent backup: ${backupFiles[0]}`);
    }

    // Read and parse backup file
    console.log(`📖 Reading backup file: ${backupFilePath}`);
    const backupContent = readFileSync(backupFilePath, 'utf8');
    const backupData: BackupData = JSON.parse(backupContent);

    console.log(`📊 Backup metadata:`);
    console.log(`   Timestamp: ${backupData.timestamp}`);
    console.log(`   Version: ${backupData.version}`);
    console.log(`   Total records: ${backupData.metadata.totalRecords}`);
    console.log(`   Backup size: ${(backupData.metadata.backupSize / 1024 / 1024).toFixed(2)} MB`);

    if (dryRun) {
      console.log('\n🔍 DRY RUN MODE - No data will be modified');
    }

    const { criticalData } = backupData;
    let restoredCount = 0;

    // 1. Restore Admin Users (Critical - Account Access)
    console.log('\n👑 Restoring admin users...');
    for (const adminUser of criticalData.adminUsers) {
      if (dryRun) {
        console.log(`   [DRY RUN] Would restore admin: ${adminUser.email}`);
        continue;
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: adminUser.email }
        });

        if (existingUser) {
          // Update existing admin user
          await prisma.user.update({
            where: { email: adminUser.email },
            data: {
              role: 'ADMIN',
              credits: adminUser.credits || 0,
              ticketmasterFlyerEnabled: adminUser.ticketmasterFlyerEnabled || false,
              carouselMakerEnabled: adminUser.carouselMakerEnabled || false,
              watermarkEnabled: adminUser.watermarkEnabled || false,
              stripeCustomerId: adminUser.stripeCustomerId,
              stripeSubscriptionId: adminUser.stripeSubscriptionId,
              stripePriceId: adminUser.stripePriceId,
              stripeCurrentPeriodEnd: adminUser.stripeCurrentPeriodEnd,
            }
          });
          console.log(`   ✅ Updated admin: ${adminUser.email}`);
        } else {
          // Create new admin user
          await prisma.user.create({
            data: {
              email: adminUser.email,
              name: adminUser.name,
              role: 'ADMIN',
              credits: adminUser.credits || 0,
              ticketmasterFlyerEnabled: adminUser.ticketmasterFlyerEnabled || false,
              carouselMakerEnabled: adminUser.carouselMakerEnabled || false,
              watermarkEnabled: adminUser.watermarkEnabled || false,
              stripeCustomerId: adminUser.stripeCustomerId,
              stripeSubscriptionId: adminUser.stripeSubscriptionId,
              stripePriceId: adminUser.stripePriceId,
              stripeCurrentPeriodEnd: adminUser.stripeCurrentPeriodEnd,
            }
          });
          console.log(`   ✅ Created admin: ${adminUser.email}`);
        }
        restoredCount++;
      } catch (error) {
        console.error(`   ❌ Failed to restore admin ${adminUser.email}:`, error);
      }
    }

    if (adminOnly) {
      console.log('\n✅ Admin-only restoration completed!');
      return;
    }

    // 2. Restore System Prompts (Critical - System Configuration)
    console.log('\n📝 Restoring system prompts...');
    for (const prompt of criticalData.systemPrompts) {
      if (dryRun) {
        console.log(`   [DRY RUN] Would restore prompt: ${prompt.name} (${prompt.category})`);
        continue;
      }

      try {
        await prisma.systemPrompt.upsert({
          where: {
            category_subcategory_version: {
              category: prompt.category,
              subcategory: prompt.subcategory || '',
              version: prompt.version
            }
          },
          update: {
            content: prompt.content,
            description: prompt.description,
            isActive: prompt.isActive,
            metadata: prompt.metadata,
            updatedBy: prompt.updatedBy,
            updatedAt: new Date()
          },
          create: {
            category: prompt.category,
            subcategory: prompt.subcategory || '',
            name: prompt.name,
            description: prompt.description,
            content: prompt.content,
            version: prompt.version,
            isActive: prompt.isActive,
            metadata: prompt.metadata,
            createdBy: prompt.createdBy,
            updatedBy: prompt.updatedBy
          }
        });
        console.log(`   ✅ Restored prompt: ${prompt.name}`);
        restoredCount++;
      } catch (error) {
        console.error(`   ❌ Failed to restore prompt ${prompt.name}:`, error);
      }
    }

    // 3. Restore Blog Posts (Critical - Content)
    console.log('\n📰 Restoring blog posts...');
    for (const post of criticalData.blogPosts) {
      if (dryRun) {
        console.log(`   [DRY RUN] Would restore blog post: ${post.title}`);
        continue;
      }

      try {
        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          update: {
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            status: post.status,
            publishedAt: post.publishedAt,
            updatedAt: new Date()
          },
          create: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            status: post.status,
            publishedAt: post.publishedAt
          }
        });
        console.log(`   ✅ Restored blog post: ${post.title}`);
        restoredCount++;
      } catch (error) {
        console.error(`   ❌ Failed to restore blog post ${post.title}:`, error);
      }
    }

    // 4. Restore User Settings (Important - User Preferences)
    console.log('\n⚙️ Restoring user settings...');
    for (const user of criticalData.userSettings) {
      if (dryRun) {
        console.log(`   [DRY RUN] Would restore user settings: ${user.email}`);
        continue;
      }

      try {
        await prisma.user.upsert({
          where: { email: user.email || '' },
          update: {
            name: user.name,
            role: user.role,
            credits: user.credits,
            ticketmasterFlyerEnabled: user.ticketmasterFlyerEnabled,
            carouselMakerEnabled: user.carouselMakerEnabled,
            watermarkEnabled: user.watermarkEnabled,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: user.stripeSubscriptionId,
            stripePriceId: user.stripePriceId,
            stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
            updatedAt: new Date()
          },
          create: {
            email: user.email || '',
            name: user.name,
            role: user.role,
            credits: user.credits,
            ticketmasterFlyerEnabled: user.ticketmasterFlyerEnabled,
            carouselMakerEnabled: user.carouselMakerEnabled,
            watermarkEnabled: user.watermarkEnabled,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: user.stripeSubscriptionId,
            stripePriceId: user.stripePriceId,
            stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
          }
        });
        console.log(`   ✅ Restored user settings: ${user.email}`);
        restoredCount++;
      } catch (error) {
        console.error(`   ❌ Failed to restore user settings ${user.email}:`, error);
      }
    }

    // 5. Restore Personal Events (Important - User Data)
    console.log('\n📅 Restoring personal events...');
    for (const event of criticalData.personalEvents) {
      if (dryRun) {
        console.log(`   [DRY RUN] Would restore personal event: ${event.title}`);
        continue;
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email: event.user.email }
        });

        if (user) {
          await prisma.personalEvent.upsert({
            where: { id: event.id },
            update: {
              title: event.title,
              date: new Date(event.date),
              type: event.type,
              description: event.description,
              recurring: event.recurring,
              color: event.color,
              updatedAt: new Date()
            },
            create: {
              userId: user.id,
              title: event.title,
              date: new Date(event.date),
              type: event.type,
              description: event.description,
              recurring: event.recurring,
              color: event.color,
            }
          });
          console.log(`   ✅ Restored personal event: ${event.title}`);
          restoredCount++;
        } else {
          console.log(`   ⚠️ Skipping event ${event.title} - user not found: ${event.user.email}`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to restore personal event ${event.title}:`, error);
      }
    }

    // 6. Restore Contact Messages (Important - User Communications)
    console.log('\n💬 Restoring contact messages...');
    for (const message of criticalData.contactMessages) {
      if (dryRun) {
        console.log(`   [DRY RUN] Would restore contact message: ${message.name} - ${message.subject}`);
        continue;
      }

      try {
        await prisma.contactMessage.upsert({
          where: { id: message.id },
          update: {
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            status: message.status,
            updatedAt: new Date()
          },
          create: {
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            status: message.status,
          }
        });
        console.log(`   ✅ Restored contact message: ${message.name} - ${message.subject}`);
        restoredCount++;
      } catch (error) {
        console.error(`   ❌ Failed to restore contact message ${message.name}:`, error);
      }
    }

    // 7. Restore Generated Images (if not skipped)
    if (!skipImages) {
      console.log('\n🖼️ Restoring generated images...');
      for (const image of criticalData.generatedImages) {
        if (dryRun) {
          console.log(`   [DRY RUN] Would restore image: ${image.id}`);
          continue;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: image.user.email }
          });

          if (user) {
            await prisma.generatedImage.upsert({
              where: { id: image.id },
              update: {
                prompt: image.prompt,
                url: image.url,
                r2Key: image.r2Key,
                eventType: image.eventType,
                eventDetails: image.eventDetails,
                isPublic: image.isPublic,
                updatedAt: new Date()
              },
              create: {
                userId: user.id,
                prompt: image.prompt,
                url: image.url,
                r2Key: image.r2Key,
                eventType: image.eventType,
                eventDetails: image.eventDetails,
                isPublic: image.isPublic,
              }
            });
            console.log(`   ✅ Restored image: ${image.id}`);
            restoredCount++;
          } else {
            console.log(`   ⚠️ Skipping image ${image.id} - user not found: ${image.user.email}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to restore image ${image.id}:`, error);
        }
      }

      // 8. Restore Generated Carousels
      console.log('\n🎠 Restoring generated carousels...');
      for (const carousel of criticalData.generatedCarousels) {
        if (dryRun) {
          console.log(`   [DRY RUN] Would restore carousel: ${carousel.title}`);
          continue;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: carousel.user.email }
          });

          if (user) {
            await prisma.generatedCarousel.upsert({
              where: { id: carousel.id },
              update: {
                title: carousel.title,
                description: carousel.description,
                slides: carousel.slides,
                slideUrls: carousel.slideUrls,
                aspectRatio: carousel.aspectRatio,
                slideCount: carousel.slideCount,
                isPublic: carousel.isPublic,
                updatedAt: new Date()
              },
              create: {
                userId: user.id,
                title: carousel.title,
                description: carousel.description,
                slides: carousel.slides,
                slideUrls: carousel.slideUrls,
                aspectRatio: carousel.aspectRatio,
                slideCount: carousel.slideCount,
                isPublic: carousel.isPublic,
              }
            });
            console.log(`   ✅ Restored carousel: ${carousel.title}`);
            restoredCount++;
          } else {
            console.log(`   ⚠️ Skipping carousel ${carousel.title} - user not found: ${carousel.user.email}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to restore carousel ${carousel.title}:`, error);
        }
      }
    }

    // 9. Restore R2 Analytics (if not skipped)
    if (!skipAnalytics) {
      console.log('\n📊 Restoring R2 analytics data...');
      for (const analytics of criticalData.r2Analytics) {
        if (dryRun) {
          console.log(`   [DRY RUN] Would restore analytics record: ${analytics.id}`);
          continue;
        }

        try {
          await prisma.r2PerformanceLog.upsert({
            where: { id: analytics.id },
            update: {
              operation: analytics.operation,
              duration: analytics.duration,
              success: analytics.success,
              errorMessage: analytics.errorMessage,
              metadata: analytics.metadata,
              timestamp: new Date(analytics.timestamp)
            },
            create: {
              operation: analytics.operation,
              duration: analytics.duration,
              success: analytics.success,
              errorMessage: analytics.errorMessage,
              metadata: analytics.metadata,
              timestamp: new Date(analytics.timestamp)
            }
          });
          console.log(`   ✅ Restored analytics record: ${analytics.id}`);
          restoredCount++;
        } catch (error) {
          console.error(`   ❌ Failed to restore analytics record ${analytics.id}:`, error);
        }
      }
    }

    console.log('\n📦 RESTORATION SUMMARY:');
    console.log(`✅ Total records restored: ${restoredCount}`);
    console.log(`📁 Backup source: ${backupFilePath}`);
    console.log(`🔍 Dry run mode: ${dryRun ? 'YES' : 'NO'}`);
    console.log(`🖼️ Images skipped: ${skipImages ? 'YES' : 'NO'}`);
    console.log(`📊 Analytics skipped: ${skipAnalytics ? 'YES' : 'NO'}`);

    console.log('\n✅ Data restoration completed successfully!');

  } catch (error) {
    console.error('❌ Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: RestoreOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
      case '-f':
        options.backupFile = args[++i];
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--skip-images':
        options.skipImages = true;
        break;
      case '--skip-analytics':
        options.skipAnalytics = true;
        break;
      case '--admin-only':
        options.adminOnly = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: npx tsx scripts/data-preservation-restore.ts [options]

Options:
  -f, --file <filename>     Specify backup file to restore from
  -d, --dry-run            Run in dry-run mode (no data modification)
  --skip-images            Skip restoring generated images and carousels
  --skip-analytics         Skip restoring R2 analytics data
  --admin-only             Only restore admin users and system prompts
  -h, --help               Show this help message

Examples:
  npx tsx scripts/data-preservation-restore.ts
  npx tsx scripts/data-preservation-restore.ts --file backup-2024-01-01.json
  npx tsx scripts/data-preservation-restore.ts --dry-run
  npx tsx scripts/data-preservation-restore.ts --admin-only
        `);
        process.exit(0);
    }
  }

  restoreDataBackup(options)
    .then(() => {
      console.log('\n🎉 Restoration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Restoration process failed:', error);
      process.exit(1);
    });
}

export { restoreDataBackup }; 