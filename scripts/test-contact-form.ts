import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testContactForm() {
  console.log('🧪 Testing Contact Form Functionality...\n');

  try {
    // Test 1: Create a test contact message
    console.log('1. Creating test contact message...');
    const testMessage = await prisma.contactMessage.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        subject: 'Test Message',
        message: 'This is a test message to verify the contact form functionality.',
        status: 'NEW',
      },
    });
    console.log('✅ Test message created:', testMessage.id);

    // Test 2: Fetch messages
    console.log('\n2. Fetching messages...');
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    console.log('✅ Found', messages.length, 'messages');

    // Test 3: Update message status
    console.log('\n3. Updating message status...');
    const updatedMessage = await prisma.contactMessage.update({
      where: { id: testMessage.id },
      data: { status: 'READ' },
    });
    console.log('✅ Message status updated to:', updatedMessage.status);

    // Test 4: Search messages
    console.log('\n4. Testing search functionality...');
    const searchResults = await prisma.contactMessage.findMany({
      where: {
        OR: [
          { firstName: { contains: 'John', mode: 'insensitive' } },
          { lastName: { contains: 'Doe', mode: 'insensitive' } },
          { email: { contains: 'john', mode: 'insensitive' } },
        ],
      },
    });
    console.log('✅ Search found', searchResults.length, 'messages');

    // Test 5: Get message statistics
    console.log('\n5. Getting message statistics...');
    const stats = await prisma.contactMessage.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });
    console.log('✅ Message statistics:', stats);

    // Clean up test message
    console.log('\n6. Cleaning up test message...');
    await prisma.contactMessage.delete({
      where: { id: testMessage.id },
    });
    console.log('✅ Test message deleted');

    console.log('\n🎉 All tests passed! Contact form functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContactForm(); 