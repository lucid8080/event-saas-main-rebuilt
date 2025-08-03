"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type UpdateUserImageData = {
  imageUrl: string;
};

export async function updateUserImage(data: UpdateUserImageData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const { imageUrl } = data;

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      throw new Error("Invalid image URL format");
    }

    // Update the user's profile image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    revalidatePath('/dashboard/settings');
    return { status: "success" };
  } catch (error) {
    console.error("Error updating user image:", error);
    return { 
      status: "error", 
      message: error instanceof Error ? error.message : "Failed to update profile image" 
    };
  }
} 