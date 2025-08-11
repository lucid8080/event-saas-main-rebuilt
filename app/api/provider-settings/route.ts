/**
 * Public API endpoint for getting current provider settings
 * Accessible to all authenticated users
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/provider-settings
 * Get current default provider settings (public - any authenticated user)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Basic authentication check (any authenticated user can access)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" }, 
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
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
    
    // For now, only support getting default provider
    return NextResponse.json({
      success: true,
      message: "Use ?defaultOnly=true to get default provider settings"
    });
    
  } catch (error) {
    console.error('[ProviderSettings] Public GET error:', error);
    return NextResponse.json(
      { error: "Failed to retrieve provider settings" },
      { status: 500 }
    );
  }
}
