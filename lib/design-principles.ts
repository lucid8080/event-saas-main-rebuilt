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

// Example function to demonstrate design principles
export function getDesignPrinciplesExample() {
  return {
    intro: [
      {
        type: 'header' as const,
        content: 'YOUR BUSINESS HEADLINE HERE',
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
        content: 'LOREM IPSUM DOLOR SIT AMET',
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
        content: '1',
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
        content: '01',
        style: {
          fontSize: 32,
          fontWeight: '800' as const,
          color: '#ffffff',
          fontFamily: 'Inter',
          textAlign: 'center' as const,
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
        content: 'LOREM IPSUM DOLOR SIT AMET',
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
        content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
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
        content: '1',
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
        content: 'SAVE THIS POST!',
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
        content: 'READ MORE',
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
        content: '5',
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
} 