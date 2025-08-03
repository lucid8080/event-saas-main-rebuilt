import { prisma } from "@/lib/db";

export async function getImageEditToggle(): Promise<boolean> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "imageEditEnabled" },
    });
    return setting?.value === 1;
  } catch (error) {
    console.error("Error fetching image edit toggle setting:", error);
    return true; // Default to enabled if there's an error
  }
}

export async function setImageEditToggle(enabled: boolean): Promise<void> {
  try {
    await prisma.settings.upsert({
      where: { key: "imageEditEnabled" },
      update: { value: enabled ? 1 : 0 },
      create: { key: "imageEditEnabled", value: enabled ? 1 : 0 },
    });
  } catch (error) {
    console.error("Error setting image edit toggle:", error);
    throw error;
  }
} 