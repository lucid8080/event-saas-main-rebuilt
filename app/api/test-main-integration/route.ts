import { NextResponse } from 'next/server';
import { generateImage } from '@/actions/generate-image';

export async function POST() {
  try {
    console.log("Testing main generate-image.ts with Ideogram 3.0...");

    // Test with a simple prompt and aspect ratio
    const result = await generateImage(
      "A beautiful sunset over mountains with vibrant colors",
      "16:9",
      "CORPORATE_EVENT",
      {
        age: "adult",
        theme: "professional",
        activities: "meeting",
        location: "outdoor",
        timeOfDay: "evening",
        season: "autumn",
        additionalDetails: "modern business setting"
      }
    );

    console.log("Main integration test result:", result);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        imageUrl: result.imageUrl,
        message: "Main generate-image.ts action working with Ideogram 3.0"
      });
    } else {
      return NextResponse.json({ 
        error: result.error,
        message: "Main generate-image.ts action failed"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error testing main integration:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to test main integration" 
    }, { status: 500 });
  }
} 