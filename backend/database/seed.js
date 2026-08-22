import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('\n🌱 Seeding database...\n');

    // Check if demo users already exist
    const existing = await client.query("SELECT id FROM users WHERE email = 'alex.morgan@example.com'");
    if (existing.rows.length > 0) {
      console.log('ℹ️  Seed data already exists, skipping.');
      return;
    }

    const passwordHash = await bcrypt.hash('password123', 12);

    // Demo traveler user (matches frontend demo login)
    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, city, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['Alex', 'Morgan', 'alex.morgan@example.com', passwordHash, 'USER', 'New York', 'United States']
    );
    console.log('✅ Demo user created: alex.morgan@example.com / password123');

    // Demo admin user (matches frontend demo login)
    await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, city, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['Admin', 'User', 'admin@globetrotter.io', passwordHash, 'ADMIN', 'San Francisco', 'United States']
    );
    console.log('✅ Admin user created: admin@globetrotter.io / password123');

    console.log('\n🎉 Seed complete!\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
