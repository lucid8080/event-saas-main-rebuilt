import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Check if API key is configured
    const apiKey = process.env.NEXT_PUBLIC_IDEOGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Ideogram API key is not configured" 
      }, { status: 500 });
    }

    console.log("Testing Ideogram 3.0 API integration...");

    // Create FormData for Ideogram 3.0 API
    const formData = new FormData();

    // Add a simple test prompt
    formData.append("prompt", "A photo of a cat sleeping on a couch.");

    // Add aspect ratio (1x1 for square)
    formData.append("aspect_ratio", "1x1");

    // Add rendering speed (TURBO for faster generation)
    formData.append("rendering_speed", "TURBO");

    console.log("Sending test request to Ideogram 3.0 API...");

    // Make the API call to generate the image using Ideogram 3.0
    const response = await fetch("https://api.ideogram.ai/v1/ideogram-v3/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey
      },
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ideogram 3.0 API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({ 
        error: `HTTP error! status: ${response.status} - ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log("Ideogram 3.0 API Response:", data);

    // Check for successful image generation
    let imageUrl: string | null = null;
    
    if (data.data && data.data[0]?.url) {
      imageUrl = data.data[0].url;
    } else if (data.url) {
      imageUrl = data.url;
    } else if (data.images && data.images[0]?.url) {
      imageUrl = data.images[0].url;
    }

    if (imageUrl) {
      return NextResponse.json({ 
        success: true, 
        imageUrl,
        responseData: data 
      });
    } else {
      console.error("No image URL found in response:", data);
      return NextResponse.json({ 
        error: "Failed to generate image - no URL in response",
        responseData: data
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error testing Ideogram 3.0 API:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to test API" 
    }, { status: 500 });
  }
} 