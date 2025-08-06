const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Setting up database schema...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Try to run migrations first
  try {
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Database migrations completed successfully!');
  } catch (migrationError) {
    console.log('⚠️  Migration failed, trying db push...');
    
    // If migrations fail, try db push
    try {
      console.log('📤 Pushing database schema...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Database schema pushed successfully!');
    } catch (pushError) {
      console.error('❌ Database setup failed:', pushError.message);
      process.exit(1);
    }
  }
  
  console.log('🎉 Database setup completed!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
} 