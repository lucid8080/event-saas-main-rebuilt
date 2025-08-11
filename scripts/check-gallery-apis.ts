import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGalleryAPIs() {
  try {
    console.log('🔍 Checking Gallery API Responses...')
    
    // Get user images (for a specific user)
    const userImages = await prisma.generatedImage.findMany({
      where: {
        userId: 'cmdvsi8gw0000jy2oig4ahn5x' // Replace with actual user ID
      },
      select: {
        id: true,
        url: true,
        prompt: true,
        eventType: true,
        isPublic: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 User Images: ${userImages.length}`)
    
    // Get public images
    const publicImages = await prisma.generatedImage.findMany({
      where: {
        isPublic: true
      },
      select: {
        id: true,
        url: true,
        prompt: true,
        eventType: true,
        isPublic: true,
        createdAt: true,
        userId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 Public Images: ${publicImages.length}`)
    
    // Check for overlap
    const userImageIds = new Set(userImages.map(img => img.id))
    const overlappingImages = publicImages.filter(img => userImageIds.has(img.id))
    
    console.log(`📊 Overlapping Images: ${overlappingImages.length}`)
    
    if (overlappingImages.length > 0) {
      console.log('⚠️ Found images that appear in both user and public APIs:')
      overlappingImages.forEach(img => {
        console.log(`  - ID: ${img.id}`)
        console.log(`    URL: ${img.url.substring(0, 100)}...`)
        console.log(`    Event: ${img.eventType || 'N/A'}`)
        console.log(`    User ID: ${img.userId}`)
        console.log('')
      })
    }
    
    // Check for duplicate IDs in the combined list
    const allImageIds = [...userImages.map(img => img.id), ...publicImages.map(img => img.id)]
    const duplicateIds = allImageIds.filter((id, index) => allImageIds.indexOf(id) !== index)
    
    if (duplicateIds.length > 0) {
      console.log('❌ Found duplicate IDs in combined list:')
      duplicateIds.forEach(id => {
        console.log(`  - ID: ${id}`)
      })
    } else {
      console.log('✅ No duplicate IDs found in combined list')
    }
    
    // Show sample of recent images
    console.log('\n📋 Recent User Images (first 5):')
    userImages.slice(0, 5).forEach((image, index) => {
      console.log(`${index + 1}. ID: ${image.id}`)
      console.log(`   URL: ${image.url.substring(0, 100)}...`)
      console.log(`   Event: ${image.eventType || 'N/A'}`)
      console.log(`   Public: ${image.isPublic}`)
      console.log('')
    })
    
    console.log('\n📋 Recent Public Images (first 5):')
    publicImages.slice(0, 5).forEach((image, index) => {
      console.log(`${index + 1}. ID: ${image.id}`)
      console.log(`   URL: ${image.url.substring(0, 100)}...`)
      console.log(`   Event: ${image.eventType || 'N/A'}`)
      console.log(`   User ID: ${image.userId}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking gallery APIs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGalleryAPIs()
