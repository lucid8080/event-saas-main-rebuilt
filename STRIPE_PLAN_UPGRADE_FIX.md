# Stripe Plan Upgrade Fix Guide

## 🚨 **Current Issue**
The system shows "starter plan" but when users try to upgrade by choosing a plan, the credits and new plan are not reflected in their account.

## 🔍 **Root Cause Analysis**

The issue occurs because the Stripe integration requires several components to work together:

1. **Environment Variables**: Missing or incorrect Stripe configuration
2. **Webhook Processing**: Credits are assigned via webhook events, not direct checkout
3. **Plan Matching**: Price IDs must match between Stripe and application config
4. **User Metadata**: User ID must be passed correctly during checkout
5. **Database Updates**: User record must be updated with subscription data

## 🛠️ **Step-by-Step Fix**

### Step 1: Check Current Status

1. **Go to the Debug Dashboard**: Navigate to `/dashboard/debug`
2. **Click "Check Stripe Status"**: This will run a comprehensive diagnostic
3. **Review the Results**: Look for critical issues and warnings

### Step 2: Set Up Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Stripe Configuration
STRIPE_API_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Price IDs (get these from your Stripe dashboard)
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID=price_your-starter-monthly-id
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID=price_your-starter-yearly-id
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_your-pro-monthly-id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_your-pro-yearly-id
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_your-business-monthly-id
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_your-business-yearly-id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Get Stripe API Keys

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Navigate to Developers → API Keys**
3. **Copy your Secret Key** (starts with `sk_test_` for test mode)
4. **Set it as `STRIPE_API_KEY`**

### Step 4: Create Price IDs

1. **Go to Stripe Dashboard → Products**
2. **Create products for each plan:**
   - Starter ($30/month, $288/year)
   - Pro ($60/month, $576/year) 
   - Business ($120/month, $1152/year)
3. **Copy the Price IDs** (start with `price_`)
4. **Set them in your environment variables**

### Step 5: Set Up Webhook

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint:** `http://localhost:3000/api/webhooks/stripe`
3. **Select events:** `checkout.session.completed`, `invoice.payment_succeeded`
4. **Copy the webhook secret** (starts with `whsec_`)
5. **Set it as `STRIPE_WEBHOOK_SECRET`**

### Step 6: Test the Setup

1. **Restart your development server**
2. **Go to `/dashboard/debug`**
3. **Click "Check Stripe Status"**
4. **Verify all systems are operational**

## 🔧 **Troubleshooting**

### Issue: "Stripe API key is missing"
**Solution**: Add `STRIPE_API_KEY` to your `.env.local` file

### Issue: "Webhook secret is missing"
**Solution**: Add `STRIPE_WEBHOOK_SECRET` to your `.env.local` file

### Issue: "Invalid price IDs found"
**Solution**: Update the price IDs in your environment variables to match your Stripe dashboard

### Issue: "Stripe API connectivity failed"
**Solution**: Check your API key and network connectivity

### Issue: "User has a Stripe price ID but it doesn't match any configured plan"
**Solution**: Ensure your price IDs in the environment variables match the ones in your Stripe dashboard

## 🧪 **Testing the Fix**

### Test 1: Environment Check
1. Go to `/dashboard/debug`
2. Click "Check Stripe Status"
3. Verify no critical issues are shown

### Test 2: Plan Upgrade Flow
1. Go to `/pricing`
2. Select a plan (e.g., Pro)
3. Complete the Stripe checkout
4. Check that credits are assigned correctly

### Test 3: Manual Credit Assignment
1. Go to `/dashboard/debug`
2. Click "Test Credit Assignment"
3. Enter a valid price ID
4. Verify credits are assigned

## 📊 **Expected Results**

After fixing the issue:

- ✅ **Environment Variables**: All required variables are set
- ✅ **Stripe Connectivity**: API calls work successfully
- ✅ **Plan Matching**: Price IDs match between Stripe and app
- ✅ **Credit Assignment**: Credits are assigned on plan upgrade
- ✅ **User Experience**: Plan upgrades work seamlessly

## 🔄 **Plan Upgrade Flow**

The complete flow works as follows:

1. **User selects plan** on `/pricing` page
2. **BillingFormButton** calls `generateUserStripe` action
3. **Stripe Checkout** is created with user metadata
4. **User completes payment** on Stripe
5. **Webhook receives** `checkout.session.completed` event
6. **Credits are assigned** based on the purchased plan
7. **User record is updated** with subscription data

## 🚀 **Quick Fix for Testing**

If you want to test immediately without setting up Stripe:

1. **Use the debug dashboard** at `/dashboard/debug`
2. **Click "Test Credit Assignment"**
3. **Enter a price ID** (you can use any valid Stripe price ID)
4. **Credits will be assigned manually**

## 📞 **Need Help?**

If you need help setting up Stripe:

1. Check the [Stripe Documentation](https://stripe.com/docs)
2. Use the debug tools I created
3. Check the server logs for webhook events
4. Verify your environment variables are set correctly

## 🔍 **Monitoring**

After fixing the issue, monitor:

- **Webhook Events**: Check server logs for successful webhook processing
- **Credit Assignment**: Verify credits are assigned correctly
- **User Experience**: Ensure plan upgrades work smoothly
- **Error Logs**: Watch for any new issues

---

**Status**: Ready for implementation and testing 