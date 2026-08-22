import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

// Parse DB name from connection string for creation
const url = new URL(DATABASE_URL);
const dbName = url.pathname.slice(1); // remove leading /
const adminUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}/postgres`;

async function createDatabaseIfNotExists() {
  const adminClient = new Client({ connectionString: adminUrl });
  try {
    await adminClient.connect();
    const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    }
  } finally {
    await adminClient.end();
  }
}

async function runMigrations() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();

    // Users table — fields match frontend expectations exactly
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        first_name    VARCHAR(100) NOT NULL,
        last_name     VARCHAR(100) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone         VARCHAR(30) DEFAULT '',
        city          VARCHAR(100) DEFAULT '',
        country       VARCHAR(100) DEFAULT '',
        photo         TEXT DEFAULT NULL,
        additional_info TEXT DEFAULT '',
        role          VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Users table ready');

    // Index on email for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Migration complete!\n');
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('\n🔄 Running database migrations...\n');
    await createDatabaseIfNotExists();
    await runMigrations();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
