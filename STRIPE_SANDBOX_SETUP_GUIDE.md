# Stripe Sandbox Setup Guide

## 🚨 **Current Issue**
You're getting the error: `No such price: 'prod_SlQU4uTEKnOwMD'`

**Root Cause**: You're using a **Product ID** (`prod_...`) instead of a **Price ID** (`price_...`)

## 🔧 **How to Fix This**

### **Step 1: Understand the Difference**

- **Product ID**: `prod_...` - This is the product itself (like "Starter Plan")
- **Price ID**: `price_...` - This is the specific pricing for that product (like "$30/month" or "$288/year")

You need **Price IDs**, not Product IDs!

### **Step 2: Set Up Stripe Sandbox Environment**

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Make sure you're in Test Mode** (toggle in the top-right corner should show "Test mode")
3. **Navigate to Developers → API Keys**
4. **Copy your Test Secret Key** (starts with `sk_test_`)

### **Step 3: Create Products and Prices in Stripe Sandbox**

#### **For Starter Plan:**

1. **Go to Products** in the left sidebar
2. **Click "Add product"**
3. **Product details:**
   - **Name**: `Starter Plan`
   - **Description**: `Perfect for getting started with 100 credits per month`
4. **Add pricing:**
   - **Monthly Price**: 
     - Amount: `$30.00`
     - Billing period: `Monthly`
     - Click "Save price"
   - **Yearly Price**:
     - Amount: `$288.00`
     - Billing period: `Yearly`
     - Click "Save price"
5. **Copy the Price IDs** (they start with `price_`)

#### **For Pro Plan:**

1. **Click "Add product"**
2. **Product details:**
   - **Name**: `Pro Plan`
   - **Description**: `Best for growing businesses with 200 credits per month`
3. **Add pricing:**
   - **Monthly Price**: `$60.00`, Billing period: `Monthly`
   - **Yearly Price**: `$576.00`, Billing period: `Yearly`
4. **Copy the Price IDs**

#### **For Business Plan:**

1. **Click "Add product"**
2. **Product details:**
   - **Name**: `Business Plan`
   - **Description**: `For larger organizations with 500 credits per month`
3. **Add pricing:**
   - **Monthly Price**: `$120.00`, Billing period: `Monthly`
   - **Yearly Price**: `$1152.00`, Billing period: `Yearly`
4. **Copy the Price IDs**

### **Step 4: Update Environment Variables**

Update your `.env.local` file with the **Price IDs** (not Product IDs):

```env
# Stripe Configuration (Sandbox/Test Mode)
STRIPE_API_KEY=sk_test_your-test-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-test-webhook-secret

# Stripe Price IDs (NOT Product IDs!)
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID=price_your-starter-monthly-price-id
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID=price_your-starter-yearly-price-id
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_your-pro-monthly-price-id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_your-pro-yearly-price-id
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_your-business-monthly-price-id
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_your-business-yearly-price-id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 5: Set Up Webhook for Sandbox**

1. **Go to Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL**: `http://localhost:3000/api/webhooks/stripe`
4. **Select events**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
5. **Copy the webhook secret** (starts with `whsec_`)

### **Step 6: Verify Your Setup**

1. **Restart your development server**
2. **Go to `/dashboard/debug`**
3. **Click "Check Stripe Status"** - Should show no critical issues
4. **Click "Verify Pricing Configuration"** - Should show all prices match
5. **Click "Test Pricing Logic"** - Should show correct price IDs

## 🔍 **How to Find Price IDs (Not Product IDs)**

### **Method 1: From Products Page**
1. **Go to Products** in Stripe Dashboard
2. **Click on a product** (e.g., "Starter Plan")
3. **Scroll down to "Pricing" section**
4. **Copy the Price ID** (starts with `price_`)

### **Method 2: From API**
1. **Go to Developers → API Keys**
2. **Click "View test data"**
3. **Navigate to Prices**
4. **Copy the Price ID** (starts with `price_`)

## 🧪 **Testing in Sandbox**

### **Test Cards for Sandbox:**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

### **Test the Complete Flow:**
1. **Go to `/pricing`**
2. **Select a plan** (e.g., Starter)
3. **Click "Upgrade"**
4. **Complete checkout** with test card
5. **Verify credits are assigned**

## 🚨 **Common Mistakes to Avoid**

1. **❌ Using Product IDs instead of Price IDs**
   - Product ID: `prod_...` (wrong)
   - Price ID: `price_...` (correct)

2. **❌ Using Live Mode keys in development**
   - Use Test Mode keys (`sk_test_...`)

3. **❌ Not setting up webhooks**
   - Credits won't be assigned without webhooks

4. **❌ Wrong webhook URL**
   - Should be: `http://localhost:3000/api/webhooks/stripe`

## 🔧 **Troubleshooting**

### **Error: "No such price"**
- **Solution**: Make sure you're using Price IDs, not Product IDs
- **Check**: All environment variables should start with `price_`

### **Error: "Invalid API key"**
- **Solution**: Use Test Mode API key (`sk_test_...`)
- **Check**: Make sure you're in Test Mode in Stripe Dashboard

### **Error: "Webhook signature verification failed"**
- **Solution**: Use correct webhook secret from Test Mode
- **Check**: Webhook should be set up in Test Mode

### **Credits not assigned after payment**
- **Solution**: Check webhook setup and server logs
- **Check**: Use debug tools to verify webhook processing

## 📞 **Need Help?**

1. **Check the debug dashboard** at `/dashboard/debug`
2. **Verify your Price IDs** are correct
3. **Make sure you're in Test Mode**
4. **Check server logs** for detailed error messages

---

**Status**: Ready for implementation 