# 🔧 Credit Update Error Troubleshooting Guide

## 🎯 **Issue Summary**
- **Error**: "Failed to update user credits"
- **Status**: ✅ Local environment works perfectly
- **Root Cause**: Production environment issue (not codebase)

## 🔍 **Diagnosis Results**
```
✅ Local Environment Working: Credit management works perfectly
✅ Database Connection: Working correctly
✅ User Roles: HERO user (lucid8080@gmail.com) exists with proper permissions
✅ Permission System: Role-based access control working correctly
✅ API Endpoints: Credit management API functioning properly
✅ Database Updates: Credit updates working in database
❌ Production Issue: Problem is in production environment, not codebase
```

## 🚨 **Immediate Action Plan**

### **Step 1: Check Browser Developer Tools**

1. **Open Developer Tools**:
   - Press `F12` or right-click → "Inspect"
   - Go to **Network** tab
   - Go to **Console** tab

2. **Try to Update Credits**:
   - Go to your production admin dashboard
   - Try to edit a user's credits
   - Watch the Network tab for the request

3. **Look for the Failed Request**:
   - Find the `PATCH` request to `/api/admin/users/[id]`
   - Check the **Status** (401, 403, 404, 500, etc.)
   - Check the **Response** body for error details

### **Step 2: Check Authentication**

1. **Verify Login Status**:
   - Make sure you're logged in with `lucid8080@gmail.com`
   - Check if your session is still valid
   - Try logging out and back in

2. **Check Session Token**:
   - In Developer Tools → Application/Storage tab
   - Look for `next-auth.session-token` cookie
   - Make sure it exists and has a value

### **Step 3: Check User Role in Production**

1. **Run Database Check** (if you have access to production server):
   ```bash
   npx tsx scripts/diagnose-credit-application.ts
   ```

2. **Expected Output**:
   ```
   ✅ Found 1 admin users:
      - lucid8080@gmail.com (HERO)
   ```

3. **If No Admin Users Found**:
   ```bash
   npx tsx scripts/create-admin-user.ts
   ```

## 🔧 **Common Error Scenarios & Solutions**

### **Scenario 1: 401 Unauthorized**
**Symptoms**: Status 401, "Not authenticated" error
**Causes**:
- User not logged in
- Session expired
- Invalid session token

**Solutions**:
1. Log out and log back in
2. Clear browser cookies and cache
3. Check if `AUTH_SECRET` is set in production
4. Verify `NEXTAUTH_URL` is correct

### **Scenario 2: 403 Forbidden**
**Symptoms**: Status 403, "Unauthorized" or "Insufficient permissions" error
**Causes**:
- User doesn't have admin role in production
- Permission system not working correctly

**Solutions**:
1. Check user role in production database
2. Verify the user has ADMIN or HERO role
3. Run the diagnostic script on production server

### **Scenario 3: 404 Not Found**
**Symptoms**: Status 404, "User not found" or "API endpoint not found"
**Causes**:
- Invalid user ID
- API endpoint not accessible
- Wrong URL

**Solutions**:
1. Verify the user ID is correct
2. Check if the API endpoint exists
3. Verify the production URL is correct

### **Scenario 4: 500 Internal Server Error**
**Symptoms**: Status 500, generic server error
**Causes**:
- Database connection issue
- Server configuration problem
- Missing environment variables

**Solutions**:
1. Check production logs for specific error
2. Verify all environment variables are set
3. Check database connection

### **Scenario 5: JavaScript Error**
**Symptoms**: Error in browser console, no network request
**Causes**:
- Frontend JavaScript error
- Missing feature flags
- UI component issue

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify feature flags are set in production
3. Check if the UI is making the correct API call

## 📋 **Production Debugging Checklist**

### **Before Testing**
- [ ] Log in with admin account (`lucid8080@gmail.com`)
- [ ] Open browser developer tools (F12)
- [ ] Go to Network tab
- [ ] Go to Console tab

### **During Testing**
- [ ] Try to update user credits
- [ ] Look for PATCH request to `/api/admin/users/[id]`
- [ ] Check request status code
- [ ] Check response body for error message
- [ ] Look for JavaScript errors in console

### **After Testing**
- [ ] Note the exact error message
- [ ] Check the HTTP status code
- [ ] Look for any JavaScript errors
- [ ] Verify the request was actually sent

## 🛠️ **Quick Fixes to Try**

### **Fix 1: Re-login**
```bash
# Log out and log back in with admin account
# This refreshes the session token
```

### **Fix 2: Clear Browser Data**
```bash
# Clear cookies and cache
# This removes any corrupted session data
```

### **Fix 3: Check Environment Variables**
Make sure these are set in production:
```env
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
NEXT_PUBLIC_ENABLE_CHARTS=true
AUTH_SECRET=your-auth-secret
NEXTAUTH_URL=https://your-production-url.com
```

### **Fix 4: Test API Directly**
Use curl to test the API endpoint:
```bash
curl -X PATCH https://your-production-url.com/api/admin/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"credits": 100}'
```

## 📊 **Error Response Examples**

### **401 Unauthorized**
```json
{
  "error": "Not authenticated"
}
```

### **403 Forbidden**
```json
{
  "error": "Unauthorized"
}
```

### **400 Bad Request**
```json
{
  "error": "Invalid credits value"
}
```

### **404 Not Found**
```json
{
  "error": "User not found"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

## 🎯 **Next Steps**

1. **Immediate**: Follow the browser debugging steps above
2. **Identify**: Determine the exact error (status code and message)
3. **Apply**: Use the appropriate fix based on the error type
4. **Test**: Verify the fix works
5. **Document**: Note what the issue was for future reference

## 📞 **If Still Not Working**

If you've tried all the above and still get the error:

1. **Share the exact error message** from the browser
2. **Share the HTTP status code** from the network tab
3. **Share any JavaScript errors** from the console
4. **Run the diagnostic script** on production server if possible

The issue is likely one of the common scenarios above, and with the exact error details, we can provide a more specific solution.

---

**Remember**: The local environment works perfectly, so the issue is definitely in the production environment configuration or authentication. 