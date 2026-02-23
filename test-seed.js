// Test seed with test database
const { execSync } = require('child_process');
const fs = require('fs');

// Read .env.test to get DATABASE_URL
const envContent = fs.readFileSync('.env.test', 'utf8');

// Supports:
// DATABASE_URL="..."
// DATABASE_URL='...'
// DATABASE_URL=...
const dbUrlMatch = envContent.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/m);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

if (!dbUrl) {
  console.error('❌ Could not find DATABASE_URL in .env.test');
  process.exit(1);
}

// Safety check: prevent seeding non-test DB by mistake
if (!dbUrl.includes('test')) {
  console.error('🚨 Refusing to run seed: DATABASE_URL does not appear to be a test database');
  process.exit(1);
}

console.log('✅ Using test DATABASE_URL');

// Set environment variable and run seed
process.env.DATABASE_URL = dbUrl;

try {
  execSync('npx tsx scripts/seed-e2e.ts', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log('✅ Seed completed successfully');
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
}
