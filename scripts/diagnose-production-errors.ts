#!/usr/bin/env tsx

/**
 * Production Error Diagnostic Script
 * 
 * This script diagnoses the specific 502 and 500 errors reported:
 * 1. 502 Bad Gateway for /astronaut-logo.png
 * 2. 500 Internal Server Error for /api/admin/users/[id]
 */

const PRODUCTION_URL = 'https://event-saas-main-rebuilt.onrender.com';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class ProductionDiagnostics {
  private results: DiagnosticResult[] = [];

  private addResult(test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details) {
      console.log(`   📄 Details:`, JSON.stringify(details, null, 2));
    }
  }

  async checkStaticAssetServing() {
    console.log('\n🔍 1. STATIC ASSET SERVING DIAGNOSTICS');
    console.log('=====================================');

    // Test the specific failing asset
    try {
      console.log('Testing /astronaut-logo.png...');
      const response = await fetch(`${PRODUCTION_URL}/astronaut-logo.png`);
      
      if (response.status === 502) {
        this.addResult(
          'Static Asset - astronaut-logo.png', 
          'fail', 
          'Returns 502 Bad Gateway - Static file serving is broken',
          {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          }
        );
      } else if (response.ok) {
        this.addResult(
          'Static Asset - astronaut-logo.png', 
          'pass', 
          'Static asset loads successfully'
        );
      } else {
        this.addResult(
          'Static Asset - astronaut-logo.png', 
          'warning', 
          `Unexpected status: ${response.status}`,
          { status: response.status, statusText: response.statusText }
        );
      }
    } catch (error) {
      this.addResult(
        'Static Asset - astronaut-logo.png', 
        'fail', 
        'Network error accessing static asset',
        { error: error.message }
      );
    }

    // Test other static assets
    const staticAssets = [
      '/favicon.ico',
      '/site.webmanifest',
      '/_next/static/media/', // Test Next.js static assets
    ];

    for (const asset of staticAssets) {
      try {
        const response = await fetch(`${PRODUCTION_URL}${asset}`);
        if (response.status === 502) {
          this.addResult(
            `Static Asset - ${asset}`, 
            'fail', 
            'Returns 502 - Static serving broken'
          );
        } else if (response.ok) {
          this.addResult(
            `Static Asset - ${asset}`, 
            'pass', 
            'Loads successfully'
          );
        }
      } catch (error) {
        this.addResult(
          `Static Asset - ${asset}`, 
          'fail', 
          'Network error',
          { error: error.message }
        );
      }
    }
  }

  async checkAPIRouteErrors() {
    console.log('\n🔍 2. API ROUTE ERROR DIAGNOSTICS');
    console.log('=================================');

    // Test the specific failing API route
    try {
      console.log('Testing /api/admin/users/[id] endpoint...');
      
      // First, test with a non-existent user ID to see the error structure
      const testResponse = await fetch(`${PRODUCTION_URL}/api/admin/users/test-user-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Note: This will likely fail due to auth, but we want to see the error structure
        },
        body: JSON.stringify({ credits: 10 })
      });

      if (testResponse.status === 500) {
        const errorText = await testResponse.text();
        this.addResult(
          'API Route - /api/admin/users/[id]', 
          'fail', 
          'Returns 500 Internal Server Error',
          {
            status: testResponse.status,
            errorResponse: errorText.substring(0, 500),
            headers: Object.fromEntries(testResponse.headers.entries())
          }
        );
      } else {
        this.addResult(
          'API Route - /api/admin/users/[id]', 
          'warning', 
          `Unexpected status: ${testResponse.status} (expected 500 or auth error)`
        );
      }
    } catch (error) {
      this.addResult(
        'API Route - /api/admin/users/[id]', 
        'fail', 
        'Network error accessing API route',
        { error: error.message }
      );
    }

    // Test other API routes for comparison
    const apiRoutes = [
      '/api/debug-env',
      '/api/health',
      '/api/auth/session'
    ];

    for (const route of apiRoutes) {
      try {
        const response = await fetch(`${PRODUCTION_URL}${route}`);
        if (response.status === 500) {
          this.addResult(
            `API Route - ${route}`, 
            'fail', 
            'Returns 500 error'
          );
        } else if (response.ok) {
          this.addResult(
            `API Route - ${route}`, 
            'pass', 
            'Responds successfully'
          );
        } else {
          this.addResult(
            `API Route - ${route}`, 
            'warning', 
            `Status: ${response.status}`
          );
        }
      } catch (error) {
        this.addResult(
          `API Route - ${route}`, 
          'fail', 
          'Network error',
          { error: error.message }
        );
      }
    }
  }

  async checkServerHealth() {
    console.log('\n🔍 3. SERVER HEALTH DIAGNOSTICS');
    console.log('===============================');

    try {
      // Check basic server response
      const response = await fetch(PRODUCTION_URL);
      
      if (response.ok) {
        this.addResult(
          'Server Health - Root URL', 
          'pass', 
          'Server responds to root URL'
        );
      } else {
        this.addResult(
          'Server Health - Root URL', 
          'fail', 
          `Server returns ${response.status}`,
          { status: response.status, statusText: response.statusText }
        );
      }

      // Check server headers for clues
      const headers = Object.fromEntries(response.headers.entries());
      this.addResult(
        'Server Headers', 
        'pass', 
        'Server header analysis',
        headers
      );

    } catch (error) {
      this.addResult(
        'Server Health - Root URL', 
        'fail', 
        'Cannot connect to server',
        { error: error.message }
      );
    }
  }

  async checkDeploymentStatus() {
    console.log('\n🔍 4. DEPLOYMENT STATUS CHECK');
    console.log('=============================');

    // Check if environment debug endpoint works
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/debug-env`);
      if (response.ok) {
        const data = await response.text();
        this.addResult(
          'Deployment Status - Environment Check', 
          'pass', 
          'Environment variables accessible',
          { response: data.substring(0, 200) }
        );
      } else {
        this.addResult(
          'Deployment Status - Environment Check', 
          'fail', 
          'Cannot access environment debug endpoint'
        );
      }
    } catch (error) {
      this.addResult(
        'Deployment Status - Environment Check', 
        'fail', 
        'Error accessing environment debug',
        { error: error.message }
      );
    }
  }

  generateReport() {
    console.log('\n📊 DIAGNOSTIC SUMMARY REPORT');
    console.log('============================');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    
    const failedTests = this.results.filter(r => r.status === 'fail');
    if (failedTests.length > 0) {
      console.log('\nCRITICAL ISSUES TO FIX:');
      failedTests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.test}: ${test.message}`);
      });
      
      // Specific recommendations based on failures
      const staticAssetFails = failedTests.filter(t => t.test.includes('Static Asset'));
      const apiRouteFails = failedTests.filter(t => t.test.includes('API Route'));
      
      if (staticAssetFails.length > 0) {
        console.log('\n🚨 STATIC ASSET SERVING BROKEN:');
        console.log('   - Your production server cannot serve files from /public directory');
        console.log('   - This suggests a fundamental deployment or server configuration issue');
        console.log('   - Check Render deployment logs for static file build errors');
        console.log('   - Verify Next.js build completed successfully');
      }
      
      if (apiRouteFails.length > 0) {
        console.log('\n🚨 API ROUTES CRASHING:');
        console.log('   - Your API routes are throwing unhandled exceptions');
        console.log('   - Check Render application logs for error details');
        console.log('   - Verify database connection and environment variables');
        console.log('   - Consider adding more comprehensive error handling');
      }
    } else {
      console.log('✅ All critical systems appear to be functioning');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check Render dashboard for deployment and runtime logs');
    console.log('2. Verify the latest code was deployed successfully');
    console.log('3. Check if the deployment build process completed without errors');
    console.log('4. Consider redeploying if issues persist');
  }
}

async function main() {
  console.log('🚀 PRODUCTION ERROR DIAGNOSTICS');
  console.log('===============================');
  console.log(`🎯 Target: ${PRODUCTION_URL}`);
  console.log('📅 Time:', new Date().toISOString());
  
  const diagnostics = new ProductionDiagnostics();
  
  await diagnostics.checkStaticAssetServing();
  await diagnostics.checkAPIRouteErrors();
  await diagnostics.checkServerHealth();
  await diagnostics.checkDeploymentStatus();
  
  diagnostics.generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}