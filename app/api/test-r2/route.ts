import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { testR2Connection } from '@/lib/r2';
import { env } from '@/env.mjs';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'HERO') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Test R2 connection
    const isConnected = await testR2Connection();

    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      hasAccessKeyId: !!env.R2_ACCESS_KEY_ID,
      hasSecretAccessKey: !!env.R2_SECRET_ACCESS_KEY,
      hasBucketName: !!env.R2_BUCKET_NAME,
      hasEndpoint: !!env.R2_ENDPOINT,
      bucketName: env.R2_BUCKET_NAME,
      endpoint: env.R2_ENDPOINT,
    };

    return NextResponse.json({
      success: true,
      r2Connection: isConnected,
      environment: envCheck,
      message: isConnected 
        ? 'R2 connection successful' 
        : 'R2 connection failed',
    });

  } catch (error) {
    console.error('Error testing R2 connection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test R2 connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 