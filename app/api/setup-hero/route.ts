import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const targetEmail = email || 'lucid8080@gmail.com';

    console.log(`🦸‍♂️ Setting up HERO for: ${targetEmail}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: `User with email "${targetEmail}" not found`,
        suggestion: "Please register on the site first"
      }, { status: 404 });
    }

    if (user.role === 'HERO') {
      return NextResponse.json({
        success: true,
        message: "User already has HERO privileges",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }

    // Update user to HERO role
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: { 
        role: 'HERO',
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "HERO privileges granted successfully!",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      },
      nextSteps: [
        "Sign out of your account",
        "Clear browser cache/cookies", 
        "Sign in again",
        "Look for 'Admin Panel' in the sidebar"
      ]
    });

  } catch (error) {
    console.error('Error setting up HERO:', error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Also allow GET request for checking status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'lucid8080@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: `User with email "${email}" not found`,
        suggestion: "Please register on the site first"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
      isHero: user.role === 'HERO',
      isAdmin: user.role === 'ADMIN' || user.role === 'HERO'
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 