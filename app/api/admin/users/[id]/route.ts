import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canHero, canAdmin, isRoleHigherOrEqual } from "@/lib/role-based-access";

export const PATCH = auth(async (req, { params }: { params: { id: string } }) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Unauthorized", { status: 403 });
  }

  // Check if user can manage roles or credits
  const canManageRoles = canHero(currentUser.role, 'roles:assign');
  const canManageCredits = canAdmin(currentUser.role, 'credits:manage');

  if (!canManageRoles && !canManageCredits) {
    return new Response("Unauthorized", { status: 403 });
  }

  const userId = params.id;
  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  try {
    const body = await req.json();
    const { role, credits } = body;

    // Validate role assignment permissions
    if (role) {
      if (!canManageRoles) {
        return new Response("Insufficient permissions to manage roles", { status: 403 });
      }

      // Validate role value
      if (!["HERO", "ADMIN", "USER"].includes(role)) {
        return new Response("Invalid role", { status: 400 });
      }

      // Prevent non-HERO users from assigning HERO role
      if (role === "HERO" && !canHero(currentUser.role, 'roles:assign')) {
        return new Response("Only HERO users can assign HERO role", { status: 403 });
      }

      // Prevent users from assigning roles higher than their own
      if (!isRoleHigherOrEqual(currentUser.role, role as any)) {
        return new Response("Cannot assign role higher than your own", { status: 403 });
      }
    }

    // Validate credits management permissions
    if (credits !== undefined) {
      if (!canManageCredits) {
        return new Response("Insufficient permissions to manage credits", { status: 403 });
      }

      if (typeof credits !== "number" || credits < 0) {
        return new Response("Invalid credits value", { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(credits !== undefined && { credits }),
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

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

export const DELETE = auth(async (req, { params }: { params: { id: string } }) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Unauthorized", { status: 403 });
  }

  // Only HERO users can delete users
  if (!canHero(currentUser.role, 'users:delete')) {
    return new Response("Unauthorized", { status: 403 });
  }

  const userId = params.id;
  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  // Prevent users from deleting themselves
  if (userId === currentUser.id) {
    return new Response("Cannot delete your own account", { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}); 