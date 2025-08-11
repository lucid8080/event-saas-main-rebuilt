import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGalleryDuplicates() {
  try {
    console.log('🔍 Checking for Duplicate Images in Gallery...')
    
    // Check total count of generated images
    const totalImages = await prisma.generatedImage.count()
    console.log(`📊 Total Generated Images: ${totalImages}`)
    
    // Check for duplicate URLs
    const duplicateUrls = await prisma.$queryRaw`
      SELECT url, COUNT(*) as count
      FROM generated_images 
      GROUP BY url 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    if (Array.isArray(duplicateUrls) && duplicateUrls.length > 0) {
      console.log('❌ Found duplicate URLs:')
      duplicateUrls.forEach((item: any) => {
        console.log(`  - URL: ${item.url}`)
        console.log(`    Count: ${item.count}`)
      })
    } else {
      console.log('✅ No duplicate URLs found')
    }
    
    // Check for duplicate R2 keys
    const duplicateR2Keys = await prisma.$queryRaw`
      SELECT "r2Key", COUNT(*) as count
      FROM generated_images 
      WHERE "r2Key" IS NOT NULL
      GROUP BY "r2Key" 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    if (Array.isArray(duplicateR2Keys) && duplicateR2Keys.length > 0) {
      console.log('❌ Found duplicate R2 keys:')
      duplicateR2Keys.forEach((item: any) => {
        console.log(`  - R2 Key: ${item.r2Key}`)
        console.log(`    Count: ${item.count}`)
      })
    } else {
      console.log('✅ No duplicate R2 keys found')
    }
    
    // Check for duplicate WebP keys
    const duplicateWebPKeys = await prisma.$queryRaw`
      SELECT "webpKey", COUNT(*) as count
      FROM generated_images 
      WHERE "webpKey" IS NOT NULL
      GROUP BY "webpKey" 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    if (Array.isArray(duplicateWebPKeys) && duplicateWebPKeys.length > 0) {
      console.log('❌ Found duplicate WebP keys:')
      duplicateWebPKeys.forEach((item: any) => {
        console.log(`  - WebP Key: ${item.webpKey}`)
        console.log(`    Count: ${item.count}`)
      })
    } else {
      console.log('✅ No duplicate WebP keys found')
    }
    
    // Check for images with same prompt and user
    const duplicatePrompts = await prisma.$queryRaw`
      SELECT prompt, "userId", COUNT(*) as count
      FROM generated_images 
      GROUP BY prompt, "userId" 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `
    
    if (Array.isArray(duplicatePrompts) && duplicatePrompts.length > 0) {
      console.log('⚠️ Found images with same prompt and user (potential duplicates):')
      duplicatePrompts.forEach((item: any) => {
        console.log(`  - Prompt: ${item.prompt.substring(0, 100)}...`)
        console.log(`    User ID: ${item.userId}`)
        console.log(`    Count: ${item.count}`)
      })
    } else {
      console.log('✅ No duplicate prompts found')
    }
    
    // Check for images created at the same time (within 1 second)
    const duplicateTimestamps = await prisma.$queryRaw`
      SELECT "userId", prompt, COUNT(*) as count
      FROM generated_images 
      GROUP BY "userId", prompt, DATE_TRUNC('second', "createdAt")
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `
    
    if (Array.isArray(duplicateTimestamps) && duplicateTimestamps.length > 0) {
      console.log('⚠️ Found images created at the same time (potential duplicates):')
      duplicateTimestamps.forEach((item: any) => {
        console.log(`  - User ID: ${item.userId}`)
        console.log(`  - Prompt: ${item.prompt.substring(0, 100)}...`)
        console.log(`    Count: ${item.count}`)
      })
    } else {
      console.log('✅ No duplicate timestamps found')
    }
    
    // Check recent images for patterns
    const recentImages = await prisma.generatedImage.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        url: true,
        prompt: true,
        eventType: true,
        isPublic: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })
    
    console.log('\n📋 Recent Images (last 20):')
    recentImages.forEach((image, index) => {
      console.log(`${index + 1}. ID: ${image.id}`)
      console.log(`   URL: ${image.url.substring(0, 100)}...`)
      console.log(`   Event: ${image.eventType || 'N/A'}`)
      console.log(`   Public: ${image.isPublic}`)
      console.log(`   User: ${image.user.email}`)
      console.log(`   Created: ${image.createdAt}`)
      console.log('')
    })
    
    // Check if user images and public images overlap
    const userImages = await prisma.generatedImage.findMany({
      where: {
        userId: 'clx8qjq8q0000qjq8qjq8qjq8' // Replace with actual user ID
      },
      select: {
        id: true,
        isPublic: true
      }
    })
    
    const publicImages = await prisma.generatedImage.findMany({
      where: {
        isPublic: true
      },
      select: {
        id: true,
        userId: true
      }
    })
    
    const userImageIds = new Set(userImages.map(img => img.id))
    const overlappingImages = publicImages.filter(img => userImageIds.has(img.id))
    
    console.log(`\n📊 User/Public Image Overlap:`)
    console.log(`   User Images: ${userImages.length}`)
    console.log(`   Public Images: ${publicImages.length}`)
    console.log(`   Overlapping: ${overlappingImages.length}`)
    
    if (overlappingImages.length > 0) {
      console.log('⚠️ Found images that are both user images and public images:')
      overlappingImages.forEach(img => {
        console.log(`  - Image ID: ${img.id}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking gallery duplicates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGalleryDuplicates()
