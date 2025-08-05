# 🔍 **GOOGLE LOGIN TROUBLESHOOTING GUIDE**

## 🎯 **Current Issue: "Server error - There is a problem with the server configuration"**

### **Error Details**
- **URL**: `https://event-saas-main-rebuilt.onrender.com/api/auth/error?error=Configuration`
- **Error Type**: Configuration error during Google OAuth authentication
- **Status**: Build completes successfully locally, but fails in production

## 🔧 **Root Cause Analysis**

The error `error=Configuration` typically indicates one of these issues:

1. **Missing Environment Variables** in production
2. **Incorrect Google OAuth Configuration**
3. **Database Connection Issues**
4. **NextAuth.js Configuration Problems**

## 📋 **Step-by-Step Troubleshooting**

### **Step 1: Verify Environment Variables in Production**

Check your Render.com environment variables. You need these **exact** variables:

```env
# Required for NextAuth.js
NEXTAUTH_URL=https://event-saas-main-rebuilt.onrender.com
AUTH_SECRET=your-secret-key-here

# Required for Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Required for database
DATABASE_URL=your-database-connection-string

# Required for email authentication
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=your-email@domain.com
```

**How to check in Render:**
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Verify all variables are set correctly

### **Step 2: Verify Google OAuth Configuration**

**In Google Cloud Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Check "Authorized redirect URIs"

**Required Redirect URIs:**
```
https://event-saas-main-rebuilt.onrender.com/api/auth/callback/google
```

**Authorized JavaScript origins:**
```
https://event-saas-main-rebuilt.onrender.com
```

### **Step 3: Check Database Connection**

Verify your database is accessible from Render:

1. **Test Database Connection:**
   ```bash
   # Check if DATABASE_URL is correct
   # Should be something like:
   # postgresql://username:password@host:port/database
   ```

2. **Common Database Issues:**
   - Database not accessible from Render's IP
   - Incorrect connection string
   - Database credentials expired
   - Database service down

### **Step 4: Verify NextAuth.js Configuration**

The configuration should look like this:

```typescript
// auth.config.ts
export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig;
```

```typescript
// auth.ts
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    // ... existing callbacks
  },
  ...authConfig,
});
```

## 🚨 **Common Issues and Solutions**

### **Issue 1: Missing AUTH_SECRET**
**Error**: Configuration error
**Solution**: Generate a secure random string:
```bash
openssl rand -base64 32
```

### **Issue 2: Incorrect NEXTAUTH_URL**
**Error**: Redirect URI mismatch
**Solution**: Must match your production domain exactly:
```env
NEXTAUTH_URL=https://event-saas-main-rebuilt.onrender.com
```

### **Issue 3: Google OAuth Redirect URI Mismatch**
**Error**: OAuth callback fails
**Solution**: Add exact redirect URI to Google Console:
```
https://event-saas-main-rebuilt.onrender.com/api/auth/callback/google
```

### **Issue 4: Database Connection Failed**
**Error**: Prisma adapter fails
**Solution**: Check DATABASE_URL and database accessibility

### **Issue 5: Environment Variables Not Loaded**
**Error**: Undefined variables
**Solution**: Restart Render service after adding variables

## 🔍 **Debugging Steps**

### **Step 1: Enable Debug Mode**
Temporarily enable debug mode in production:

```typescript
// auth.ts
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  // ... other config
  debug: true, // Add this line temporarily
  ...authConfig,
});
```

### **Step 2: Check Render Logs**
1. Go to Render dashboard
2. Select your service
3. Go to "Logs" tab
4. Look for authentication-related errors

### **Step 3: Test Environment Variables**
Create a test API route to verify variables:

```typescript
// app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}
```

## 🎯 **Quick Fix Checklist**

- [ ] **AUTH_SECRET** is set in Render environment variables
- [ ] **NEXTAUTH_URL** matches your production domain exactly
- [ ] **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET** are set
- [ ] **DATABASE_URL** is correct and accessible
- [ ] Google OAuth redirect URI is configured correctly
- [ ] Render service has been restarted after adding variables
- [ ] Database is running and accessible

## 🚀 **Deployment Verification**

After fixing the issues:

1. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Fix: Google OAuth configuration"
   git push origin main
   ```

2. **Monitor Render Deployment:**
   - Watch the build logs
   - Check for any new errors
   - Verify environment variables are loaded

3. **Test Authentication:**
   - Try Google login again
   - Check if error page still appears
   - Verify redirect works correctly

## 📞 **If Issues Persist**

1. **Check Render Logs** for specific error messages
2. **Verify Environment Variables** are correctly set
3. **Test Database Connection** from Render
4. **Review Google OAuth Configuration** in Google Console
5. **Enable Debug Mode** temporarily to get more detailed errors

## 🎉 **Expected Result**

After fixing the configuration issues:
- ✅ **Google login works** without configuration errors
- ✅ **OAuth callback** completes successfully
- ✅ **User sessions** are created properly
- ✅ **No "server configuration" errors**

The key is ensuring all environment variables are properly set in your Render production environment and that Google OAuth is configured with the correct redirect URIs. 