# Hugging Face Setup Guide

## Step 1: Create Hugging Face Account

### 1.1 Sign Up
1. Go to [Hugging Face](https://huggingface.co/)
2. Click "Sign Up" in the top right corner
3. Choose your preferred sign-up method:
   - Email signup
   - Google account
   - GitHub account
4. Complete the registration process

### 1.2 Verify Email
1. Check your email for verification link
2. Click the verification link to activate your account
3. Log in to your Hugging Face account

## Step 2: Access Qwen-Image Model

### 2.1 Navigate to Model
1. Go to [Qwen/Qwen-Image](https://huggingface.co/Qwen/Qwen-Image)
2. Review the model information and capabilities
3. Note the model supports:
   - Text-to-image generation
   - Multiple aspect ratios
   - Excellent text rendering
   - Apache 2.0 license (commercial use allowed)

### 2.2 Accept Model Terms
1. Click "Use this model" button
2. Accept the model terms and conditions
3. This gives you access to use the model via API

## Step 3: Generate API Token

### 3.1 Access Settings
1. Click on your profile picture in the top right
2. Select "Settings" from the dropdown menu
3. Navigate to "Access Tokens" in the left sidebar

### 3.2 Create New Token
1. Click "New token" button
2. Fill in the token details:
   - **Name**: `event-saas-image-generation`
   - **Role**: `Read` (for inference API access)
   - **Description**: `API token for image generation in event SaaS application`
3. Click "Generate token"

### 3.3 Save Token Securely
1. **IMPORTANT**: Copy the token immediately (it won't be shown again)
2. Store it securely (password manager recommended)
3. Add it to your environment variables

## Step 4: Environment Configuration

### 4.1 Add to .env.local
```bash
# Add this line to your .env.local file
NEXT_PUBLIC_HUGGING_FACE_API_TOKEN=hf_your_token_here
```

### 4.2 Update Environment Configuration
Add the new environment variable to your configuration files:

#### Update env.mjs
```javascript
// Add to the env object
NEXT_PUBLIC_HUGGING_FACE_API_TOKEN: process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN || "",
```

#### Update Environment Validation (when re-enabled)
```javascript
// Add to client environment variables
NEXT_PUBLIC_HUGGING_FACE_API_TOKEN: z.string().min(1),
```

## Step 5: Test API Access

### 5.1 Create Test Script
Create a test script to verify API access:

```typescript
// scripts/test-hugging-face-api.ts
import { config } from 'dotenv';

config({ path: '.env.local' });

async function testHuggingFaceAPI() {
  const apiToken = process.env.NEXT_PUBLIC_HUGGING_FACE_API_TOKEN;
  
  if (!apiToken) {
    console.error('❌ Hugging Face API token not found');
    return;
  }

  console.log('🔑 API Token found, testing connection...');

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/Qwen/Qwen-Image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'A simple test image of a cat',
          parameters: {
            width: 512,
            height: 512,
            num_inference_steps: 20,
            true_cfg_scale: 4.0
          }
        }),
      }
    );

    if (response.ok) {
      console.log('✅ Hugging Face API connection successful!');
      console.log('📊 Response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is binary (image) or JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('image')) {
        console.log('🖼️ Received image data successfully');
      } else {
        const data = await response.json();
        console.log('📄 Response data:', data);
      }
    } else {
      console.error('❌ API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('📄 Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error testing Hugging Face API:', error);
  }
}

testHuggingFaceAPI();
```

### 5.2 Run Test
```bash
# Install dependencies if needed
npm install dotenv

# Run the test script
npx tsx scripts/test-hugging-face-api.ts
```

## Step 6: Verify Setup

### 6.1 Check Token Permissions
1. Go back to Hugging Face Settings > Access Tokens
2. Verify your token has the correct permissions
3. Test token access with the test script above

### 6.2 Monitor Usage
1. Check your Hugging Face dashboard for API usage
2. Monitor rate limits (30 requests/minute on free tier)
3. Track monthly usage (30,000 requests/month free)

## Troubleshooting

### Common Issues

#### Token Not Working
- Verify token is copied correctly
- Check token permissions (should be "Read" role)
- Ensure token hasn't expired

#### Rate Limit Exceeded
- Free tier: 30 requests/minute
- Wait before making more requests
- Consider upgrading to paid plan for higher limits

#### Model Access Denied
- Ensure you've accepted the model terms
- Check if model requires special access
- Verify your account is properly verified

#### Environment Variable Issues
- Check .env.local file exists
- Verify variable name is correct
- Restart development server after changes

## Next Steps

After completing this setup:

1. **Test API Integration**: Run the test script to verify everything works
2. **Compare Image Quality**: Test with your current prompts
3. **Implement Provider**: Create Hugging Face provider class
4. **Update Environment**: Add token to production environment
5. **Monitor Usage**: Track API usage and costs

## Security Notes

- **Never commit API tokens** to version control
- **Use environment variables** for all API keys
- **Rotate tokens regularly** for security
- **Monitor usage** to prevent unexpected charges
- **Use least privilege** principle for token permissions 