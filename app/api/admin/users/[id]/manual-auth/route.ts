import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canHero, canAdmin, isRoleHigherOrEqual } from "@/lib/role-based-access";
import { auth } from "@/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    
    console.log("🔍 Manual Auth API Debug: Starting PATCH request");
    console.log("🔍 Manual Auth API Debug: userId:", userId);
    
    // Get session manually
    const session = await auth();
    console.log("🔍 Manual Auth API Debug: session exists:", !!session);
    console.log("🔍 Manual Auth API Debug: session user:", session?.user);
    
    if (!session || !session.user) {
      console.log("🔍 Manual Auth API Debug: No session found");
      return NextResponse.json({
        error: "Authentication required",
        message: "Please log in to access this resource",
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    const currentUser = session.user;
    console.log("🔍 Manual Auth API Debug: currentUser:", currentUser);
    
    // Check if user has required permissions
    if (!currentUser.role || (currentUser.role !== 'HERO' && currentUser.role !== 'ADMIN')) {
      console.log("🔍 Manual Auth API Debug: Insufficient permissions");
      return NextResponse.json({
        error: "Insufficient permissions",
        message: "Admin access required",
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { role, credits } = body;
    
    console.log("🔍 Manual Auth API Debug: Request body:", { role, credits });
    
    // Validate permissions
    const canManageRoles = canHero(currentUser.role, 'roles:assign');
    const canManageCredits = canAdmin(currentUser.role, 'credits:manage');
    
    if (!canManageRoles && !canManageCredits) {
      return NextResponse.json({
        error: "Insufficient permissions",
        message: "User does not have permission to manage users",
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    
    // Validate role assignment
    if (role) {
      if (!canManageRoles) {
        return NextResponse.json({
          error: "Insufficient permissions",
          message: "Insufficient permissions to manage roles",
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }
      
      if (!["HERO", "ADMIN", "USER"].includes(role)) {
        return NextResponse.json({
          error: "Invalid role",
          message: "Role must be HERO, ADMIN, or USER",
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }
    
    // Validate credits management
    if (credits !== undefined) {
      if (!canManageCredits) {
        return NextResponse.json({
          error: "Insufficient permissions",
          message: "Insufficient permissions to manage credits",
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }
      
      if (typeof credits !== "number" || credits < 0) {
        return NextResponse.json({
          error: "Invalid credits value",
          message: "Credits must be a non-negative number",
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }
    
    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });
    
    if (!targetUser) {
      return NextResponse.json({
        error: "User not found",
        message: "Target user not found",
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(credits !== undefined && { credits }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log("✅ Manual Auth API Success: User updated successfully:", updatedUser.email);
    return NextResponse.json(updatedUser);
    
  } catch (error) {
    console.error("❌ Manual Auth API Error:", error);
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 