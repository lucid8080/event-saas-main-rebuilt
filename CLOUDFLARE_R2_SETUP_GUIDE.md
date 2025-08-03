# Cloudflare R2 Setup Guide

This guide will walk you through setting up Cloudflare R2 for secure image storage in your SaaS application.

## Prerequisites

- Cloudflare account
- Access to Cloudflare dashboard
- Node.js application with AWS SDK v3

## Step 1: Create Cloudflare R2 Bucket

### 1.1 Access Cloudflare R2
1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Create bucket**

### 1.2 Configure Bucket
1. **Bucket name**: `event-images` (or your preferred name)
2. **Location**: Choose the closest region to your users
3. **Public bucket**: **Unchecked** (keep private for security)
4. Click **Create bucket**

### 1.3 Bucket Settings
1. Go to your newly created bucket
2. Click **Settings** tab
3. Ensure **Public bucket** is **disabled**
4. Note your **Account ID** (you'll need this for the endpoint URL)

## Step 2: Generate API Tokens

### 2.1 Create API Token
1. In Cloudflare dashboard, go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Choose **Custom token** template

### 2.2 Configure Token Permissions
1. **Token name**: `R2-Event-Images-Token`
2. **Permissions**:
   - **Account** → **Cloudflare R2** → **Edit**
   - **Zone** → **Zone** → **Read** (if needed for custom domains)
3. **Account resources**: Select your account
4. **Zone resources**: All zones (if using custom domains)

### 2.3 Save Credentials
1. Click **Continue to summary**
2. Review and click **Create Token**
3. **IMPORTANT**: Copy and save the token immediately (you won't see it again)

## Step 3: Environment Configuration

### 3.1 Add Environment Variables
Add these variables to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=event-images
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
```

### 3.2 Get Your Account ID
1. In Cloudflare dashboard, go to **R2 Object Storage**
2. Look for your **Account ID** in the URL or settings
3. Replace `your_account_id` in the endpoint URL

### 3.3 Get Access Keys
1. In R2 dashboard, go to **Manage R2 API tokens**
2. Click **Create API token**
3. Choose **Custom token**
4. Set permissions for your bucket
5. Copy the **Access Key ID** and **Secret Access Key**

## Step 4: Test Configuration

### 4.1 Test R2 Connection
1. Start your development server
2. Visit `/api/test-r2` (admin access required)
3. Check the response for connection status

### 4.2 Expected Response
```json
{
  "success": true,
  "r2Connection": true,
  "environment": {
    "hasAccessKeyId": true,
    "hasSecretAccessKey": true,
    "hasBucketName": true,
    "hasEndpoint": true,
    "bucketName": "event-images",
    "endpoint": "https://your_account_id.r2.cloudflarestorage.com"
  },
  "message": "R2 connection successful"
}
```

## Step 5: API Endpoints

### 5.1 Upload Image
**POST** `/api/upload-image`
- Requires authentication
- Accepts FormData with `image` file and `imageId`
- Uploads image to R2 and updates database

### 5.2 Generate Signed URL
**POST** `/api/signed-url`
- Requires authentication
- Accepts JSON with `imageId` and optional `expiresIn`
- Returns signed URL valid for specified time (default: 1 hour)

### 5.3 Test R2 Connection
**GET** `/api/test-r2`
- Requires admin authentication
- Tests R2 connectivity and configuration

## Step 6: Integration with Image Generation

### 6.1 Update Image Generation Flow
The system will now:
1. Generate image using Ideogram API
2. Upload image to R2 storage
3. Store R2 key in database
4. Generate signed URLs for secure access

### 6.2 Database Schema
The `GeneratedImage` model now includes:
- `r2Key`: String field for R2 object key
- Index on `r2Key` for efficient queries

## Step 7: Security Considerations

### 7.1 Access Control
- All images are stored as private by default
- Signed URLs provide time-limited access
- User authentication required for all operations
- Ownership verification for all image operations

### 7.2 Environment Variables
- Never commit credentials to version control
- Use environment variables for all sensitive data
- Rotate API tokens regularly
- Monitor API usage and costs

## Step 8: Optional: Cloudflare Worker

### 8.1 Worker Benefits
- Additional security layer
- Image transformation and optimization
- Custom authentication logic
- Rate limiting and caching

### 8.2 Worker Setup (Optional)
1. Create Cloudflare Worker
2. Configure authentication verification
3. Add image transformation capabilities
4. Deploy and test

## Troubleshooting

### Common Issues

#### 1. Connection Failed
- Check environment variables are set correctly
- Verify Account ID in endpoint URL
- Ensure API token has correct permissions
- Check bucket name matches exactly

#### 2. Upload Errors
- Verify bucket exists and is accessible
- Check file size limits
- Ensure proper content type
- Verify user authentication

#### 3. Signed URL Issues
- Check R2 key exists in database
- Verify user owns the image
- Check URL expiration time
- Ensure proper authentication

### Debug Tools
- `/api/test-r2` - Test R2 connection
- Browser developer tools - Check network requests
- Cloudflare dashboard - Monitor usage and errors
- Application logs - Check for detailed error messages

## Cost Optimization

### 7.1 Storage Costs
- R2 storage: $0.015 per GB per month
- Class A operations (uploads): $4.50 per million
- Class B operations (downloads): $0.36 per million

### 7.2 Optimization Strategies
- Compress images before upload
- Use appropriate image formats
- Implement caching strategies
- Monitor usage and optimize accordingly

## Next Steps

1. **Test the setup** with the provided endpoints
2. **Integrate with image generation** flow
3. **Monitor usage** and costs
4. **Implement caching** strategies
5. **Add image optimization** features
6. **Set up monitoring** and alerts

## Support

For issues with:
- **Cloudflare R2**: Check Cloudflare documentation
- **Application integration**: Check application logs
- **Configuration**: Verify environment variables
- **Performance**: Monitor usage and optimize 