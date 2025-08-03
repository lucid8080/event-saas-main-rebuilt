import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function grantAdminRights() {
  const email = 'lucid8080@gmail.com'
  
  try {
    // Update the user to have ADMIN role
    const updatedUser = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'ADMIN',
      },
      create: {
        email,
        name: 'Lucid Admin',
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin rights granted successfully!')
    console.log('User:', {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    })
  } catch (error) {
    console.error('❌ Error granting admin rights:', error)
  } finally {
    await prisma.$disconnect()
  }
}

grantAdminRights() 