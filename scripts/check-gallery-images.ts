import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGalleryImages() {
  try {
    console.log('🔍 Checking Gallery Images Database...')
    
    // Check total count of generated images
    const totalImages = await prisma.generatedImage.count()
    console.log(`📊 Total Generated Images: ${totalImages}`)
    
    // Check total count of generated carousels
    const totalCarousels = await prisma.generatedCarousel.count()
    console.log(`📊 Total Generated Carousels: ${totalCarousels}`)
    
    if (totalImages === 0 && totalCarousels === 0) {
      console.log('❌ No gallery images found in database!')
      console.log('')
      console.log('🔧 Possible causes:')
      console.log('1. Database was reset/cleared')
      console.log('2. Images were accidentally deleted')
      console.log('3. Database connection issues')
      console.log('4. Migration issues')
      console.log('')
      console.log('💡 Solutions:')
      console.log('1. Check if GeneratedImage table exists')
      console.log('2. Check if GeneratedCarousel table exists')
      console.log('3. Restore from backup if available')
      console.log('4. Check user accounts and image generation history')
      return
    }
    
    // Get recent images with details
    const recentImages = await prisma.generatedImage.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
    
    if (recentImages.length > 0) {
      console.log('')
      console.log('📋 Recent Generated Images:')
      console.log('')
      
      recentImages.forEach((image, index) => {
        console.log(`${index + 1}. ${image.title || 'Untitled'}`)
        console.log(`   ID: ${image.id}`)
        console.log(`   User: ${image.user?.email || 'Unknown'} (${image.user?.name || 'Unknown'})`)
        console.log(`   Event Type: ${image.eventType}`)
        console.log(`   Style: ${image.stylePreset}`)
        console.log(`   URL: ${image.imageUrl}`)
        console.log(`   Public: ${image.isPublic ? '✅' : '❌'}`)
        console.log(`   Created: ${image.createdAt}`)
        console.log('')
      })
    }
    
    // Get recent carousels with details
    const recentCarousels = await prisma.generatedCarousel.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
    
    if (recentCarousels.length > 0) {
      console.log('')
      console.log('📋 Recent Generated Carousels:')
      console.log('')
      
      recentCarousels.forEach((carousel, index) => {
        console.log(`${index + 1}. ${carousel.title || 'Untitled'}`)
        console.log(`   ID: ${carousel.id}`)
        console.log(`   User: ${carousel.user?.email || 'Unknown'} (${carousel.user?.name || 'Unknown'})`)
        console.log(`   Slides: ${carousel.slides.length}`)
        console.log(`   Public: ${carousel.isPublic ? '✅' : '❌'}`)
        console.log(`   Created: ${carousel.createdAt}`)
        console.log('')
      })
    }
    
    // Check public images count
    const publicImages = await prisma.generatedImage.count({
      where: { isPublic: true }
    })
    
    const publicCarousels = await prisma.generatedCarousel.count({
      where: { isPublic: true }
    })
    
    console.log(`🌐 Public Images: ${publicImages}`)
    console.log(`🌐 Public Carousels: ${publicCarousels}`)
    
    // Check by user
    const usersWithImages = await prisma.user.findMany({
      where: {
        generatedImages: {
          some: {}
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            generatedImages: true,
            generatedCarousels: true
          }
        }
      }
    })
    
    if (usersWithImages.length > 0) {
      console.log('')
      console.log('👥 Users with Images:')
      usersWithImages.forEach(user => {
        console.log(`- ${user.email} (${user.name}): ${user._count.generatedImages} images, ${user._count.generatedCarousels} carousels`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking gallery images:', error)
    
    // Check if tables exist
    try {
      const imageTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'generated_images'
        );
      `
      const carouselTableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'generated_carousels'
        );
      `
      console.log('')
      console.log('🔍 Table Check:')
      console.log(`GeneratedImage table exists: ${imageTableExists}`)
      console.log(`GeneratedCarousel table exists: ${carouselTableExists}`)
    } catch (tableError) {
      console.log('❌ Could not check if tables exist')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkGalleryImages() 