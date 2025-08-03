# Stripe Pricing Setup Guide

## 🚨 **Current Issue**
The pricing amounts shown on the `/pricing` page are not correctly reflected in the Stripe checkout. The Stripe products and prices need to be updated to match the application's pricing structure.

## 📊 **Correct Pricing Structure**

The application is configured with the following pricing:

### **Starter Plan** ✅ **Already Correct**
- **Monthly**: $30/month (100 credits)
- **Yearly**: $288/year (100 credits) - 20% discount
- **Credits**: 100 credits per billing cycle

### **Pro Plan**
- **Monthly**: $60/month (200 credits)
- **Yearly**: $576/year (200 credits) - 20% discount
- **Credits**: 200 credits per billing cycle

### **Business Plan**
- **Monthly**: $120/month (500 credits)
- **Yearly**: $1152/year (500 credits) - 20% discount
- **Credits**: 500 credits per billing cycle

## 🛠️ **Step-by-Step Stripe Setup**

### Step 1: Access Stripe Dashboard

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Make sure you're in Test Mode** (toggle in the top-right corner)
3. **Navigate to Products** in the left sidebar

### Step 2: Create/Update Starter Plan

1. **Click "Add product"** or find existing Starter product
2. **Product name**: `Starter Plan`
3. **Description**: `Perfect for getting started with 100 credits per month`
4. **Add pricing**:

   **Monthly Price:**
   - Amount: `$30.00` (USD)
   - Billing period: `Monthly`
   - Click "Save price"

   **Yearly Price:**
   - Amount: `$288.00` (USD)
   - Billing period: `Yearly`
   - Click "Save price"

5. **Copy the Price IDs** (they start with `price_`)

### Step 3: Create/Update Pro Plan

1. **Click "Add product"** or find existing Pro product
2. **Product name**: `Pro Plan`
3. **Description**: `Best for growing businesses with 200 credits per month`
4. **Add pricing**:

   **Monthly Price:**
   - Amount: `$60.00`
   - Billing period: `Monthly`
   - Click "Save price"

   **Yearly Price:**
   - Amount: `$576.00`
   - Billing period: `Yearly`
   - Click "Save price"

5. **Copy the Price IDs** (they start with `price_`)

### Step 4: Create/Update Business Plan

1. **Click "Add product"** or find existing Business product
2. **Product name**: `Business Plan`
3. **Description**: `For larger organizations with 500 credits per month`
4. **Add pricing**:

   **Monthly Price:**
   - Amount: `$120.00`
   - Billing period: `Monthly`
   - Click "Save price"

   **Yearly Price:**
   - Amount: `$1152.00`
   - Billing period: `Yearly`
   - Click "Save price"

5. **Copy the Price IDs** (they start with `price_`)

### Step 5: Update Environment Variables

Update your `.env.local` file with the new Price IDs:

```env
# Stripe Price IDs (replace with your actual Price IDs from Stripe)
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID=price_your-starter-monthly-id
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID=price_your-starter-yearly-id
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_your-pro-monthly-id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_your-pro-yearly-id
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_your-business-monthly-id
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_your-business-yearly-id
```

### Step 6: Verify Pricing Display

1. **Restart your development server**
2. **Go to `/pricing`** page
3. **Toggle between Monthly and Yearly** to verify:
   - Monthly prices show correctly
   - Yearly prices show the discounted amount
   - The total yearly amount is displayed correctly

## 🔧 **Troubleshooting**

### Issue: Prices don't match in Stripe checkout
**Solution**: 
1. Check that the Price IDs in your `.env.local` match the actual Price IDs in Stripe
2. Verify the amounts in Stripe match the application pricing
3. Clear browser cache and restart the development server

### Issue: Yearly discount not showing
**Solution**:
1. Ensure yearly prices are set to the correct amounts ($288, $576, $1152)
2. Check that the billing period is set to "Yearly" in Stripe
3. Verify the pricing display logic in the application

### Issue: Credits not assigned correctly
**Solution**:
1. Check that the webhook is properly configured
2. Verify the plan matching logic in the webhook handler
3. Test credit assignment using the debug tools

## 🧪 **Testing the Setup**

### Test 1: Pricing Display
1. Go to `/pricing`
2. Toggle between Monthly and Yearly
3. Verify all prices display correctly:
   - **Starter**: $30/month or $288/year (100 credits)
   - Pro: $60/month or $576/year
   - Business: $120/month or $1152/year

### Test 2: Stripe Checkout
1. Select a plan and click "Upgrade"
2. Verify the amount in Stripe checkout matches the displayed price
3. Complete the checkout process
4. Check that credits are assigned correctly

### Test 3: Debug Tools
1. Go to `/dashboard/debug`
2. Click "Check Stripe Status"
3. Verify no critical issues are shown
4. Test credit assignment if needed

## 📋 **Price ID Reference**

Keep track of your Price IDs:

| Plan | Monthly Price ID | Yearly Price ID |
|------|------------------|-----------------|
| Starter | `price_...` | `price_...` |
| Pro | `price_...` | `price_...` |
| Business | `price_...` | `price_...` |

## 🚀 **Production Setup**

When moving to production:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create the same products and prices** in Live Mode
3. **Update environment variables** with Live Mode Price IDs
4. **Update webhook endpoint** to your production URL
5. **Test the complete flow** in Live Mode

## 📞 **Need Help?**

If you encounter issues:

1. **Check Stripe Dashboard** for any error messages
2. **Verify Price IDs** match between Stripe and environment variables
3. **Use Debug Tools** at `/dashboard/debug` to diagnose issues
4. **Check Server Logs** for webhook processing errors

---

**Status**: Ready for implementation 