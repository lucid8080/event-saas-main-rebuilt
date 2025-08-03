
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <>
      <DashboardHeader
        heading="Debug Dashboard"
        text="Check your subscription status and test webhook functionality."
      />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Status Check</CardTitle>
            <CardDescription>
              Check your current subscription status and credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User ID:</span>
                <code className="px-2 py-1 bg-muted text-xs rounded">{session.user.id}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{session.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{session.user.name || 'Not set'}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Credits:</span>
                <Badge variant="outline" className="ml-2">
                  {userCredits !== null ? userCredits : 'Loading...'}
                </Badge>
              </div>
              
              <Button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetch('/api/debug/user-status');
                    const data = await response.json();
                    console.log('User status:', data);
                    setUserStatus(data);
                    setUserCredits(data.user?.credits || 0);
                  } catch (err) {
                    console.error('Error:', err);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Checking...' : 'Check Status'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Test</CardTitle>
            <CardDescription>
              Test webhook functionality and credit assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/test-webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ testType: 'ping' })
                      });
                      const data = await response.json();
                      console.log('Webhook ping result:', data);
                      alert(data.success ? 'Webhook endpoint is accessible!' : 'Error: ' + data.error);
                    } catch (err) {
                      console.error('Error:', err);
                      alert('Error testing webhook');
                    }
                  }}
                  variant="outline"
                >
                  Test Webhook Endpoint
                </Button>
                
                <Button 
                  onClick={async () => {
                    const priceId = prompt('Enter a price ID to test credit assignment:');
                    if (priceId) {
                      try {
                        const response = await fetch('/api/debug/test-webhook', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            testType: 'checkout.session.completed',
                            userId: session.user.id,
                            priceId: priceId
                          })
                        });
                        const data = await response.json();
                        console.log('Credit assignment result:', data);
                        if (data.success) {
                          alert(`Credits assigned successfully! User now has ${data.user.credits} credits.`);
                          // Refresh the page to show updated credits
                          window.location.reload();
                        } else {
                          alert('Error: ' + data.error);
                        }
                      } catch (err) {
                        console.error('Error:', err);
                        alert('Error testing credit assignment');
                      }
                    }
                  }}
                  variant="outline"
                >
                  Test Credit Assignment
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• &ldquo;Test Webhook Endpoint&rdquo; checks if the webhook endpoint is accessible</p>
                <p>• &ldquo;Test Credit Assignment&rdquo; simulates a checkout completion and assigns credits</p>
                <p>• Check the browser console for detailed results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Configuration Check</CardTitle>
            <CardDescription>
              Comprehensive check of Stripe setup and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/debug/stripe-status');
                    const data = await response.json();
                    console.log('Stripe status:', data);
                    
                    // Show recommendations in alert
                    if (data.recommendations && data.recommendations.length > 0) {
                      const criticalIssues = data.recommendations.filter(r => r.type === 'critical');
                      const warnings = data.recommendations.filter(r => r.type === 'warning');
                      const info = data.recommendations.filter(r => r.type === 'info');
                      
                      let message = 'Stripe Status Check Complete\n\n';
                      
                      if (criticalIssues.length > 0) {
                        message += '🚨 CRITICAL ISSUES:\n';
                        criticalIssues.forEach(issue => {
                          message += `• ${issue.message}\n`;
                        });
                        message += '\n';
                      }
                      
                      if (warnings.length > 0) {
                        message += '⚠️ WARNINGS:\n';
                        warnings.forEach(warning => {
                          message += `• ${warning.message}\n`;
                        });
                        message += '\n';
                      }
                      
                      if (info.length > 0) {
                        message += 'ℹ️ INFO:\n';
                        info.forEach(item => {
                          message += `• ${item.message}\n`;
                        });
                        message += '\n';
                      }
                      
                      if (criticalIssues.length === 0 && warnings.length === 0) {
                        message += '✅ All systems operational!';
                      }
                      
                      alert(message);
                    } else {
                      alert('✅ Stripe configuration looks good!');
                    }
                  } catch (err) {
                    console.error('Error:', err);
                    alert('Error checking Stripe status');
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Check Stripe Status
              </Button>
              
              <div className="text-xs text-muted-foreground">
                <p>• Checks environment variables, API connectivity, and plan configuration</p>
                <p>• Validates price IDs and user subscription status</p>
                <p>• Provides specific recommendations for fixing issues</p>
                <p>• Check the browser console for detailed results</p>
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/debug/verify-pricing');
                    const data = await response.json();
                    console.log('Pricing verification:', data);
                    
                    if (data.verificationResults) {
                      let message = 'Pricing Verification Results:\n\n';
                      
                      data.verificationResults.forEach(result => {
                        message += `${result.plan} Plan:\n`;
                        message += `  Expected: $${result.expected.monthly}/month, $${result.expected.yearly}/year\n`;
                        
                        if (result.stripe.monthly) {
                          message += `  Stripe Monthly: $${result.stripe.monthly.amount}\n`;
                        }
                        if (result.stripe.yearly) {
                          message += `  Stripe Yearly: $${result.stripe.yearly.amount}\n`;
                        }
                        
                        if (result.stripe.errors.length > 0) {
                          message += `  Issues: ${result.stripe.errors.join(', ')}\n`;
                        } else {
                          message += `  ✅ All good!\n`;
                        }
                        message += '\n';
                      });
                      
                      alert(message);
                    } else {
                      alert('Error: ' + data.error);
                    }
                  } catch (err) {
                    console.error('Error:', err);
                    alert('Error verifying pricing');
                  }
                }}
                variant="outline"
                className="w-full"
                              >
                  Verify Pricing Configuration
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/test-pricing-logic');
                      const data = await response.json();
                      console.log('Pricing logic test:', data);
                      
                      if (data.testResults) {
                        let message = 'Pricing Logic Test Results:\n\n';
                        
                        data.testResults.forEach(result => {
                          message += `${result.plan} Plan:\n`;
                                  message += `  Monthly: $${result.monthly.amount} (${result.monthly.credits.monthly} credits)\n`;
        message += `  Yearly: $${result.yearly.amount} (${result.yearly.credits.yearly} credits)\n`;
                          message += `  Monthly Price ID: ${result.monthly.priceId || 'Not set'}\n`;
                          message += `  Yearly Price ID: ${result.yearly.priceId || 'Not set'}\n\n`;
                        });
                        
                        message += `Summary:\n`;
                        message += `- Total Plans: ${data.summary.totalPlans}\n`;
                        message += `- Default: ${data.summary.monthlyDefault ? 'Monthly' : 'Yearly'}\n`;
                        message += `- Yearly Discount: ${data.summary.yearlyDiscount}\n`;
                        
                        alert(message);
                      } else {
                        alert('Error: ' + data.error);
                      }
                    } catch (err) {
                      console.error('Error:', err);
                      alert('Error testing pricing logic');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Test Pricing Logic
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/validate-price-ids');
                      const data = await response.json();
                      console.log('Price ID validation:', data);
                      
                      if (data.validationResults) {
                        let message = 'Price ID Validation Results:\n\n';
                        
                        data.validationResults.forEach(result => {
                          message += `${result.plan} Plan:\n`;
                          message += `  Monthly: ${result.monthly.priceId || 'Not set'}`;
                          if (result.monthly.error) {
                            message += ` ❌ ${result.monthly.error}`;
                          } else if (result.monthly.isValid) {
                            message += ` ✅ Valid`;
                          }
                          message += '\n';
                          
                          message += `  Yearly: ${result.yearly.priceId || 'Not set'}`;
                          if (result.yearly.error) {
                            message += ` ❌ ${result.yearly.error}`;
                          } else if (result.yearly.isValid) {
                            message += ` ✅ Valid`;
                          }
                          message += '\n\n';
                        });
                        
                        if (data.recommendations && data.recommendations.length > 0) {
                          const critical = data.recommendations.filter(r => r.type === 'critical');
                          if (critical.length > 0) {
                            message += '🚨 CRITICAL ISSUES:\n';
                            critical.forEach(rec => {
                              message += `• ${rec.message}\n`;
                            });
                          }
                        }
                        
                        alert(message);
                      } else {
                        alert('Error: ' + data.error);
                      }
                    } catch (err) {
                      console.error('Error:', err);
                      alert('Error validating price IDs');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Validate Price IDs
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/stripe-debug');
                      const data = await response.json();
                      console.log('Comprehensive Stripe debug:', data);
                      
                      if (data.recommendations) {
                        let message = 'Comprehensive Stripe Debug Results:\n\n';
                        
                        // Environment info
                        message += 'Environment:\n';
                        message += `  API Key: ${data.environment.stripeApiKey.exists ? 'Set' : 'Missing'}`;
                        if (data.environment.stripeApiKey.exists) {
                          message += ` (${data.environment.stripeApiKey.prefix}...)`;
                          if (!data.environment.stripeApiKey.isTestKey) {
                            message += ' ⚠️ Not a test key';
                          }
                        }
                        message += '\n';
                        
                        message += `  Webhook Secret: ${data.environment.stripeWebhookSecret.exists ? 'Set' : 'Missing'}`;
                        if (data.environment.stripeWebhookSecret.exists) {
                          message += ` (${data.environment.stripeWebhookSecret.prefix}...)`;
                        }
                        message += '\n';
                        
                        message += `  App URL: ${data.environment.appUrl}\n\n`;
                        
                        // Stripe connectivity
                        message += 'Stripe Connectivity:\n';
                        if (data.stripeConnectivity.success) {
                          message += '  ✅ Connected successfully\n';
                        } else {
                          message += `  ❌ Failed: ${data.stripeConnectivity.error}\n`;
                        }
                        message += '\n';
                        
                        // Pricing configuration
                        message += 'Pricing Configuration:\n';
                        data.pricingConfiguration.forEach(plan => {
                          message += `  ${plan.plan}:\n`;
                          message += `    Monthly: ${plan.monthly.priceId || 'Not set'}`;
                          if (plan.monthly.isProductId) {
                            message += ' ❌ Product ID (should be Price ID)';
                          } else if (plan.monthly.isValid) {
                            message += ' ✅ Valid';
                          }
                          message += '\n';
                          
                          message += `    Yearly: ${plan.yearly.priceId || 'Not set'}`;
                          if (plan.yearly.isProductId) {
                            message += ' ❌ Product ID (should be Price ID)';
                          } else if (plan.yearly.isValid) {
                            message += ' ✅ Valid';
                          }
                          message += '\n';
                        });
                        
                        // Recommendations
                        if (data.recommendations.length > 0) {
                          message += '\n🚨 RECOMMENDATIONS:\n';
                          data.recommendations.forEach(rec => {
                            message += `  ${rec.type === 'critical' ? '🚨' : '⚠️'} ${rec.message}\n`;
                            message += `     Action: ${rec.action}\n\n`;
                          });
                        }
                        
                        alert(message);
                      } else {
                        alert('Error: ' + data.error);
                      }
                    } catch (err) {
                      console.error('Error:', err);
                      alert('Error running comprehensive debug');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Comprehensive Stripe Debug
                </Button>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
            <CardDescription>
              Verify that all required environment variables are set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stripe API Key:</span>
                <Badge variant="secondary">Check via API</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook Secret:</span>
                <Badge variant="secondary">Check via API</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">App URL:</span>
                <Badge variant="secondary">Check via API</Badge>
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/debug/user-status');
                    const data = await response.json();
                    console.log('Environment check:', data.envCheck);
                    alert(`Environment Check:\nStripe API Key: ${data.envCheck.stripeApiKey ? 'Set' : 'Missing'}\nWebhook Secret: ${data.envCheck.stripeWebhookSecret ? 'Set' : 'Missing'}\nApp URL: ${data.envCheck.appUrl}`);
                  } catch (err) {
                    console.error('Error:', err);
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Check Environment Variables
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 