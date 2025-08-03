# R2 Image Discrepancy Fix Guide

## 🔍 Problem Description

You're experiencing a discrepancy between your R2 Analytics Dashboard (showing 19 images) and your actual R2 Object Storage bucket (showing only 15 images). This guide will help you diagnose and fix this issue.

## 🎯 Root Cause Analysis

The issue is likely caused by one or more of the following:

1. **Analytics Logic Bug**: The R2 analytics was incorrectly counting all database images as R2 images instead of only those with actual R2 keys
2. **Database-R2 Sync Issues**: Some images may be in the database but not actually uploaded to R2
3. **Orphaned R2 Objects**: Some objects may exist in R2 but not be referenced in the database
4. **Failed Uploads**: Some image generation attempts may have failed to upload to R2

## 🛠️ Diagnostic Tools

### 1. Run the Discrepancy Diagnostic

```bash
npm run diagnose:r2:discrepancy
```

This will:
- Count total images in database
- Count images with R2 keys
- Count actual objects in R2 bucket
- Identify orphaned and missing objects
- Show recent activity

### 2. Run the Database Sync Analysis

```bash
npm run sync:r2:database
```

This will:
- Compare database records with R2 bucket contents
- Identify discrepancies
- Provide recommendations for fixing issues

## 🔧 Fixes Applied

### 1. Fixed R2 Analytics Logic ✅

**Problem**: The analytics was counting all database images as R2 images
**Solution**: Updated to only count images that actually have R2 keys

**File**: `lib/r2-analytics.ts`
```typescript
// OLD (incorrect):
const r2Images = totalImages;

// NEW (correct):
const r2Images = await prisma.generatedImage.count({
  where: {
    r2Key: {
      not: null
    }
  }
});
```

### 2. Created Diagnostic Scripts ✅

- `scripts/r2-image-discrepancy-diagnostic.ts` - Comprehensive analysis
- `scripts/sync-r2-database.ts` - Database-R2 synchronization tool

## 📊 Understanding the Numbers

### Before Fix
- **Database Total**: 19 images
- **Analytics R2 Count**: 19 images (incorrect - assumed all were R2)
- **Actual R2 Objects**: 15 images
- **Discrepancy**: 4 images

### After Fix
- **Database Total**: 19 images
- **Analytics R2 Count**: Should match actual R2 objects
- **Actual R2 Objects**: 15 images
- **Expected Result**: Analytics will now show 15 R2 images

## 🔍 Investigation Steps

### Step 1: Run Diagnostic
```bash
npm run diagnose:r2:discrepancy
```

### Step 2: Check Recent Images
Look at the "Recent Database Images" section to see:
- Which images have R2 keys (✅)
- Which images don't have R2 keys (❌)
- When they were created

### Step 3: Identify the Issue
Based on the diagnostic output:

**If you see images without R2 keys:**
- These images were generated but failed to upload to R2
- They're using direct URLs from Ideogram instead
- This is normal for older images or failed uploads

**If you see orphaned R2 objects:**
- These are objects in R2 that aren't referenced in the database
- They may be from failed uploads or deleted database records

## 🚀 Next Steps

### 1. Verify the Fix
After running the diagnostic, check your R2 Analytics Dashboard again. It should now show the correct count matching your R2 bucket.

### 2. Test New Image Generation
Generate a new image to verify that:
- The image uploads to R2 successfully
- The database record gets an R2 key
- The analytics count increases correctly

### 3. Optional: Clean Up Orphaned Objects
If the diagnostic shows orphaned R2 objects, you can:
- Review them to ensure they're not needed
- Consider cleaning them up to save storage space
- Use the sync tool to remove R2 keys from missing objects

## 🔧 Manual Verification

### Check Database Records
```sql
-- Count total images
SELECT COUNT(*) FROM generated_images;

-- Count images with R2 keys
SELECT COUNT(*) FROM generated_images WHERE r2_key IS NOT NULL;

-- Count images without R2 keys
SELECT COUNT(*) FROM generated_images WHERE r2_key IS NULL;
```

### Check Recent Images
```sql
-- Recent images with R2 status
SELECT 
  id, 
  event_type, 
  r2_key IS NOT NULL as has_r2_key,
  created_at
FROM generated_images 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🎯 Expected Results

After applying the fixes:

1. **R2 Analytics Dashboard** should show the correct count matching your R2 bucket
2. **New image generation** should properly upload to R2 and update analytics
3. **Database and R2** should be in sync for new images

## 🆘 Troubleshooting

### If Analytics Still Shows Wrong Count
1. Clear your browser cache
2. Refresh the admin dashboard
3. Check if the analytics data is cached

### If New Images Still Don't Upload to R2
1. Check R2 environment variables
2. Verify R2 bucket permissions
3. Check the image generation logs

### If You Need to Force Sync
1. Run the sync diagnostic: `npm run sync:r2:database`
2. Review the recommendations
3. Consider manual cleanup if needed

## 📞 Support

If you continue to experience issues:
1. Run the diagnostic scripts
2. Share the output (without sensitive data)
3. Check the console logs during image generation
4. Verify your R2 configuration

---

**Note**: The fix ensures that R2 analytics now accurately reflects the actual state of your R2 storage, which should resolve the discrepancy you were experiencing. 