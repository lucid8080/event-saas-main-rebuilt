import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canHero, canAdmin, isRoleHigherOrEqual } from "@/lib/role-based-access";

export const PATCH = auth(async (req, ctx) => {
  try {
    const { params } = await ctx.params;
    const userId = params.id;
    
    // BULLETPROOF AUTHENTICATION CHECK
    console.log("🔍 API Debug: Starting PATCH request");
    console.log("🔍 API Debug: req.auth exists:", !!req.auth);
    
    // Check if req.auth exists
    if (!req.auth) {
      console.error("❌ API Error: req.auth is undefined");
      return new Response("Not authenticated", { status: 401 });
    }

    // Check if req.auth.user exists
    const currentUser = req.auth.user;
    console.log("🔍 API Debug: currentUser exists:", !!currentUser);
    
    if (!currentUser) {
      console.error("❌ API Error: req.auth.user is undefined");
      return new Response("User not found in session", { status: 401 });
    }

    // Check if currentUser.id exists
    console.log("🔍 API Debug: currentUser.id exists:", !!currentUser.id);
    console.log("🔍 API Debug: currentUser.role:", currentUser.role);
    
    if (!currentUser.id) {
      console.error("❌ API Error: currentUser.id is undefined", { currentUser });
      return new Response("Invalid user session", { status: 401 });
    }

    // Check if currentUser.role exists
    if (!currentUser.role) {
      console.error("❌ API Error: currentUser.role is undefined", { currentUser });
      return new Response("Invalid user role", { status: 401 });
    }

    // FALLBACK: If authentication is still failing, try to get user from database
    let authenticatedUser = currentUser;
    if (!authenticatedUser.id || !authenticatedUser.role) {
      console.log("🔄 API Debug: Attempting database fallback authentication");
      try {
        const dbUser = await prisma.user.findFirst({
          where: { 
            email: authenticatedUser.email || '',
            emailVerified: { not: null }
          },
          select: { id: true, email: true, role: true, name: true }
        });
        
        if (dbUser) {
          authenticatedUser = {
            ...authenticatedUser,
            id: dbUser.id,
            role: dbUser.role,
            email: dbUser.email,
            name: dbUser.name
          };
          console.log("✅ API Debug: Database fallback successful", { user: dbUser.email });
        } else {
          console.error("❌ API Error: Database fallback failed - no verified user found");
          return new Response("User not found in database", { status: 401 });
        }
      } catch (error) {
        console.error("❌ API Error: Database fallback error:", error);
        return new Response("Database authentication failed", { status: 500 });
      }
    }

    // Check if user can manage roles or credits
    const canManageRoles = canHero(authenticatedUser.role, 'roles:assign');
    const canManageCredits = canAdmin(authenticatedUser.role, 'credits:manage');

    console.log("🔍 API Debug: canManageRoles:", canManageRoles);
    console.log("🔍 API Debug: canManageCredits:", canManageCredits);

    if (!canManageRoles && !canManageCredits) {
      console.error("❌ API Error: Insufficient permissions", { 
        userRole: authenticatedUser.role, 
        canManageRoles, 
        canManageCredits 
      });
      return new Response("Insufficient permissions", { status: 403 });
    }

    if (!userId) {
      console.error("❌ API Error: userId is missing");
      return new Response("User ID is required", { status: 400 });
    }

    console.log("🔍 API Debug: Processing request for userId:", userId);

    const body = await req.json();
    const { role, credits } = body;

    console.log("🔍 API Debug: Request body:", { role, credits });

    // Validate role assignment permissions
    if (role) {
      if (!canManageRoles) {
        console.error("❌ API Error: Cannot manage roles");
        return new Response("Insufficient permissions to manage roles", { status: 403 });
      }

      // Validate role value
      if (!["HERO", "ADMIN", "USER"].includes(role)) {
        console.error("❌ API Error: Invalid role:", role);
        return new Response("Invalid role", { status: 400 });
      }

      // Prevent non-HERO users from assigning HERO role
      if (role === "HERO" && !canHero(authenticatedUser.role, 'roles:assign')) {
        console.error("❌ API Error: Cannot assign HERO role");
        return new Response("Only HERO users can assign HERO role", { status: 403 });
      }

      // Prevent users from assigning roles higher than their own
      if (!isRoleHigherOrEqual(authenticatedUser.role, role as any)) {
        console.error("❌ API Error: Cannot assign higher role");
        return new Response("Cannot assign role higher than your own", { status: 403 });
      }
    }

    // Validate credits management permissions
    if (credits !== undefined) {
      if (!canManageCredits) {
        console.error("❌ API Error: Cannot manage credits");
        return new Response("Insufficient permissions to manage credits", { status: 403 });
      }

      if (typeof credits !== "number" || credits < 0) {
        console.error("❌ API Error: Invalid credits value:", credits);
        return new Response("Invalid credits value", { status: 400 });
      }
    }

    // Verify target user exists before updating
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    if (!targetUser) {
      console.error("❌ API Error: Target user not found:", userId);
      return new Response("User not found", { status: 404 });
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

    console.log("✅ API Success: User updated successfully:", updatedUser.email);
    return Response.json(updatedUser);
    
  } catch (error) {
    console.error("❌ API Error: PATCH Unexpected error:", error);
    console.error("❌ API Error: PATCH Error stack:", error?.stack);
    console.error("❌ API Error: PATCH Error name:", error?.name);
    console.error("❌ API Error: PATCH Error message:", error?.message);
    console.error("❌ API Error: PATCH Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Return more detailed error for debugging
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
        route: "PATCH /api/admin/users/[id]"
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

    const currentUser = req.auth.user;
    if (!currentUser) {
      console.error("❌ API Error: req.auth.user is undefined");
      return new Response("User not found in session", { status: 401 });
    }

    if (!currentUser.id) {
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