import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupPermanentAdmin() {
  const email = 'lucid8080@gmail.com'
  
  try {
    // First, let's check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    })

    if (!existingUser) {
      console.log('❌ User not found. Creating new admin user...')
      
      const newUser = await prisma.user.create({
        data: {
          email,
          name: 'Lucid Admin',
          role: 'ADMIN',
        }
      })
      
      console.log('✅ New admin user created:', {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      })
    } else {
      console.log('✅ User found. Updating to admin...')
      
      // Update the user to ensure ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          // Also update the name to ensure it's set
          name: existingUser.name || 'Lucid Admin',
        }
      })
      
      console.log('✅ Admin role confirmed:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      })
    }

    // Clear any existing sessions to force re-authentication
    console.log('🔄 Clearing existing sessions...')
    await prisma.session.deleteMany({
      where: {
        user: {
          email
        }
      }
    })
    
    console.log('✅ Sessions cleared. Please sign out and sign back in.')
    console.log('🎉 You should now have permanent admin access!')
    
  } catch (error) {
    console.error('❌ Error setting up permanent admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupPermanentAdmin() 