import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testR2AnalyticsSimple() {
  try {
    console.log('🧪 Testing R2 Analytics Database Queries...\n');

    // Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test basic queries
    console.log('2. Testing basic database queries...');
    
    try {
      const totalImages = await prisma.generatedImage.count();
      console.log(`✅ Total Images: ${totalImages}`);
    } catch (error) {
      console.log('❌ Total Images Error:', error);
    }

    try {
      const r2Images = await prisma.generatedImage.count({ 
        where: { r2Key: { not: null } } 
      });
      console.log(`✅ R2 Images: ${r2Images}`);
    } catch (error) {
      console.log('❌ R2 Images Error:', error);
    }

    try {
      const totalUsers = await prisma.user.count();
      console.log(`✅ Total Users: ${totalUsers}`);
    } catch (error) {
      console.log('❌ Total Users Error:', error);
    }

    try {
      const accessLogs = await prisma.imageAccessLog.count();
      console.log(`✅ Access Logs: ${accessLogs}`);
    } catch (error) {
      console.log('❌ Access Logs Error:', error);
    }

    try {
      const performanceLogs = await prisma.r2PerformanceLog.count();
      console.log(`✅ Performance Logs: ${performanceLogs}`);
    } catch (error) {
      console.log('❌ Performance Logs Error:', error);
    }

    try {
      const alerts = await prisma.r2Alert.count();
      console.log(`✅ R2 Alerts: ${alerts}`);
    } catch (error) {
      console.log('❌ R2 Alerts Error:', error);
    }

    console.log('\n3. Testing admin user...');
    try {
      const adminUser = await prisma.user.findFirst({
        where: { 
          email: 'lucid8080@gmail.com',
          role: 'ADMIN'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });
      
      if (adminUser) {
        console.log('✅ Admin user found:', {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        });
      } else {
        console.log('❌ Admin user not found');
      }
    } catch (error) {
      console.log('❌ Admin user query error:', error);
    }

    console.log('\n4. Testing R2 connection...');
    try {
      // Test if we can access environment variables
      const env = process.env;
      console.log('✅ Environment variables accessible');
      console.log(`   - R2_ACCESS_KEY_ID: ${env.R2_ACCESS_KEY_ID ? 'Set' : 'Not set'}`);
      console.log(`   - R2_SECRET_ACCESS_KEY: ${env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Not set'}`);
      console.log(`   - R2_BUCKET_NAME: ${env.R2_BUCKET_NAME || 'Not set'}`);
      console.log(`   - R2_ENDPOINT: ${env.R2_ENDPOINT || 'Not set'}`);
    } catch (error) {
      console.log('❌ Environment variables error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testR2AnalyticsSimple(); 