# 🚀 Feature Flags Reference Guide

## Environment Variables for Feature Control

Add these to your `.env.local` file with comments for easy reference:

```env
# ============================================================================
# 🎛️ FEATURE FLAGS - Control what features are enabled/disabled
# ============================================================================

# 🌐 CLOUD SERVICES - Controls R2 storage and cloud features
# When TRUE: Images uploaded to your Cloudflare R2 bucket, WebP optimization, signed URLs
# When FALSE: Uses direct Ideogram URLs (simpler, no R2 setup needed)
# Impact: HIGH - Affects image storage and optimization
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true

# 📊 CHARTS - Controls dashboard analytics and chart components  
# When TRUE: Admin dashboard shows charts, analytics, user statistics
# When FALSE: Charts replaced with placeholder components
# Impact: MEDIUM - Affects admin dashboard functionality
NEXT_PUBLIC_ENABLE_CHARTS=true

# 🖼️ IMAGE PROCESSING - Controls advanced image processing features
# When TRUE: Image optimization, format conversion, quality adjustments, Sharp library
# When FALSE: Basic image generation only, no advanced processing
# Impact: MEDIUM - Affects image quality and processing capabilities
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true

# ✨ ANIMATIONS - Controls UI animations and motion effects
# When TRUE: Smooth transitions, hover effects, loading animations
# When FALSE: Static UI without animations (better for performance/accessibility)
# Impact: LOW - Visual enhancements only
NEXT_PUBLIC_ENABLE_ANIMATIONS=true

# ============================================================================
# 💡 RECOMMENDED SETTINGS:
# ============================================================================
# Development: All TRUE (full feature testing)
# Production: All TRUE (full functionality)  
# Minimal Setup: CLOUD_SERVICES=false, others TRUE (works without R2)
# Performance Mode: ANIMATIONS=false, others TRUE (faster on slow devices)
# ============================================================================
```

## Quick Reference

| Flag | Purpose | When Disabled | Impact Level |
|------|---------|---------------|--------------|
| `CLOUD_SERVICES` | R2 storage, WebP optimization | Uses Ideogram URLs directly | **HIGH** |
| `CHARTS` | Dashboard analytics | Shows placeholder charts | **MEDIUM** |
| `IMAGE_PROCESSING` | Advanced image features | Basic processing only | **MEDIUM** |
| `ANIMATIONS` | UI motion effects | Static interface | **LOW** |

## Common Configurations

### 🔥 **Full Production** (Recommended)
```env
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
NEXT_PUBLIC_ENABLE_CHARTS=true  
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```

### 🚀 **Quick Start** (No R2 setup needed)
```env
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=false
NEXT_PUBLIC_ENABLE_CHARTS=true
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```

### ⚡ **Performance Mode** (Faster loading)
```env
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
NEXT_PUBLIC_ENABLE_CHARTS=false
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=false
NEXT_PUBLIC_ENABLE_ANIMATIONS=false
```

### 🛠️ **Development Mode** (All features for testing)
```env
NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true
NEXT_PUBLIC_ENABLE_CHARTS=true
NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
```