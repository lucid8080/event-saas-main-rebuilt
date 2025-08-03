import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const debugInfo = {
      environment: {
        stripeApiKey: {
          exists: !!process.env.STRIPE_API_KEY,
          length: process.env.STRIPE_API_KEY?.length || 0,
          prefix: process.env.STRIPE_API_KEY?.substring(0, 7) || 'N/A',
          isTestKey: process.env.STRIPE_API_KEY?.startsWith('sk_test_') || false
        },
        stripeWebhookSecret: {
          exists: !!process.env.STRIPE_WEBHOOK_SECRET,
          length: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
          prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 5) || 'N/A'
        },
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
      },
      pricingConfiguration: [],
      stripeConnectivity: null,
      recommendations: []
    };

    // Check pricing configuration
    for (const plan of pricingData) {
      const planDebug = {
        plan: plan.title,
        monthly: {
          priceId: plan.stripeIds.monthly,
          isValid: plan.stripeIds.monthly?.startsWith('price_') || false,
          isProductId: plan.stripeIds.monthly?.startsWith('prod_') || false,
          error: null
        },
        yearly: {
          priceId: plan.stripeIds.yearly,
          isValid: plan.stripeIds.yearly?.startsWith('price_') || false,
          isProductId: plan.stripeIds.yearly?.startsWith('prod_') || false,
          error: null
        }
      };

      // Check for common mistakes
      if (plan.stripeIds.monthly?.startsWith('prod_')) {
        planDebug.monthly.error = 'This is a Product ID, not a Price ID!';
      } else if (!plan.stripeIds.monthly) {
        planDebug.monthly.error = 'Price ID not configured';
      }

      if (plan.stripeIds.yearly?.startsWith('prod_')) {
        planDebug.yearly.error = 'This is a Product ID, not a Price ID!';
      } else if (!plan.stripeIds.yearly) {
        planDebug.yearly.error = 'Price ID not configured';
      }

      debugInfo.pricingConfiguration.push(planDebug);
    }

    // Test Stripe connectivity
    try {
      if (process.env.STRIPE_API_KEY) {
        const testCustomer = await stripe.customers.list({ limit: 1 });
        debugInfo.stripeConnectivity = {
          success: true,
          error: null,
          testResult: 'Stripe API connection successful'
        };
      } else {
        debugInfo.stripeConnectivity = {
          success: false,
          error: 'No Stripe API key configured',
          testResult: null
        };
      }
    } catch (error) {
      debugInfo.stripeConnectivity = {
        success: false,
        error: error.message,
        testResult: null
      };
    }

    // Generate recommendations
    if (!process.env.STRIPE_API_KEY) {
      debugInfo.recommendations.push({
        type: 'critical',
        message: 'Stripe API key is missing',
        action: 'Add STRIPE_API_KEY to your .env.local file'
      });
    } else if (!process.env.STRIPE_API_KEY.startsWith('sk_test_')) {
      debugInfo.recommendations.push({
        type: 'warning',
        message: 'Stripe API key does not appear to be a test key',
        action: 'Make sure you are using a test key (sk_test_...) for development'
      });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      debugInfo.recommendations.push({
        type: 'critical',
        message: 'Stripe webhook secret is missing',
        action: 'Add STRIPE_WEBHOOK_SECRET to your .env.local file'
      });
    }

    // Check for Product ID vs Price ID issues
    const productIdErrors = debugInfo.pricingConfiguration.filter(plan => 
      plan.monthly.isProductId || plan.yearly.isProductId
    );

    if (productIdErrors.length > 0) {
      debugInfo.recommendations.push({
        type: 'critical',
        message: `${productIdErrors.length} plans are using Product IDs instead of Price IDs`,
        action: 'Replace Product IDs (prod_...) with Price IDs (price_...) in your environment variables'
      });
    }

    // Check for missing price IDs
    const missingPriceIds = debugInfo.pricingConfiguration.filter(plan => 
      !plan.monthly.priceId || !plan.yearly.priceId
    );

    if (missingPriceIds.length > 0) {
      debugInfo.recommendations.push({
        type: 'critical',
        message: `${missingPriceIds.length} plans have missing price IDs`,
        action: 'Configure all price IDs in your environment variables'
      });
    }

    if (!debugInfo.stripeConnectivity.success) {
      debugInfo.recommendations.push({
        type: 'critical',
        message: `Stripe connectivity failed: ${debugInfo.stripeConnectivity.error}`,
        action: 'Check your Stripe API key and network connectivity'
      });
    }

    return Response.json(debugInfo);

  } catch (error) {
    console.error("Stripe debug error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
} 