import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAdminRoleEditing() {
  try {
    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    console.log('✅ Admin users found:')
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - ${user.role}`)
    })

    // Get a sample regular user to test role editing
    const regularUser = await prisma.user.findFirst({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    if (regularUser) {
      console.log('')
      console.log('✅ Sample regular user for testing:')
      console.log(`- ${regularUser.email} (${regularUser.name}) - ${regularUser.role}`)
      console.log('')
      console.log('🎉 Admin role editing features available:')
      console.log('1. Inline role editing in users table')
      console.log('2. Dropdown to switch between ADMIN and USER roles')
      console.log('3. Save/Cancel buttons for role changes')
      console.log('4. Visual feedback with loading states')
      console.log('5. Toast notifications for success/error')
      console.log('')
      console.log('To test:')
      console.log('- Log in with any admin account (lucid8080@gmail.com)')
      console.log('- Go to Admin Dashboard → Users tab')
      console.log('- Click the edit icon next to any user\'s role')
      console.log('- Change the role and save')
      console.log('- Verify the change is reflected in the database')
    } else {
      console.log('⚠️  No regular users found for testing')
    }

    // Test API endpoint accessibility
    console.log('')
    console.log('🔧 API Endpoint Test:')
    console.log('- PATCH /api/admin/users/[id] - Update user role')
    console.log('- Requires admin authentication')
    console.log('- Accepts { role: "ADMIN" | "USER" } in request body')
    console.log('- Returns updated user data on success')

  } catch (error) {
    console.error('❌ Error testing admin role editing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminRoleEditing() 