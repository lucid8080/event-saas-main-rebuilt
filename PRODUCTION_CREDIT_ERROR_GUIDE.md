# 🔧 Production Credit Application Error Guide

## 🎯 **Quick Diagnosis Steps**

### **Step 1: Run the Diagnostic Script**
On your production server, run:
```bash
npx tsx scripts/production-credit-debug.ts
```

This will check:
- ✅ Environment variables
- ✅ Database connection
- ✅ User roles and permissions
- ✅ Credit update functionality
- ✅ API route structure

### **Step 2: Check Browser Developer Tools**
1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Try to apply credits to a user**
4. **Look for the PATCH request** to `/api/admin/users/[id]`
5. **Check the response status code and error message**

### **Step 3: Check Console for Errors**
1. **Go to Console tab** in Developer Tools
2. **Look for any JavaScript errors**
3. **Check for authentication errors**

## 🚨 **Common Issues and Solutions**

### **Issue 1: Authentication Error**
**Symptoms:**
- `req.auth.user is undefined`
- 401 Unauthorized errors
- "Insufficient permissions" messages

**Solution:**
```bash
# Run the email verification fix
npm run fix:email:verification:auto
```

### **Issue 2: Environment Variables Missing**
**Symptoms:**
- Database connection errors
- Authentication failures
- Feature flags not working

**Solution:**
Make sure these are set in your production environment:
```env
DATABASE_URL=your_database_url
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Issue 3: Feature Flags Disabled**
**Symptoms:**
- UI components not loading
- Admin features not available
- Charts not displaying

**Solution:**
Set these environment variables:
```env
NEXT_PUBLIC_ENABLE_CHARTS=true
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true
NEXT_PUBLIC_ENABLE_ANIMATIONS=false
NEXT_PUBLIC_ENABLE_PERF_MONITORING=false
```

### **Issue 4: Database Permission Issues**
**Symptoms:**
- Database connection errors
- Credit updates failing
- User queries failing

**Solution:**
1. Check database connection string
2. Verify database user permissions
3. Ensure database is accessible from production server

## 🔍 **Detailed Troubleshooting**

### **Check API Route Response**
When you try to apply credits, check the Network tab for:
- **Request URL**: Should be `/api/admin/users/[user-id]`
- **Request Method**: Should be `PATCH`
- **Request Headers**: Should include authentication
- **Request Body**: Should include credits data
- **Response Status**: Should be 200 for success

### **Check Authentication Status**
1. **Sign out completely**
2. **Clear browser cache/cookies**
3. **Sign in again with Google OAuth**
4. **Check if you see "Admin Panel" in sidebar**

### **Verify User Role**
Make sure your user has the correct role:
- **HERO** or **ADMIN** role required
- **Email must be verified**
- **User must exist in database**

## 🛠️ **Immediate Actions**

### **Action 1: Fix Email Verification**
```bash
npm run fix:email:verification:auto
```

### **Action 2: Check User Status**
```bash
npx tsx scripts/debug-auth-issue.ts
```

### **Action 3: Test Credit Application**
```bash
npx tsx scripts/test-credit-api.ts
```

### **Action 4: Verify Environment**
```bash
npx tsx scripts/production-status-check.ts
```

## 📋 **Production Checklist**

Before trying to apply credits, ensure:

- [ ] **Database is connected and working**
- [ ] **Environment variables are set correctly**
- [ ] **User has HERO or ADMIN role**
- [ ] **Email is verified**
- [ ] **Feature flags are enabled**
- [ ] **Authentication is working**
- [ ] **API routes are accessible**

## 🚀 **Quick Fix Commands**

### **Complete Reset (if needed):**
```bash
# 1. Fix email verification
npm run fix:email:verification:auto

# 2. Check authentication
npx tsx scripts/debug-auth-issue.ts

# 3. Test credit functionality
npx tsx scripts/test-credit-api.ts

# 4. Verify production status
npx tsx scripts/production-status-check.ts
```

### **Environment Variables to Set:**
```env
# Critical for authentication
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Critical for features
NEXT_PUBLIC_ENABLE_CHARTS=true
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true
```

## 📞 **If Still Having Issues**

1. **Run the diagnostic script** and share the output
2. **Check browser developer tools** and share any errors
3. **Verify environment variables** are set correctly
4. **Check database connection** and permissions
5. **Ensure user has proper role** and email verification

The diagnostic script will help identify the exact issue! 🔍 