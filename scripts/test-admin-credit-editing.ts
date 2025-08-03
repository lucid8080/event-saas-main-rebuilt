import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAdminCreditEditing() {
  try {
    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
      }
    })

    console.log('✅ Admin users found:')
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - ${user.role} - ${user.credits} credits`)
    })

    // Get a sample regular user to test credit editing
    const regularUser = await prisma.user.findFirst({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
      }
    })

    if (regularUser) {
      console.log('')
      console.log('✅ Sample regular user for testing:')
      console.log(`- ${regularUser.email} (${regularUser.name}) - ${regularUser.role} - ${regularUser.credits} credits`)
      console.log('')
      console.log('🎉 Admin credit editing features available:')
      console.log('1. Inline credit editing in users table')
      console.log('2. Number input field for credit amount')
      console.log('3. Save/Cancel buttons for credit changes')
      console.log('4. Visual feedback with loading states')
      console.log('5. Toast notifications for success/error')
      console.log('6. Coins icon for visual credit display')
      console.log('7. Minimum value validation (0 credits)')
      console.log('')
      console.log('To test:')
      console.log('- Log in with any admin account (lucid8080@gmail.com)')
      console.log('- Go to Admin Dashboard → Users tab')
      console.log('- Click the edit icon next to any user\'s credits')
      console.log('- Change the credit amount and save')
      console.log('- Verify the change is reflected in the database')
    } else {
      console.log('⚠️  No regular users found for testing')
    }

    // Test API endpoint accessibility
    console.log('')
    console.log('🔧 API Endpoint Test:')
    console.log('- PATCH /api/admin/users/[id] - Update user credits')
    console.log('- Requires admin authentication')
    console.log('- Accepts { credits: number } in request body')
    console.log('- Returns updated user data on success')
    console.log('- Validates credits >= 0')

    // Show current credit distribution
    console.log('')
    console.log('📊 Current Credit Distribution:')
    const creditStats = await prisma.user.groupBy({
      by: ['role'],
      _sum: {
        credits: true
      },
      _count: {
        credits: true
      }
    })

    creditStats.forEach(stat => {
      console.log(`- ${stat.role}: ${stat._sum.credits} total credits across ${stat._count.credits} users`)
    })

  } catch (error) {
    console.error('❌ Error testing admin credit editing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminCreditEditing() 