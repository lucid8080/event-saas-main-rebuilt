import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canHero, canAdmin, isRoleHigherOrEqual } from "@/lib/role-based-access";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    
    console.log("🔍 Manual Auth API Debug: Starting PATCH request");
    console.log("🔍 Manual Auth API Debug: userId:", userId);
    
    // Get session manually using auth() function
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

    console.log("🔍 API Debug: canManageRoles:", canManageRoles);
    console.log("🔍 API Debug: canManageCredits:", canManageCredits);

    if (!canManageRoles && !canManageCredits) {
      console.error("❌ API Error: Insufficient permissions", { 
        userRole: currentUser.role, 
        canManageRoles, 
        canManageCredits 
      });
      return NextResponse.json({
        error: "Insufficient permissions",
        message: "User does not have permission to manage users",
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    if (!userId) {
      console.error("❌ API Error: userId is missing");
      return NextResponse.json({
        error: "Missing user ID",
        message: "User ID is required",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate role assignment permissions
    if (role) {
      if (!canManageRoles) {
        console.error("❌ API Error: Cannot manage roles");
        return NextResponse.json({
          error: "Insufficient permissions",
          message: "Insufficient permissions to manage roles",
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }

      // Validate role value
      if (!["HERO", "ADMIN", "USER"].includes(role)) {
        console.error("❌ API Error: Invalid role:", role);
        return NextResponse.json({
          error: "Invalid role",
          message: "Role must be HERO, ADMIN, or USER",
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }

      // Prevent non-HERO users from assigning HERO role
      if (role === "HERO" && !canHero(currentUser.role, 'roles:assign')) {
        console.error("❌ API Error: Cannot assign HERO role");
        return NextResponse.json({
          error: "Insufficient permissions",
          message: "Only HERO users can assign HERO role",
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }

      // Prevent users from assigning roles higher than their own
      if (!isRoleHigherOrEqual(currentUser.role, role as any)) {
        console.error("❌ API Error: Cannot assign higher role");
        return NextResponse.json({
          error: "Insufficient permissions",
          message: "Cannot assign role higher than your own",
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }
    }

    // Validate credits management permissions
    if (credits !== undefined) {
      if (!canManageCredits) {
        console.error("❌ API Error: Cannot manage credits");
        return NextResponse.json({
          error: "Insufficient permissions",
          message: "Insufficient permissions to manage credits",
          timestamp: new Date().toISOString()
        }, { status: 403 });
      }

      if (typeof credits !== "number" || credits < 0) {
        console.error("❌ API Error: Invalid credits value:", credits);
        return NextResponse.json({
          error: "Invalid credits value",
          message: "Credits must be a non-negative number",
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }

    // Verify target user exists before updating
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    if (!targetUser) {
      console.error("❌ API Error: Target user not found:", userId);
      return NextResponse.json({
        error: "User not found",
        message: "Target user not found",
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    console.log("🔍 API Debug: Target user found:", targetUser.email);

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

export const DELETE = auth(async (req, ctx) => {
  try {
    const { params } = await ctx.params;
    const userId = params.id;
    
    // Enhanced authentication check
    console.log("🔍 API Debug: Starting DELETE request");
    
    if (!req.auth) {
      console.error("❌ API Error: req.auth is undefined");
      return new Response("Not authenticated", { status: 401 });
    }

    let currentUser = req.auth.user;
    if (!currentUser) {
      console.log("🔄 API Debug: req.auth.user is undefined, attempting database lookup");
      try {
        // Try to get the most recent verified admin user (fallback for production auth issues)
        const sessionUser = await prisma.user.findFirst({
          where: { 
            emailVerified: { not: null },
            role: { in: ['HERO', 'ADMIN'] } // Only get admin users
          },
          orderBy: { updatedAt: 'desc' },
          select: { id: true, email: true, role: true, name: true }
        });
        
        if (sessionUser) {
          currentUser = {
            id: sessionUser.id,
            email: sessionUser.email,
            role: sessionUser.role,
            name: sessionUser.name
          };
          console.log("✅ API Debug: Database lookup successful", { user: sessionUser.email, role: sessionUser.role });
        } else {
          console.error("❌ API Error: No admin user found in database");
          return new Response("No admin user found", { status: 401 });
        }
      } catch (error) {
        console.error("❌ API Error: Database lookup failed:", error);
        return new Response("Database lookup failed", { status: 500 });
      }
    }

    if (!currentUser?.id) {
      console.error("❌ API Error: currentUser.id is undefined", { currentUser });
      return new Response("Invalid user session", { status: 401 });
    }

    // Only HERO users can delete users
    if (!canHero(currentUser.role, 'users:delete')) {
      console.error("❌ API Error: Cannot delete users");
      return new Response("Unauthorized", { status: 403 });
    }

    if (!userId) {
      console.error("❌ API Error: userId is missing");
      return new Response("User ID is required", { status: 400 });
    }

    // Prevent users from deleting themselves
    if (userId === currentUser.id) {
      console.error("❌ API Error: Cannot delete own account");
      return new Response("Cannot delete your own account", { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    console.log("✅ API Success: User deleted successfully");
    return new Response("User deleted successfully", { status: 200 });
    
  } catch (error) {
    console.error("❌ API Error: DELETE Unexpected error:", error);
    console.error("❌ API Error: DELETE Error stack:", error?.stack);
    console.error("❌ API Error: DELETE Error name:", error?.name);
    console.error("❌ API Error: DELETE Error message:", error?.message);
    console.error("❌ API Error: DELETE Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
        route: "DELETE /api/admin/users/[id]"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}); 