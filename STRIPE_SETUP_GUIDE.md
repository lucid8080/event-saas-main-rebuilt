# Stripe Setup Guide

## 🚨 **Current Issue**
Your Stripe integration isn't working because environment variables are missing. Here's how to fix it:

## 📋 **Step 1: Create Environment File**

Create a `.env.local` file in your project root with the following variables:

```env
# Authentication
AUTH_SECRET=your-auth-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_OAUTH_TOKEN=your-github-token

# Database
DATABASE_URL=your-database-url

# Email
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=your-email@domain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

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

# Ideogram AI
NEXT_PUBLIC_IDEOGRAM_API_KEY=your-ideogram-api-key
```

## 🔑 **Step 2: Get Stripe API Keys**

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Navigate to Developers → API Keys**
3. **Copy your Secret Key** (starts with `sk_test_` for test mode)
4. **Set it as `STRIPE_API_KEY`**

## 💰 **Step 3: Create Price IDs**

1. **Go to Stripe Dashboard → Products**
2. **Create products for each plan:**
   - Starter ($30/month, $288/year)
   - Pro ($60/month, $576/year) 
   - Business ($120/month, $1152/year)
3. **Copy the Price IDs** (start with `price_`)
4. **Set them in your environment variables**

## 🌐 **Step 4: Set Up Webhook**

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint:** `http://localhost:3000/api/webhooks/stripe`
3. **Select events:** `checkout.session.completed`, `invoice.payment_succeeded`
4. **Copy the webhook secret** (starts with `whsec_`)
5. **Set it as `STRIPE_WEBHOOK_SECRET`**

## 🧪 **Step 5: Test the Setup**

1. **Restart your development server**
2. **Go to `/dashboard/debug`**
3. **Click "Check Environment Variables"**
4. **Verify all variables are set**

## 🛒 **Step 6: Complete Checkout**

1. **Go to `/pricing`**
2. **Select a plan**
3. **Complete the Stripe checkout**
4. **Credits should be assigned automatically**

## 🔧 **Quick Fix for Now**

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