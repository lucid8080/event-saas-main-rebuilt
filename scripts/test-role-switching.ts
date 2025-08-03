import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRoleSwitching() {
  const email = 'lucid8080@gmail.com'
  
  try {
    // Check current user status
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return
    }

    console.log('✅ Current user status:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
    
    if (user.role === 'ADMIN') {
      console.log('🎉 User has ADMIN privileges and can use role switching!')
      console.log('')
      console.log('Role switching features available:')
      console.log('1. Role Switcher in top navbar (dropdown menu)')
      console.log('2. Role Testing Interface in settings page')
      console.log('3. Can switch between ADMIN and USER views')
      console.log('')
      console.log('To test:')
      console.log('- Log in with lucid8080@gmail.com')
      console.log('- Look for the role switcher in the top navbar')
      console.log('- Go to Settings page to see Role Testing Interface')
    } else {
      console.log('⚠️  User does NOT have admin privileges')
    }
  } catch (error) {
    console.error('❌ Error testing role switching:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRoleSwitching() 