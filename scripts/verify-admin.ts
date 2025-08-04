import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyAdminStatus() {
  const email = 'lucid8080@gmail.com'
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return
    }

    console.log('✅ User found:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    console.log('Created:', user.createdAt)
    console.log('Updated:', user.updatedAt)
    
    if (user.role === 'ADMIN') {
      console.log('🎉 User has ADMIN privileges!')
    } else if (user.role === 'HERO') {
      console.log('🦸‍♂️ User has HERO (Super Admin) privileges!')
    } else {
      console.log('⚠️  User does NOT have admin privileges')
    }
  } catch (error) {
    console.error('❌ Error verifying admin status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdminStatus() 