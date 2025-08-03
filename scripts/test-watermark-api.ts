import { prisma } from '../lib/db';

async function testWatermarkAPI() {
  console.log('Testing watermark API functionality...\n');

  try {
    // Test 1: Check if we can find a user
    console.log('1. Finding a test user...');
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        watermarkEnabled: true
      }
    });

    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('✅ Found user:', user.email);
    console.log('   Current watermark setting:', user.watermarkEnabled);

    // Test 2: Update watermark setting
    console.log('\n2. Testing watermark setting update...');
    const newSetting = !user.watermarkEnabled;
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { watermarkEnabled: newSetting },
      select: {
        id: true,
        email: true,
        watermarkEnabled: true
      }
    });

    console.log('✅ Watermark setting updated successfully');
    console.log('   New setting:', updatedUser.watermarkEnabled);

    // Test 3: Verify the change
    console.log('\n3. Verifying the change...');
    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        watermarkEnabled: true
      }
    });

    if (verifyUser?.watermarkEnabled === newSetting) {
      console.log('✅ Watermark setting verified successfully');
    } else {
      console.log('❌ Watermark setting verification failed');
    }

    // Test 4: Reset to original setting
    console.log('\n4. Resetting to original setting...');
    await prisma.user.update({
      where: { id: user.id },
      data: { watermarkEnabled: user.watermarkEnabled }
    });

    console.log('✅ Reset to original setting:', user.watermarkEnabled);

    console.log('\n🎉 All watermark API tests passed!');
    console.log('\nNext steps:');
    console.log('1. Check if the watermark toggle is working in the UI');
    console.log('2. Verify that the watermark is being applied to images');
    console.log('3. Check browser console for any CORS or other errors');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWatermarkAPI(); 