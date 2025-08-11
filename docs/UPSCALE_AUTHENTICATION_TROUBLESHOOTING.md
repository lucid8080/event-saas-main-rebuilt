# 🔧 Upscale Authentication Troubleshooting Guide

## 🚨 **Issue: 403 Forbidden Error When Upscaling Images**

### **Problem Description**
Users are getting a "403 Forbidden" error when trying to upscale images from the gallery, even when they have sufficient credits and have successfully upscaled before.

**Error Details:**
- **API Endpoint**: `POST /api/upscale-image`
- **Status Code**: 403 Forbidden
- **Error Message**: "Unauthorized"
- **User Impact**: Cannot upscale images despite having credits

### **Root Cause Analysis**

The issue is typically caused by **session authentication failures** where the user's session is not being properly recognized by the API, even though they appear to be logged in on the frontend.

**Common Causes:**
1. **Session Expiration**: User session has expired but frontend hasn't detected it
2. **Browser Cache Issues**: Stale authentication data in browser cache
3. **Cookie Problems**: Authentication cookies are corrupted or missing
4. **OAuth vs Email/Password**: Different authentication methods may have different session handling
5. **Browser Extensions**: Extensions interfering with authentication cookies

### **Diagnosis Steps**

#### **Step 1: Check User Account Status**
```bash
# Run this script to check user status
npx tsx scripts/test-api-upscaled-display.ts
```

**Expected Output for Working User:**
```
✅ User found:
   Email: user@example.com
   Role: USER
   Credits: 23
   Email Verified: ✅
   OAuth Accounts: 0
```

#### **Step 2: Check Browser Session**
1. Open browser Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Look for `next-auth.session-token` cookie
4. Check if the cookie exists and has a value

#### **Step 3: Test Authentication**
1. Try signing out and signing back in
2. Check if the issue persists
3. Try using a different browser or incognito mode

### **Immediate Solutions**

#### **Solution 1: Refresh Session (Recommended)**
1. **Sign Out**: Click "Sign Out" in the user menu
2. **Clear Browser Data**: Clear cookies and cache for the site
3. **Sign Back In**: Sign in again with your credentials
4. **Test Upscaling**: Try upscaling an image again

#### **Solution 2: Use Incognito/Private Mode**
1. Open an incognito/private browser window
2. Navigate to the application
3. Sign in with your credentials
4. Try upscaling an image

#### **Solution 3: Switch to Google OAuth**
1. Sign out of your current account
2. Click "Sign In with Google"
3. Use your Google account to sign in
4. Try upscaling an image

#### **Solution 4: Clear Browser Extensions**
1. Temporarily disable browser extensions
2. Try upscaling in a clean browser session
3. Re-enable extensions one by one to identify conflicts

### **Advanced Troubleshooting**

#### **For Technical Users: Browser Developer Tools**

1. **Check Network Requests**:
   - Open Developer Tools → Network tab
   - Try to upscale an image
   - Look for the failed `POST /api/upscale-image` request
   - Check the request headers for authentication cookies

2. **Check Console Errors**:
   - Open Developer Tools → Console tab
   - Look for any JavaScript errors
   - Check for authentication-related error messages

3. **Check Application Storage**:
   - Open Developer Tools → Application tab
   - Check Local Storage and Session Storage
   - Look for any authentication-related data

#### **For Administrators: Server-Side Debugging**

1. **Check Server Logs**:
   ```bash
   # Look for authentication debug messages
   grep "Upscale API Authentication Debug" server.log
   ```

2. **Run User Diagnosis**:
   ```bash
   # Check specific user status
   npx tsx scripts/test-api-upscaled-display.ts
   ```

3. **Check Database Session**:
   ```sql
   -- Check if user has valid sessions
   SELECT * FROM sessions WHERE userId = 'user-id-here';
   ```

### **Prevention Measures**

#### **For Users:**
1. **Use Google OAuth**: More reliable than email/password authentication
2. **Regular Sign-Outs**: Sign out and back in periodically to refresh sessions
3. **Browser Maintenance**: Keep browser updated and clear cache regularly
4. **Avoid Multiple Tabs**: Don't keep the application open in too many tabs

#### **For Developers:**
1. **Enhanced Error Handling**: Better error messages for authentication failures
2. **Session Monitoring**: Add logging to track authentication issues
3. **Frontend Validation**: Check session status before making API calls
4. **Graceful Degradation**: Provide fallback options when authentication fails

### **Common Error Codes**

| Status Code | Error | Solution |
|-------------|-------|----------|
| 401 | Unauthorized | Sign out and sign back in |
| 403 | Forbidden | Check session, try incognito mode |
| 402 | Payment Required | Add credits to account |
| 404 | Not Found | Image doesn't exist or user doesn't own it |
| 500 | Internal Server Error | Contact support |

### **Support Information**

If the issue persists after trying all solutions:

1. **Collect Information**:
   - Browser type and version
   - Operating system
   - Error messages from console
   - Steps to reproduce the issue

2. **Contact Support**:
   - Provide the collected information
   - Include your user email address
   - Describe what you've already tried

### **Technical Implementation**

The upscale API route includes enhanced debugging:

```typescript
// Enhanced authentication debugging
console.log("🔍 Upscale API Authentication Debug:");
console.log(`   Session exists: ${!!session}`);
console.log(`   User ID: ${session?.user?.id || 'undefined'}`);
console.log(`   User email: ${session?.user?.email || 'undefined'}`);
```

This helps identify authentication issues in server logs.

### **Success Criteria**

The issue is resolved when:
- ✅ User can successfully upscale images
- ✅ No 403 Forbidden errors occur
- ✅ Session remains stable across multiple upscale attempts
- ✅ User receives appropriate error messages for other issues (credits, etc.)

---

**Last Updated**: August 11, 2025  
**Version**: 1.0  
**Status**: Active
