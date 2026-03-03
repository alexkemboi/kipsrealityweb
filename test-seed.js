// Test seed with test database
const { execSync } = require('child_process');
const fs = require('fs');

// Read .env.test to get DATABASE_URL
const envContent = fs.readFileSync('.env.test', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="(.+)"/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

if (!dbUrl) {
  console.error('Could not find DATABASE_URL in .env.test');
  process.exit(1);
}

console.log('Using DATABASE_URL:', dbUrl);

// Set environment variable and run seed
process.env.DATABASE_URL = dbUrl;

try {
  execSync('npx tsx scripts/seed-e2e.ts', { stdio: 'inherit' });
  console.log('✅ Seed completed successfully');
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}