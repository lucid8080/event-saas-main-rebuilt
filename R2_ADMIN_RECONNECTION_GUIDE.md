# Cloudflare R2 Admin Reconnection Guide

This guide will help you reconnect your admin dashboard with Cloudflare R2 data.

## 🔍 Quick Diagnostic

First, run the diagnostic script to identify the issue:

```bash
npx tsx scripts/r2-admin-connection-diagnostic.ts
```

This will check:
- Environment variables configuration
- R2 connection status
- Database R2 data
- Admin user permissions

## 🚨 Common Issues and Solutions

### Issue 1: Missing Environment Variables

**Symptoms:**
- R2 connection fails
- Admin dashboard shows no R2 data
- Environment check shows missing variables

**Solution:**
1. Create or update your `.env` file with these variables:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

2. Get your credentials from Cloudflare R2 dashboard:
   - Go to Cloudflare Dashboard → R2 Object Storage
   - Click "Manage R2 API tokens"
   - Create a new API token with bucket permissions
   - Copy the Access Key ID and Secret Access Key

### Issue 2: Invalid R2 Credentials

**Symptoms:**
- Environment variables are set but connection fails
- Error messages about authentication

**Solution:**
1. Verify your credentials in Cloudflare R2 dashboard
2. Ensure the API token has proper permissions:
   - Account → Cloudflare R2 → Edit
   - Zone → Zone → Read (if using custom domains)
3. Check that the bucket name matches exactly
4. Verify the endpoint URL format

### Issue 3: No Admin User

**Symptoms:**
- Cannot access admin dashboard
- Permission denied errors

**Solution:**
1. Check if you have an admin user in the database
2. If not, create one using the admin account preservation script:

```bash
npx tsx scripts/admin-account-preservation.ts
```

3. Or manually update a user to admin role in the database

### Issue 4: Database Migration Issues

**Symptoms:**
- No R2 images found in database
- Missing r2Key field

**Solution:**
1. Check if R2 migration has been applied:

```bash
npx prisma migrate status
```

2. If migration is pending, apply it:

```bash
npx prisma migrate deploy
```

3. Generate Prisma client:

```bash
npx prisma generate
```

## 🔧 Step-by-Step Reconnection Process

### Step 1: Verify Environment Configuration

Run the quick connection test:

```bash
npx tsx scripts/test-r2-connection.ts
```

### Step 2: Check Admin Access

1. Ensure you're logged in as an admin user
2. Visit `/admin` in your browser
3. Check if you can access the R2 Analytics tab

### Step 3: Test R2 Connection via API

1. Start your development server: `npm run dev`
2. Visit `/api/test-r2` (requires admin login)
3. Check the response for connection status

### Step 4: Verify R2 Analytics Dashboard

1. Go to `/admin`
2. Click on "R2 Analytics" tab
3. Check if data loads properly
4. Look for any error messages

## 🛠️ Advanced Troubleshooting

### Check R2 Bucket Permissions

1. Go to Cloudflare R2 dashboard
2. Select your bucket
3. Go to Settings tab
4. Ensure bucket is not public (for security)
5. Check API token permissions

### Verify Database R2 Integration

Check if images are being saved with R2 keys:

```bash
npx tsx scripts/check-r2-images.ts
```

### Test R2 Upload Functionality

1. Generate a new image in the Event Generator
2. Check if it gets uploaded to R2
3. Verify the r2Key is saved in the database

## 📊 Admin Dashboard Features

Once reconnected, your admin dashboard will show:

### R2 Analytics Dashboard
- **Usage Statistics**: Total images, storage usage, cost estimates
- **Performance Metrics**: Upload success rates, response times
- **Access Patterns**: Image access frequency, popular images
- **System Health**: Connection status, cache performance
- **Recommendations**: Optimization suggestions

### R2 Monitoring
- Real-time connection status
- Error tracking and alerts
- Performance monitoring
- Cost analysis

## 🔗 Useful Endpoints

- **R2 Connection Test**: `/api/test-r2`
- **R2 Analytics**: `/api/analytics/r2-dashboard`
- **R2 Integration Test**: `/api/test-r2-integration`
- **Admin Dashboard**: `/admin`

## 📚 Additional Resources

- **R2 Setup Guide**: `CLOUDFLARE_R2_SETUP_GUIDE.md`
- **R2 Monitoring Guide**: `R2_MONITORING_ANALYTICS_GUIDE.md`
- **Cloudflare R2 Documentation**: https://developers.cloudflare.com/r2/

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the logs**: Look for error messages in your console
2. **Verify network**: Ensure your server can reach Cloudflare R2
3. **Test credentials**: Use Cloudflare's test tools to verify API access
4. **Contact support**: Check Cloudflare R2 documentation for additional help

## ✅ Success Checklist

- [ ] Environment variables are properly configured
- [ ] R2 connection test passes
- [ ] Admin user exists and has proper permissions
- [ ] Database migration for R2 support is applied
- [ ] Admin dashboard loads without errors
- [ ] R2 Analytics tab shows data
- [ ] Image uploads to R2 work correctly
- [ ] Signed URLs generate properly

Once all items are checked, your admin dashboard should be fully reconnected with Cloudflare R2 data! 