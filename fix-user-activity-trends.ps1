# Fix User Activity Trends - PowerShell Script
# This script sets the required environment variable and starts the development server

Write-Host "🔧 Fixing User Activity Trends Data Issue..." -ForegroundColor Yellow
Write-Host ""

# Set the required environment variables
Write-Host "✅ Setting NEXT_PUBLIC_ENABLE_CHARTS=true" -ForegroundColor Green
$env:NEXT_PUBLIC_ENABLE_CHARTS = "true"

Write-Host "✅ Setting NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true" -ForegroundColor Green
$env:NEXT_PUBLIC_ENABLE_CLOUD_SERVICES = "true"

Write-Host "✅ Setting NEXT_PUBLIC_ENABLE_ANIMATIONS=true" -ForegroundColor Green
$env:NEXT_PUBLIC_ENABLE_ANIMATIONS = "true"

Write-Host "✅ Setting NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING=true" -ForegroundColor Green
$env:NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING = "true"

Write-Host ""
Write-Host "📊 Environment variables set successfully!" -ForegroundColor Green
Write-Host ""

# Verify the environment variables are set
Write-Host "🔍 Verifying environment variables:" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_ENABLE_CHARTS: $env:NEXT_PUBLIC_ENABLE_CHARTS" -ForegroundColor White
Write-Host "NEXT_PUBLIC_ENABLE_CLOUD_SERVICES: $env:NEXT_PUBLIC_ENABLE_CLOUD_SERVICES" -ForegroundColor White
Write-Host "NEXT_PUBLIC_ENABLE_ANIMATIONS: $env:NEXT_PUBLIC_ENABLE_ANIMATIONS" -ForegroundColor White
Write-Host "NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING: $env:NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Starting development server with charts enabled..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📈 Your User Activity Trends should now display data!" -ForegroundColor Green
Write-Host "🌐 Navigate to: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev