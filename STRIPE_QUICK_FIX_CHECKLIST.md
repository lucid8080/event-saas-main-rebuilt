# Stripe Quick Fix Checklist

## 🚨 **Immediate Action Required**

You're getting the error because of incorrect Stripe configuration. Follow this checklist step by step:

## ✅ **Step 1: Check Your Current Setup**

1. **Go to `/dashboard/debug`** in your application
2. **Click "Comprehensive Stripe Debug"**
3. **Review the results** - This will show you exactly what's wrong

## ✅ **Step 2: Fix Environment Variables**

### **Check your `.env.local` file:**

```env
# REQUIRED - Stripe API Key (Test Mode)
STRIPE_API_KEY=sk_test_your-actual-test-key-here

# REQUIRED - Webhook Secret (Test Mode)  
STRIPE_WEBHOOK_SECRET=whsec_your-actual-webhook-secret-here

# REQUIRED - Price IDs (NOT Product IDs!)
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID=price_your-starter-monthly-price-id
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID=price_your-starter-yearly-price-id
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_your-pro-monthly-price-id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_your-pro-yearly-price-id
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_your-business-monthly-price-id
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_your-business-yearly-price-id

# REQUIRED - App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ✅ **Step 3: Get Correct Price IDs from Stripe**

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Make sure you're in Test Mode** (toggle in top-right corner)
3. **Go to Products** in the left sidebar
4. **For each product:**
   - Click on the product (e.g., "Starter Plan")
   - Scroll down to "Pricing" section
   - Copy the **Price ID** (starts with `price_`)
   - **NOT the Product ID** (starts with `prod_`)

## ✅ **Step 4: Common Issues to Check**

### **❌ Wrong: Using Product IDs**
```env
# WRONG - These are Product IDs
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID=prod_SlQU4uTEKnOwMD
```

### **✅ Correct: Using Price IDs**
```env
# CORRECT - These are Price IDs
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID=price_1ABC123DEF456
```

### **❌ Wrong: Using Live Mode Keys**
```env
# WRONG - Live mode key
STRIPE_API_KEY=sk_live_...
```

### **✅ Correct: Using Test Mode Keys**
```env
# CORRECT - Test mode key
STRIPE_API_KEY=sk_test_...
```

## ✅ **Step 5: Verify the Fix**

1. **Restart your development server**
2. **Go to `/dashboard/debug`**
3. **Click "Comprehensive Stripe Debug"**
4. **Look for:**
   - ✅ All Price IDs should show "Valid"
   - ✅ No Product IDs should be detected
   - ✅ Stripe connectivity should be successful
   - ✅ No critical recommendations

## ✅ **Step 6: Test the Checkout**

1. **Go to `/pricing`**
2. **Select a plan** (e.g., Starter)
3. **Click "Upgrade"**
4. **Should redirect to Stripe checkout** without errors

## 🚨 **If Still Getting Errors**

### **Error: "No such price"**
- **Solution**: You're still using Product IDs instead of Price IDs
- **Action**: Double-check all your environment variables start with `price_`

### **Error: "Invalid API key"**
- **Solution**: Wrong API key or not in test mode
- **Action**: Use test mode API key (`sk_test_...`)

### **Error: "Authentication failed"**
- **Solution**: API key is invalid or expired
- **Action**: Generate a new test API key in Stripe Dashboard

## 📞 **Need Help?**

1. **Run the debug tools** at `/dashboard/debug`
2. **Check the console logs** for detailed error messages
3. **Verify your Stripe Dashboard** is in Test Mode
4. **Make sure all Price IDs** start with `price_`

---

**Status**: Follow this checklist step by step 