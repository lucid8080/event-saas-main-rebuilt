# Data Preservation and Restoration System

## Overview

This comprehensive data preservation system protects your critical data during development cycles, preventing the loss of:
- **Admin access and permissions**
- **System prompts and configurations**
- **Blog posts and content**
- **User-generated images and carousels**
- **R2 Analytics data**
- **Personal events and user settings**
- **Contact messages and communications**

## Quick Start

### 1. Create a Backup (Before Database Changes)

```bash
# Create a comprehensive backup of all critical data
npx tsx scripts/data-preservation-backup.ts

# Or create a pre-migration backup (recommended)
npx tsx scripts/pre-migration-backup.ts
```

### 2. Restore Data (After Database Wipes)

```bash
# Restore all data from the most recent backup
npx tsx scripts/data-preservation-restore.ts

# Restore only admin users and system prompts (fast)
npx tsx scripts/data-preservation-restore.ts --admin-only

# Test restoration without making changes
npx tsx scripts/data-preservation-restore.ts --dry-run
```

## Detailed Usage

### Backup Commands

#### Comprehensive Backup
```bash
npx tsx scripts/data-preservation-backup.ts
```
Creates a complete backup of all critical data including:
- Admin users and permissions
- System prompts and configurations
- Blog posts and content
- Generated images and carousels
- User settings and preferences
- R2 Analytics data
- Personal events
- Contact messages

#### Pre-Migration Backup (Recommended)
```bash
npx tsx scripts/pre-migration-backup.ts
```
Automatically detects pending migrations and creates a backup before database changes.

### Restoration Commands

#### Full Restoration
```bash
npx tsx scripts/data-preservation-restore.ts
```
Restores all data from the most recent backup file.

#### Selective Restoration
```bash
# Restore only admin users and system prompts
npx tsx scripts/data-preservation-restore.ts --admin-only

# Skip image restoration (faster)
npx tsx scripts/data-preservation-restore.ts --skip-images

# Skip analytics restoration
npx tsx scripts/data-preservation-restore.ts --skip-analytics

# Restore from specific backup file
npx tsx scripts/data-preservation-restore.ts --file backup-2024-01-01.json
```

#### Safe Testing
```bash
# Test restoration without making changes
npx tsx scripts/data-preservation-restore.ts --dry-run
```

## Development Workflow

### Recommended Workflow

1. **Before making database changes:**
   ```bash
   npx tsx scripts/pre-migration-backup.ts
   ```

2. **Run your database migration:**
   ```bash
   npx prisma migrate dev
   ```

3. **If data is lost, restore immediately:**
   ```bash
   npx tsx scripts/data-preservation-restore.ts
   ```

### Alternative Workflow

1. **Create manual backup:**
   ```bash
   npx tsx scripts/data-preservation-backup.ts
   ```

2. **Make your changes**

3. **Restore if needed:**
   ```bash
   npx tsx scripts/data-preservation-restore.ts
   ```

## What Gets Backed Up

### Critical Data (Always Backed Up)
- **Admin Users**: All admin accounts with permissions and settings
- **System Prompts**: All prompt versions and configurations
- **Blog Posts**: Complete blog content and metadata
- **Generated Images**: User images with R2 storage keys
- **Generated Carousels**: User carousel content and settings
- **User Settings**: All user preferences and configurations
- **R2 Analytics**: Performance and access logs
- **Personal Events**: User calendar events
- **Contact Messages**: User communications

### Data Relationships Preserved
- User ownership of images and carousels
- Admin permissions and roles
- System prompt versions and categories
- Blog post status and metadata
- R2 storage keys and image URLs

## Backup Storage

### Location
Backups are stored in the `backups/` directory in your project root.

### File Naming
- Format: `backup-YYYY-MM-DDTHH-MM-SS-sssZ.json`
- Example: `backup-2024-01-15T10-30-45-123Z.json`

### Backup Size
Typical backup sizes:
- Small projects: 1-5 MB
- Medium projects: 5-20 MB
- Large projects: 20+ MB

## Troubleshooting

### Common Issues

#### Backup Fails
```bash
# Check database connection
npx prisma db pull

# Verify environment variables
echo $DATABASE_URL
```

#### Restoration Fails
```bash
# Check backup file integrity
cat backups/backup-*.json | head -20

# Test with dry run
npx tsx scripts/data-preservation-restore.ts --dry-run
```

#### Partial Data Loss
```bash
# Restore only critical admin data
npx tsx scripts/data-preservation-restore.ts --admin-only

# Then restore specific data types
npx tsx scripts/data-preservation-restore.ts --skip-images --skip-analytics
```

### Error Messages

#### "Backup directory not found"
- Run the backup script first to create the directory
- Check file permissions

#### "No backup files found"
- Verify backups exist in `backups/` directory
- Check file naming format

#### "User not found during restoration"
- The user account may have been deleted
- Restoration will skip orphaned data
- Consider restoring admin users first

## Advanced Usage

### Custom Backup Strategies

#### Admin-Only Backup
```bash
# Create backup with only admin data
npx tsx scripts/data-preservation-backup.ts
# Then manually edit the backup file to keep only adminUsers and systemPrompts
```

#### Selective Data Backup
```bash
# Create full backup
npx tsx scripts/data-preservation-backup.ts

# Restore only what you need
npx tsx scripts/data-preservation-restore.ts --admin-only
npx tsx scripts/data-preservation-restore.ts --skip-images
```

### Integration with CI/CD

Add to your deployment scripts:
```bash
#!/bin/bash
# Pre-deployment backup
npx tsx scripts/data-preservation-backup.ts

# Run deployment
npm run deploy

# Post-deployment verification
npx tsx scripts/data-preservation-restore.ts --dry-run
```

### Automated Backups

Create a cron job for regular backups:
```bash
# Add to crontab (daily backup at 2 AM)
0 2 * * * cd /path/to/your/project && npx tsx scripts/data-preservation-backup.ts
```

## Security Considerations

### Backup Security
- Backups contain sensitive user data
- Store backups securely
- Consider encryption for production backups
- Don't commit backups to version control

### Access Control
- Only admin users can access backup/restore scripts
- Backup files should have restricted permissions
- Consider backup file encryption for sensitive data

## Performance Impact

### Backup Performance
- Small databases: < 30 seconds
- Medium databases: 30-120 seconds
- Large databases: 2-5 minutes

### Restoration Performance
- Admin-only: < 10 seconds
- Full restoration: 1-5 minutes
- Large datasets: 5-15 minutes

## Best Practices

### Regular Backups
1. **Before every migration**: Use pre-migration backup
2. **Before major changes**: Create manual backup
3. **Weekly**: Create scheduled backup
4. **Before deployments**: Always backup

### Restoration Strategy
1. **Test first**: Always use `--dry-run`
2. **Start small**: Restore admin data first
3. **Verify integrity**: Check restored data
4. **Monitor performance**: Watch for issues

### Data Management
1. **Clean old backups**: Remove backups older than 30 days
2. **Verify backups**: Test restoration periodically
3. **Document changes**: Note what was restored
4. **Monitor space**: Check backup directory size

## Support

### Getting Help
1. Check this documentation
2. Run with `--help` flag
3. Use `--dry-run` to test
4. Check backup file integrity

### Common Scenarios

#### "I lost admin access"
```bash
npx tsx scripts/data-preservation-restore.ts --admin-only
```

#### "My images disappeared"
```bash
npx tsx scripts/data-preservation-restore.ts
```

#### "System prompts are gone"
```bash
npx tsx scripts/data-preservation-restore.ts --admin-only
```

#### "Blog posts are missing"
```bash
npx tsx scripts/data-preservation-restore.ts --skip-images --skip-analytics
```

## File Structure

```
project/
├── scripts/
│   ├── data-preservation-backup.ts
│   ├── data-preservation-restore.ts
│   └── pre-migration-backup.ts
├── backups/
│   ├── backup-2024-01-15T10-30-45-123Z.json
│   ├── backup-2024-01-15T10-30-45-123Z-migration-info.json
│   └── ...
└── DATA_PRESERVATION_GUIDE.md
```

This system ensures your critical data is always protected during development cycles! 