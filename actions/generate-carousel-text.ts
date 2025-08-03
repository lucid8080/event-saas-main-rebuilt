"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Design principle-based text templates
interface DesignTemplate {
  type: 'header' | 'body' | 'caption' | 'cta' | 'slider-number';
  content: string;
  style: {
    fontSize: number;
    fontWeight: 'normal' | 'bold' | '600' | '700' | '800' | '900';
    color: string;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textShadow?: {
      x: number;
      y: number;
      blur: number;
      color: string;
    };
    backgroundColor?: string;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    borderRadius: number;
  };
  position: {
    x: number; // Percentage from left (0-100)
    y: number; // Percentage from top (0-100)
  };
}

export async function generateCarouselText(
  carouselTitle: string,
  slideIndex: number,
  totalSlides: number,
  slideType: 'intro' | 'content' | 'conclusion' = 'content'
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Design principle-based text generation
    const generateDesignText = (): DesignTemplate[] => {
      const templates = {
        intro: [
          {
            type: 'header' as const,
            content: carouselTitle.toUpperCase(),
            style: {
              fontSize: 48,
              fontWeight: '900' as const,
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1.1,
              letterSpacing: -1,
              textShadow: {
                x: 2,
                y: 2,
                blur: 4,
                color: 'rgba(0,0,0,0.3)'
              },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              borderRadius: 0
            },
            position: { x: 50, y: 35 }
          },
          {
            type: 'body' as const,
            content: `DISCOVER THE ESSENTIALS OF ${carouselTitle.toUpperCase()}`,
            style: {
              fontSize: 18,
              fontWeight: '600' as const,
              color: '#f3f4f6',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1.4,
              letterSpacing: 0.5,
              padding: { top: 15, right: 15, bottom: 15, left: 15 },
              borderRadius: 0
            },
            position: { x: 50, y: 55 }
          },
          {
            type: 'slider-number' as const,
            content: `${slideIndex + 1}`,
            style: {
              fontSize: 24,
              fontWeight: '900' as const,
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1,
              letterSpacing: 0,
              backgroundColor: '#000000',
              padding: { top: 12, right: 12, bottom: 12, left: 12 },
              borderRadius: 50
            },
            position: { x: 85, y: 15 }
          }
        ],
        content: [
          {
            type: 'header' as const,
            content: `STEP ${slideIndex + 1}`,
            style: {
              fontSize: 32,
              fontWeight: '800' as const,
              color: '#1f2937',
              fontFamily: 'Inter',
              textAlign: 'left' as const,
              lineHeight: 1.2,
              letterSpacing: -0.5,
              backgroundColor: '#000000',
              padding: { top: 8, right: 12, bottom: 8, left: 12 },
              borderRadius: 4
            },
            position: { x: 15, y: 15 }
          },
          {
            type: 'body' as const,
            content: getContentText(carouselTitle, slideIndex),
            style: {
              fontSize: 24,
              fontWeight: '700' as const,
              color: '#1f2937',
              fontFamily: 'Inter',
              textAlign: 'left' as const,
              lineHeight: 1.3,
              letterSpacing: -0.2,
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              borderRadius: 0
            },
            position: { x: 15, y: 35 }
          },
          {
            type: 'caption' as const,
            content: getCaptionText(carouselTitle, slideIndex),
            style: {
              fontSize: 16,
              fontWeight: 'normal' as const,
              color: '#6b7280',
              fontFamily: 'Inter',
              textAlign: 'left' as const,
              lineHeight: 1.5,
              letterSpacing: 0,
              padding: { top: 15, right: 15, bottom: 15, left: 15 },
              borderRadius: 0
            },
            position: { x: 15, y: 65 }
          },
          {
            type: 'slider-number' as const,
            content: `${slideIndex + 1}`,
            style: {
              fontSize: 20,
              fontWeight: '900' as const,
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1,
              letterSpacing: 0,
              backgroundColor: '#000000',
              padding: { top: 8, right: 8, bottom: 8, left: 8 },
              borderRadius: 50
            },
            position: { x: 85, y: 15 }
          }
        ],
        conclusion: [
          {
            type: 'header' as const,
            content: 'READY TO TAKE ACTION?',
            style: {
              fontSize: 36,
              fontWeight: '900' as const,
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1.1,
              letterSpacing: -0.5,
              textShadow: {
                x: 2,
                y: 2,
                blur: 4,
                color: 'rgba(0,0,0,0.3)'
              },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              borderRadius: 0
            },
            position: { x: 50, y: 30 }
          },
          {
            type: 'body' as const,
            content: `MASTER ${carouselTitle.toUpperCase()} TODAY`,
            style: {
              fontSize: 20,
              fontWeight: '600' as const,
              color: '#f3f4f6',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1.4,
              letterSpacing: 0.5,
              padding: { top: 15, right: 15, bottom: 15, left: 15 },
              borderRadius: 0
            },
            position: { x: 50, y: 50 }
          },
          {
            type: 'cta' as const,
            content: 'GET STARTED NOW',
            style: {
              fontSize: 18,
              fontWeight: '700' as const,
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1.3,
              letterSpacing: 0.5,
              backgroundColor: '#000000',
              padding: { top: 12, right: 20, bottom: 12, left: 20 },
              borderRadius: 8
            },
            position: { x: 50, y: 70 }
          },
          {
            type: 'slider-number' as const,
            content: `${slideIndex + 1}`,
            style: {
              fontSize: 24,
              fontWeight: '900' as const,
              color: '#ffffff',
              fontFamily: 'Inter',
              textAlign: 'center' as const,
              lineHeight: 1,
              letterSpacing: 0,
              backgroundColor: '#000000',
              padding: { top: 12, right: 12, bottom: 12, left: 12 },
              borderRadius: 50
            },
            position: { x: 85, y: 15 }
          }
        ]
      };

      return templates[slideType];
    };

    // Helper functions for generating content text
    const getContentText = (title: string, index: number): string => {
      const contentTemplates = [
        `ESSENTIAL STRATEGY FOR ${title.toUpperCase()}`,
        `PROVEN METHOD TO ${title.toUpperCase()}`,
        `KEY INSIGHT ABOUT ${title.toUpperCase()}`,
        `CRITICAL STEP IN ${title.toUpperCase()}`,
        `VITAL PRINCIPLE OF ${title.toUpperCase()}`,
        `CORE CONCEPT OF ${title.toUpperCase()}`,
        `FUNDAMENTAL APPROACH TO ${title.toUpperCase()}`,
        `BREAKTHROUGH IN ${title.toUpperCase()}`,
        `REVOLUTIONARY ${title.toUpperCase()} TECHNIQUE`,
        `EXPERT TIP FOR ${title.toUpperCase()}`
      ];
      return contentTemplates[index % contentTemplates.length];
    };

    const getCaptionText = (title: string, index: number): string => {
      const captionTemplates = [
        `Learn the most effective strategies that professionals use to master ${title}.`,
        `Discover proven techniques that will  your approach to ${title}.`,
        `Unlock the secrets that successful people use to excel in ${title}.`,
        `Master the fundamentals that will set you apart in ${title}.`,
        `Explore innovative methods that revolutionize ${title} practices.`,
        `Understand the core principles that drive success in ${title}.`,
        `Implement strategies that guarantee results in ${title}.`,
        `Develop skills that will accelerate your progress in ${title}.`,
        `Build a solid foundation for excellence in ${title}.`,
        `Create a roadmap for achieving mastery in ${title}.`
      ];
      return captionTemplates[index % captionTemplates.length];
    };

    // Generate design-based text elements
    const designElements = generateDesignText();

    return {
      success: true,
      text: designElements[0]?.content || `Slide ${slideIndex + 1}`,
      designElements: designElements,
      suggestions: [
        designElements[0]?.content || `Slide ${slideIndex + 1}`,
        `Alternative ${slideIndex + 1}: Different perspective on ${carouselTitle}`,
        `Pro tip ${slideIndex + 1}: Advanced insight about ${carouselTitle}`
      ]
    };

  } catch (error) {
    console.error('Error generating carousel text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred while generating text content"
    };
  }
}

 