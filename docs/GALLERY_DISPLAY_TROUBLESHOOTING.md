# 🖼️ Gallery Display Troubleshooting Guide

## 🚨 **Issue: Generated Events Not Showing in Gallery**

**Problem**: Generated events are not showing up in the gallery on the production server, even though image generation appears to work.

## 🔍 **Quick Diagnosis**

### **Step 1: Run the Diagnostic Script**
```bash
npx tsx scripts/diagnose-gallery-issue.ts
```

This script will check:
- ✅ Environment variables
- ✅ Database connection
- ✅ Authentication
- ✅ Generated images in database
- ✅ R2 configuration
- ✅ Feature flags

### **Step 2: Check Browser Developer Tools**
1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Navigate to the gallery page**
4. **Look for API calls** to `/api/user-images`
5. **Check response status** and data

### **Step 3: Check Console for Errors**
1. **Go to Console tab** in Developer Tools
2. **Look for JavaScript errors**
3. **Check for authentication errors**
4. **Look for API call failures**

## 🚨 **Most Common Root Cause**

### **Cloud Services Disabled**
**Symptoms:**
- Images generate but don't appear in gallery
- 4-byte corrupted files in R2
- No R2 upload errors in logs
- Gallery shows empty or loading state

**Solution:**
```env
# Set this environment variable in production
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
```

## 🔧 **Complete Fix Process**

### **Phase 1: Environment Variables**

#### **1.1 Set Critical Environment Variables**
Add these to your production environment:

```env
# 🚨 CRITICAL - Enable cloud services
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true

# 📊 Enable charts and analytics
NEXT_PUBLIC_ENABLE_CHARTS=true

# 🖼️ Enable image processing
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true

# ✨ Enable animations (optional)
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```

#### **1.2 Verify R2 Configuration**
Ensure these are set in production:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="event-images"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

### **Phase 2: Database Verification**

#### **2.1 Check Database for Images**
Run this query to verify images are being saved:

```sql
-- Check total images
SELECT COUNT(*) FROM generated_images;

-- Check recent images
SELECT id, user_id, event_type, created_at, r2_key 
FROM generated_images 
ORDER BY created_at DESC 
LIMIT 10;

-- Check user-specific images
SELECT id, event_type, created_at, r2_key 
FROM generated_images 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

#### **2.2 Verify Image Metadata**
Check if images have proper metadata:

```sql
-- Check for missing R2 keys
SELECT COUNT(*) FROM generated_images WHERE r2_key IS NULL;

-- Check for missing URLs
SELECT COUNT(*) FROM generated_images WHERE url IS NULL OR url = '';
```

### **Phase 3: API Testing**

#### **3.1 Test User Images API**
Make a direct API call to test the endpoint:

```bash
# Test the user images API
curl -X GET "https://your-domain.com/api/user-images?limit=6&offset=0" \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

#### **3.2 Check API Response**
The API should return:
```json
{
  "images": [
    {
      "id": "image-id",
      "url": "signed-url-or-direct-url",
      "eventType": "WEDDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "r2Key": "users/user-id/images/filename.png"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 6,
    "offset": 0,
    "hasMore": true
  }
}
```

### **Phase 4: Gallery Component Testing**

#### **4.1 Check Gallery Page**
Verify the gallery page is loading correctly:

1. **Navigate to** `/gallery`
2. **Check if authentication** is working
3. **Look for loading states** and error messages
4. **Check browser console** for errors

#### **4.2 Test Image Generation**
Generate a new image and verify:

1. **Create a new event image**
2. **Check if it appears** in gallery immediately
3. **Verify the image** is viewable and downloadable
4. **Check if R2 upload** was successful

## 🚨 **Common Issues and Solutions**

### **Issue 1: Cloud Services Disabled**
**Error**: `NEXT_PUBLIC_ENABLE_CLOUD_SERVICES` not set to `true`
**Solution**: Set the environment variable and restart the application

### **Issue 2: R2 Configuration Missing**
**Error**: Missing R2 environment variables
**Solution**: Configure all R2 environment variables in production

### **Issue 3: Database Connection Issues**
**Error**: Cannot connect to database
**Solution**: Check `DATABASE_URL` and database connectivity

### **Issue 4: Authentication Problems**
**Error**: User not authenticated or session expired
**Solution**: Check authentication configuration and session management

### **Issue 5: Image Generation Failing**
**Error**: Images not being saved to database
**Solution**: Check image generation logs and database permissions

### **Issue 6: URL Generation Issues**
**Error**: Cannot generate signed URLs for R2 images
**Solution**: Verify R2 credentials and bucket permissions

## 🔍 **Advanced Debugging**

### **Check Production Logs**
Look for these specific error patterns:

```bash
# Check for R2 upload errors
grep -i "r2\|cloudflare" production.log

# Check for database errors
grep -i "database\|prisma" production.log

# Check for authentication errors
grep -i "auth\|session" production.log

# Check for image generation errors
grep -i "image\|generation" production.log
```

### **Test Image Generation Flow**
1. **Generate a test image**
2. **Check database** for the new record
3. **Verify R2 upload** was successful
4. **Test URL generation** for the image
5. **Check gallery display** of the new image

### **Verify R2 Upload**
Check Cloudflare R2 dashboard:
1. **Log into Cloudflare R2**
2. **Navigate to your bucket**
3. **Check for new image files**
4. **Verify file sizes** (should not be 4 bytes)
5. **Test file access** and permissions

## 📋 **Verification Checklist**

### **Environment Variables**
- [ ] `NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true`
- [ ] `NEXT_PUBLIC_ENABLE_CHARTS=true`
- [ ] `R2_ACCESS_KEY_ID` set
- [ ] `R2_SECRET_ACCESS_KEY` set
- [ ] `R2_BUCKET_NAME` set
- [ ] `R2_ENDPOINT` set

### **Database**
- [ ] Database connection working
- [ ] Images being saved to database
- [ ] User authentication working
- [ ] Image metadata complete

### **API Endpoints**
- [ ] `/api/user-images` returning data
- [ ] Authentication working for API calls
- [ ] Pagination working correctly
- [ ] Image URLs being generated

### **Gallery Display**
- [ ] Gallery page loading
- [ ] Images displaying correctly
- [ ] Infinite scroll working
- [ ] Image interactions working

### **R2 Storage**
- [ ] Images uploading to R2
- [ ] Signed URLs being generated
- [ ] File sizes correct (not 4 bytes)
- [ ] File permissions correct

## 🚀 **Quick Fix Commands**

### **For Vercel:**
```bash
# Set environment variables
vercel env add NEXT_PUBLIC_ENABLE_CLOUD_SERVICES
vercel env add NEXT_PUBLIC_ENABLE_CHARTS

# Redeploy
vercel --prod
```

### **For Render:**
1. Go to Render dashboard
2. Navigate to Environment tab
3. Add environment variables
4. Redeploy the service

### **For Railway:**
```bash
# Set environment variables
railway variables set NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
railway variables set NEXT_PUBLIC_ENABLE_CHARTS=true

# Redeploy
railway up
```

## 📞 **Support**

If the issue persists after following this guide:

1. **Run the diagnostic script** and share the output
2. **Check production logs** for specific error messages
3. **Test in development** to confirm the fix works locally
4. **Compare environment variables** between development and production
5. **Verify database state** and user permissions

## 🎯 **Success Criteria**

The issue is resolved when:
- ✅ Generated images appear in gallery immediately after generation
- ✅ Gallery loads existing images correctly
- ✅ Images are viewable and downloadable
- ✅ R2 uploads are working properly
- ✅ No 4-byte corrupted files in R2
- ✅ All environment variables are set correctly
- ✅ No console errors in browser
- ✅ API endpoints returning proper data

---

**Last Updated**: Current
**Status**: Ready for production troubleshooting
