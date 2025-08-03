import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the image URL from query parameters
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('Image URL is required', { status: 400 });
    }

    // For now, just redirect to the original image to avoid hanging issues
    // We'll implement proper watermarking later
    console.log('Redirecting to original image:', imageUrl);
    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error('Error in watermark proxy:', error);
    return new Response('Failed to process image', { status: 500 });
  }
} 