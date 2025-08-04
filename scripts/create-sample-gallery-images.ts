import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSampleGalleryImages() {
  try {
    console.log('🎨 Creating sample gallery images...')
    
    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.')
      return
    }
    
    console.log(`✅ Using admin user: ${adminUser.email}`)
    
    // Sample image data - GeneratedImage doesn't have title field
    const sampleImages = [
      {
        eventType: "WEDDING",
        url: "https://ideogram.ai/api/images/direct/example-wedding-1.jpg",
        prompt: "Elegant wedding celebration with golden accents, romantic atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "WEDDING",
          stylePreset: "Golden Harmony",
          description: "Elegant Wedding Celebration"
        }
      },
      {
        eventType: "BIRTHDAY_PARTY",
        url: "https://ideogram.ai/api/images/direct/example-birthday-1.jpg",
        prompt: "Vibrant birthday party with colorful decorations, festive atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "BIRTHDAY_PARTY",
          stylePreset: "Pop Art",
          description: "Birthday Party Extravaganza"
        }
      },
      {
        eventType: "CORPORATE_EVENT",
        url: "https://ideogram.ai/api/images/direct/example-corporate-1.jpg",
        prompt: "Professional corporate event with modern design, business atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "CORPORATE_EVENT",
          stylePreset: "Wild Card",
          description: "Corporate Business Meeting"
        }
      },
      {
        eventType: "CONCERT",
        url: "https://ideogram.ai/api/images/direct/example-concert-1.jpg",
        prompt: "Dynamic rock concert with neon lights, energetic atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "CONCERT",
          stylePreset: "Cyberpunk",
          description: "Rock Concert Night"
        }
      },
      {
        eventType: "SPORTS_EVENT",
        url: "https://ideogram.ai/api/images/direct/example-sports-1.jpg",
        prompt: "Exciting sports championship with dynamic action, competitive atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "SPORTS_EVENT",
          stylePreset: "Street Art",
          description: "Sports Championship"
        }
      },
      {
        eventType: "HOLIDAY_CELEBRATION",
        url: "https://ideogram.ai/api/images/direct/example-holiday-1.jpg",
        prompt: "Warm holiday family gathering with festive decorations, cozy atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "HOLIDAY_CELEBRATION",
          stylePreset: "Children Book",
          description: "Holiday Family Gathering"
        }
      },
      {
        eventType: "NIGHTLIFE",
        url: "https://ideogram.ai/api/images/direct/example-nightlife-1.jpg",
        prompt: "Vibrant nightclub party with neon lights, energetic atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "NIGHTLIFE",
          stylePreset: "Retro Game",
          description: "Nightclub Party"
        }
      },
      {
        eventType: "OTHER",
        url: "https://ideogram.ai/api/images/direct/example-bbq-1.jpg",
        prompt: "Community BBQ event with outdoor setting, friendly atmosphere, no text unless otherwise specified",
        isPublic: true,
        eventDetails: {
          eventType: "OTHER",
          stylePreset: "Vintage Film Poster",
          description: "Community BBQ Event"
        }
      }
    ]
    
    let createdCount = 0
    
    for (const imageData of sampleImages) {
      try {
        const createdImage = await prisma.generatedImage.create({
          data: {
            ...imageData,
            eventType: imageData.eventType as any, // Cast to EventType enum
            user: {
              connect: {
                id: adminUser.id
              }
            }
          }
        })
        
        console.log(`✅ Created: ${imageData.eventDetails?.description || imageData.eventType}`)
        createdCount++
      } catch (error) {
        console.log(`❌ Failed to create: ${imageData.eventDetails?.description || imageData.eventType} - ${error}`)
      }
    }
    
    // Create some sample carousels
    const sampleCarousels = [
      {
        title: "Marketing Campaign Series",
        description: "A series of marketing campaign slides",
        slides: [
          { text: "Welcome to Our Campaign", background: "peach-waves" },
          { text: "Key Benefits", background: "mint-flow" },
          { text: "Call to Action", background: "lavender-smooth" }
        ],
        isPublic: true,
        slideUrls: [
          "https://ideogram.ai/api/images/direct/slide-1.jpg",
          "https://ideogram.ai/api/images/direct/slide-2.jpg",
          "https://ideogram.ai/api/images/direct/slide-3.jpg"
        ],
        slideCount: 3
      },
      {
        title: "Product Launch Sequence",
        description: "Product launch presentation slides",
        slides: [
          { text: "New Product Launch", background: "coral-waves" },
          { text: "Features & Benefits", background: "sage-organic" },
          { text: "Get Started Today", background: "peach-waves" }
        ],
        isPublic: true,
        slideUrls: [
          "https://ideogram.ai/api/images/direct/product-1.jpg",
          "https://ideogram.ai/api/images/direct/product-2.jpg",
          "https://ideogram.ai/api/images/direct/product-3.jpg"
        ],
        slideCount: 3
      }
    ]
    
    let createdCarouselCount = 0
    
    for (const carouselData of sampleCarousels) {
      try {
        const createdCarousel = await prisma.generatedCarousel.create({
          data: {
            ...carouselData,
            user: {
              connect: {
                id: adminUser.id
              }
            },
            slides: carouselData.slides as any
          }
        })
        
        console.log(`✅ Created Carousel: ${createdCarousel.title}`)
        createdCarouselCount++
      } catch (error) {
        console.log(`❌ Failed to create carousel: ${carouselData.title} - ${error}`)
      }
    }
    
    console.log('')
    console.log(`🎉 Sample gallery creation completed!`)
    console.log(`📸 Created ${createdCount} sample images`)
    console.log(`🎠 Created ${createdCarouselCount} sample carousels`)
    console.log('')
    console.log('💡 These are sample images with placeholder URLs.')
    console.log('💡 In a real scenario, these would be actual generated images from Ideogram.')
    console.log('💡 You can now test the gallery functionality with these samples.')
    
  } catch (error) {
    console.error('❌ Error creating sample gallery images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleGalleryImages()