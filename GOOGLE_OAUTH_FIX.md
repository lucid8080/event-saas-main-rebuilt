# Google OAuth Redirect URI Fix Guide

## Problem
You're encountering this error when trying to sign in with Google:
```
Access blocked: Authorization Error
Error 400: invalid_request
Request details: redirect_uri=http://0.0.0.0:3000/api/auth/callback/google
```

## Root Cause
The redirect URI `http://0.0.0.0:3000/api/auth/callback/google` is not authorized in your Google Cloud Console OAuth configuration.

## Solution

### Step 1: Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project

2. **Navigate to OAuth Configuration**
   - Go to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID
   - Click on it to edit

3. **Add Authorized Redirect URIs**
   Add these URLs to the **Authorized redirect URIs** section:

   **For Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   http://127.0.0.1:3000/api/auth/callback/google
   ```

   **For Production (replace with your domain):**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

4. **Save Changes**
   - Click **Save** to update the configuration

### Step 2: Environment Variables Setup

Create a `.env.local` file in your project root with these variables:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your_auth_secret_here

# Other required variables (if not already set)
DATABASE_URL=your_database_url
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_email@domain.com
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Generate Auth Secret

Run this command to generate a secure auth secret:
```bash
npx auth secret
```

Or use this online generator: https://generate-secret.vercel.app/32

### Step 4: Restart Development Server

After making these changes:
```bash
npm run dev
```

## Common Issues and Solutions

### Issue 1: Still getting redirect URI error
**Solution:** Make sure you've added ALL the redirect URIs listed above to Google Cloud Console.

### Issue 2: OAuth consent screen not configured
**Solution:** 
1. Go to **APIs & Services** → **OAuth consent screen**
2. Configure the consent screen with your app name and domain
3. Add your email as a test user if in testing mode

### Issue 3: Google+ API not enabled
**Solution:**
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Enable the API if not already enabled

### Issue 4: Wrong client ID/secret
**Solution:**
1. Double-check your environment variables
2. Make sure you're using the correct OAuth 2.0 Client ID (not API key)
3. Verify the client secret matches the client ID

## Testing the Fix

1. **Clear browser cache and cookies**
2. **Restart your development server**
3. **Try signing in with Google again**
4. **Check the browser console for any errors**

## Production Deployment

When deploying to production:

1. **Update Google Cloud Console** with your production domain
2. **Set environment variables** for production
3. **Update NEXTAUTH_URL** to your production URL
4. **Test OAuth flow** in production environment

## Additional Security

For better security in production:

1. **Use HTTPS** for all redirect URIs
2. **Set up proper domain verification** in Google Cloud Console
3. **Configure OAuth consent screen** with proper app information
4. **Use environment-specific client IDs** if needed

## Troubleshooting

If you're still having issues:

1. **Check Google Cloud Console logs** for OAuth errors
2. **Verify all environment variables** are set correctly
3. **Test with Google's OAuth playground** to verify configuration
4. **Check NextAuth.js logs** for detailed error information

## Support

If you continue to have issues:
1. Check the [NextAuth.js documentation](https://next-auth.js.org/configuration/providers/oauth)
2. Review [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the [Google Cloud Console help](https://cloud.google.com/apis/docs/oauth2) 