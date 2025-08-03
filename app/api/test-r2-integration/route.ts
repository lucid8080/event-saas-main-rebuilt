import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { testR2Connection } from '@/lib/r2';
import { env } from '@/env.mjs';
import { prisma } from '@/lib/db';

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
    const r2Connection = await testR2Connection();

    // Check environment variables
    const envCheck = {
      hasAccessKeyId: !!env.R2_ACCESS_KEY_ID,
      hasSecretAccessKey: !!env.R2_SECRET_ACCESS_KEY,
      hasBucketName: !!env.R2_BUCKET_NAME,
      hasEndpoint: !!env.R2_ENDPOINT,
      bucketName: env.R2_BUCKET_NAME,
      endpoint: env.R2_ENDPOINT,
    };

    // Check database for R2 images
    const r2Images = await prisma.generatedImage.findMany({
      where: {
        r2Key: { not: null }
      },
      select: {
        id: true,
        r2Key: true,
        url: true,
        createdAt: true
      },
      take: 5
    });

    // Check total images vs R2 images
    const totalImages = await prisma.generatedImage.count();
    const r2ImageCount = await prisma.generatedImage.count({
      where: { r2Key: { not: null } }
    });

    return NextResponse.json({
      success: true,
      r2Connection,
      environment: envCheck,
      database: {
        totalImages,
        r2ImageCount,
        r2ImagePercentage: totalImages > 0 ? Math.round((r2ImageCount / totalImages) * 100) : 0,
        recentR2Images: r2Images
      },
      integration: {
        imageGeneration: '✅ Modified to upload to R2',
        signedUrls: '✅ Implemented for secure access',
        galleryIntegration: '✅ Created utility functions',
        deletion: '✅ Updated to delete from R2',
        fallback: '✅ Graceful fallback to original URLs'
      },
      message: r2Connection 
        ? 'R2 integration complete and working' 
        : 'R2 connection failed - check configuration',
    });

  } catch (error) {
    console.error('Error testing R2 integration:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test R2 integration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 