import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default credit value if it doesn't exist
  await prisma.settings.upsert({
    where: { key: 'creditValue' },
    update: {},
    create: {
      key: 'creditValue',
      value: 1.00, // Default value
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Admin user: thinkbiglifestyle365@gmail.com (ADMIN role)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 