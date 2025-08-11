/**
 * API endpoints for managing advanced AI provider settings
 * Admin-only endpoints for configuring provider parameters
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProviderSettings, SettingsUpdateRequest } from "@/lib/types/provider-settings";

/**
 * GET /api/admin/provider-settings
 * Retrieve provider settings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Admin authentication check
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "HERO")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" }, 
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const providerId = url.searchParams.get("providerId");
    const isActive = url.searchParams.get("isActive");
    const getDefaultOnly = url.searchParams.get("defaultOnly");
    
    // If requesting default provider only, return just the default provider info
    if (getDefaultOnly === "true") {
      const defaultSettings = await prisma.providerSettings.findFirst({
        where: { isDefault: true, isActive: true },
        orderBy: { createdAt: "desc" }
      });
      
      if (defaultSettings) {
        return NextResponse.json({
          success: true,
          defaultProvider: {
            providerId: defaultSettings.providerId,
            name: defaultSettings.name,
            baseSettings: typeof defaultSettings.baseSettings === 'string' 
              ? JSON.parse(defaultSettings.baseSettings) 
              : defaultSettings.baseSettings,
            specificSettings: typeof defaultSettings.specificSettings === 'string'
              ? JSON.parse(defaultSettings.specificSettings)
              : defaultSettings.specificSettings
          }
        });
      } else {
        return NextResponse.json({
          success: true,
          defaultProvider: null
        });
      }
    }
    
    // Build query filters
    const where: any = {};
    if (providerId) {
      where.providerId = providerId;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    // Fetch provider settings
    const settings = await prisma.providerSettings.findMany({
      where,
      orderBy: [
        { providerId: "asc" },
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    });
    
    console.log(`[ProviderSettings] Retrieved ${settings.length} settings for filters:`, where);
    
    return NextResponse.json({
      success: true,
      settings: settings.map(setting => ({
        ...setting,
        baseSettings: typeof setting.baseSettings === 'string' 
          ? JSON.parse(setting.baseSettings) 
          : setting.baseSettings,
        specificSettings: typeof setting.specificSettings === 'string'
          ? JSON.parse(setting.specificSettings)
          : setting.specificSettings
      }))
    });
    
  } catch (error) {
    console.error('[ProviderSettings] GET error:', error);
    return NextResponse.json(
      { error: "Failed to retrieve provider settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/provider-settings
 * Create new provider settings (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Admin authentication check
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "HERO")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" }, 
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      providerId,
      name,
      description,
      baseSettings,
      specificSettings,
      isActive = true,
      isDefault = false
    } = body;
    
    // Validation
    if (!providerId || !name) {
      return NextResponse.json(
        { error: "Provider ID and name are required" },
        { status: 400 }
      );
    }
    
    // If setting as default, unset other defaults for this provider
    if (isDefault) {
      await prisma.providerSettings.updateMany({
        where: { providerId, isDefault: true },
        data: { isDefault: false }
      });
    }
    
    // Check if settings already exist for this provider and name
    const existingSettings = await prisma.providerSettings.findFirst({
      where: {
        providerId,
        name
      }
    });

    let newSettings;
    
    if (existingSettings) {
      // Update existing settings instead of creating new ones
      newSettings = await prisma.providerSettings.update({
        where: { id: existingSettings.id },
        data: {
          description,
          baseSettings: baseSettings || {},
          specificSettings: specificSettings || {},
          isActive,
          isDefault,
          updatedBy: session.user.id,
          version: { increment: 1 }
        }
      });
      
      console.log(`[ProviderSettings] Updated existing settings: ${providerId}/${name}`);
    } else {
      // Create new settings
      newSettings = await prisma.providerSettings.create({
        data: {
          providerId,
          name,
          description,
          baseSettings: baseSettings || {},
          specificSettings: specificSettings || {},
          isActive,
          isDefault,
          createdBy: session.user.id,
          updatedBy: session.user.id,
          version: 1
        }
      });
      
      console.log(`[ProviderSettings] Created new settings: ${providerId}/${name}`);
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        ...newSettings,
        baseSettings: typeof newSettings.baseSettings === 'string'
          ? JSON.parse(newSettings.baseSettings)
          : newSettings.baseSettings,
        specificSettings: typeof newSettings.specificSettings === 'string'
          ? JSON.parse(newSettings.specificSettings)
          : newSettings.specificSettings
      }
    });
    
  } catch (error: any) {
    console.error("[ProviderSettings] POST error:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Settings with this provider ID and name already exist. The system will update the existing settings instead." },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid reference - check that all required fields are provided" },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create provider settings", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/provider-settings
 * Update provider settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    // Admin authentication check
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "HERO")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" }, 
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Settings ID is required" },
        { status: 400 }
      );
    }
    
    // Get current settings
    const currentSettings = await prisma.providerSettings.findUnique({
      where: { id }
    });
    
    if (!currentSettings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }
    
    // If setting as default, unset other defaults for this provider
    if (updateData.isDefault && !currentSettings.isDefault) {
      await prisma.providerSettings.updateMany({
        where: { 
          providerId: currentSettings.providerId, 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }
    
    // Update settings
    const updatedSettings = await prisma.providerSettings.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: session.user.id,
        version: { increment: 1 }
      }
    });
    
    console.log(`[ProviderSettings] Updated settings: ${updatedSettings.providerId}/${updatedSettings.name}`);
    
    return NextResponse.json({
      success: true,
      settings: {
        ...updatedSettings,
        baseSettings: typeof updatedSettings.baseSettings === 'string'
          ? JSON.parse(updatedSettings.baseSettings)
          : updatedSettings.baseSettings,
        specificSettings: typeof updatedSettings.specificSettings === 'string'
          ? JSON.parse(updatedSettings.specificSettings)
          : updatedSettings.specificSettings
      }
    });
    
  } catch (error) {
    console.error("[ProviderSettings] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update provider settings" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/provider-settings/{id}
 * Delete provider settings (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    // Admin authentication check
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "HERO")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" }, 
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Settings ID is required" },
        { status: 400 }
      );
    }
    
    // Check if settings exist
    const settings = await prisma.providerSettings.findUnique({
      where: { id }
    });
    
    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }
    
    // Don't allow deletion of default settings
    if (settings.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default settings" },
        { status: 400 }
      );
    }
    
    // Delete settings
    await prisma.providerSettings.delete({
      where: { id }
    });
    
    console.log(`[ProviderSettings] Deleted settings: ${settings.providerId}/${settings.name}`);
    
    return NextResponse.json({
      success: true,
      message: "Settings deleted successfully"
    });
    
  } catch (error) {
    console.error("[ProviderSettings] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete provider settings" },
      { status: 500 }
    );
  }
}
