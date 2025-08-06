# Traditional Authentication Testing Guide

## 🎯 **Testing Overview**

Your traditional username/password authentication system is now ready for testing! This guide will help you verify that all authentication methods work correctly.

## 🚀 **Quick Start**

1. **Development Server**: The server should be running at `http://localhost:3000`
2. **Database**: Ensure your PostgreSQL database is running and connected
3. **Environment**: Make sure all environment variables are set (check `.env.local`)

## 📋 **Test Scenarios**

### **1. Registration Testing**

#### **Test Case 1.1: Valid Registration**
- **URL**: `http://localhost:3000/register`
- **Steps**:
  1. Click on "Create Account" tab
  2. Fill in the form:
     - Username: `testuser123`
     - Email: `test@example.com`
     - Password: `TestPass123`
     - Confirm Password: `TestPass123`
  3. Click "Create Account"
- **Expected Result**: Success message, redirect to login page

#### **Test Case 1.2: Duplicate Username**
- **Steps**:
  1. Try to register with the same username: `testuser123`
  2. Use different email: `test2@example.com`
- **Expected Result**: Error message "Username already taken"

#### **Test Case 1.3: Duplicate Email**
- **Steps**:
  1. Try to register with the same email: `test@example.com`
  2. Use different username: `testuser456`
- **Expected Result**: Error message "Email already registered"

#### **Test Case 1.4: Password Validation**
- **Test Weak Passwords**:
  - `123` (too short)
  - `password` (no uppercase, no number)
  - `PASSWORD` (no lowercase, no number)
  - `Password` (no number)
- **Expected Result**: Appropriate validation error messages

#### **Test Case 1.5: Username Validation**
- **Test Invalid Usernames**:
  - `ab` (too short)
  - `verylongusername123456789` (too long)
  - `user@name` (invalid characters)
  - `user name` (spaces not allowed)
- **Expected Result**: Appropriate validation error messages

### **2. Login Testing**

#### **Test Case 2.1: Valid Login with Username**
- **URL**: `http://localhost:3000/login`
- **Steps**:
  1. Click on "Username/Password" tab
  2. Enter username: `testuser123`
  3. Enter password: `TestPass123`
  4. Click "Sign In"
- **Expected Result**: Success message, redirect to dashboard

#### **Test Case 2.2: Valid Login with Email**
- **Steps**:
  1. Use email: `test@example.com`
  2. Use password: `TestPass123`
- **Expected Result**: Success message, redirect to dashboard

#### **Test Case 2.3: Invalid Credentials**
- **Steps**:
  1. Try wrong password: `WrongPass123`
- **Expected Result**: Error message "Invalid credentials"

#### **Test Case 2.4: Non-existent User**
- **Steps**:
  1. Try username: `nonexistentuser`
  2. Try any password
- **Expected Result**: Error message "Invalid credentials"

### **3. Magic Link Testing**

#### **Test Case 3.1: Magic Link Registration**
- **Steps**:
  1. Go to register page
  2. Click "Magic Link" tab
  3. Enter email: `magic@example.com`
  4. Click "Sign Up with Email"
- **Expected Result**: Success message about checking email

#### **Test Case 3.2: Magic Link Login**
- **Steps**:
  1. Go to login page
  2. Click "Magic Link" tab
  3. Enter email: `test@example.com`
  4. Click "Sign In with Email"
- **Expected Result**: Success message about checking email

### **4. Google OAuth Testing**

#### **Test Case 4.1: Google OAuth Login**
- **Steps**:
  1. Click "Google" button on any auth page
  2. Complete Google OAuth flow
- **Expected Result**: Redirect to dashboard after successful OAuth

### **5. Combined Interface Testing**

#### **Test Case 5.1: Tab Switching**
- **Steps**:
  1. Go to login/register page
  2. Switch between "Magic Link" and "Username/Password" tabs
  3. Verify form fields update correctly
- **Expected Result**: Smooth tab transitions, appropriate form fields

#### **Test Case 5.2: Form State Management**
- **Steps**:
  1. Fill out form partially
  2. Switch tabs
  3. Switch back
- **Expected Result**: Form state is preserved or cleared appropriately

## 🔧 **Technical Testing**

### **Database Verification**

Check that users are being created correctly in the database:

```sql
-- Check users table structure
\d users;

-- Check for new users
SELECT id, username, email, name, role, created_at 
FROM users 
WHERE username IS NOT NULL 
ORDER BY created_at DESC;
```

### **API Testing**

Test the registration API directly:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apitest",
    "email": "apitest@example.com",
    "password": "ApiTest123"
  }'
```

### **Password Security Verification**

Verify that passwords are properly hashed:

```sql
-- Check that passwords are hashed (should not be plain text)
SELECT username, password 
FROM users 
WHERE username = 'testuser123';
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: "CredentialsSignin" Error**
- **Cause**: Invalid username/password combination
- **Solution**: Verify credentials and ensure user exists

### **Issue 2: Database Connection Error**
- **Cause**: PostgreSQL not running or connection issues
- **Solution**: Check database connection and environment variables

### **Issue 3: Build Errors**
- **Cause**: TypeScript compilation issues
- **Solution**: Run `npm run build` to identify and fix errors

### **Issue 4: OAuth Errors**
- **Cause**: Missing or incorrect Google OAuth credentials
- **Solution**: Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

## ✅ **Success Criteria**

The authentication system is working correctly when:

1. ✅ Users can register with username, email, and password
2. ✅ Users can login with username/email and password
3. ✅ Magic link authentication still works
4. ✅ Google OAuth still works
5. ✅ All validation errors display correctly
6. ✅ Password hashing is working (passwords stored as hashes)
7. ✅ Duplicate username/email prevention works
8. ✅ Tab interface works smoothly
9. ✅ Error messages are clear and helpful
10. ✅ Successful authentication redirects to dashboard

## 🎉 **Next Steps**

Once testing is complete:

1. **User Management**: Update admin dashboard to show username field
2. **Profile Management**: Allow users to update username/password
3. **Password Reset**: Implement password reset functionality
4. **Email Verification**: Add optional email verification
5. **Security Enhancements**: Add rate limiting, 2FA, etc.

## 📞 **Support**

If you encounter any issues during testing:

1. Check the browser console for JavaScript errors
2. Check the terminal for server errors
3. Verify database connectivity
4. Ensure all environment variables are set correctly

---

**Happy Testing! 🚀** 