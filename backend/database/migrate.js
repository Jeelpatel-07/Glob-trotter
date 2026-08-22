import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

async function runMigrations() {
  const isProduction = process.env.NODE_ENV === 'production';
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });
  try {
    await client.connect();

    // ─── 1. Users table ──────────────────────────────────────────
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
        language      VARCHAR(50) DEFAULT 'English',
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    // Ensure language column exists for existing tables
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English';
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    console.log('✅ Users table ready');

    // ─── 2. Cities table ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        country     VARCHAR(200) NOT NULL,
        region      VARCHAR(100) NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        image       TEXT DEFAULT NULL,
        cost_index  NUMERIC(3,1) DEFAULT 5.0,
        popularity  NUMERIC(3,1) DEFAULT 5.0,
        latitude    NUMERIC(10,6) DEFAULT NULL,
        longitude   NUMERIC(10,6) DEFAULT NULL,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);`);
    console.log('✅ Cities table ready');

    // ─── 3. Trips table ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name        VARCHAR(300) NOT NULL,
        description TEXT DEFAULT '',
        start_date  DATE NOT NULL,
        end_date    DATE NOT NULL,
        cover_image TEXT DEFAULT NULL,
        budget      NUMERIC(12,2) DEFAULT 0,
        is_public   BOOLEAN DEFAULT false,
        share_token VARCHAR(64) DEFAULT NULL UNIQUE,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips(share_token);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);`);
    console.log('✅ Trips table ready');

    // ─── 4. Trip Stops table ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS trip_stops (
        id          SERIAL PRIMARY KEY,
        trip_id     INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        city_id     INTEGER REFERENCES cities(id) ON DELETE SET NULL,
        city_name   VARCHAR(200) DEFAULT '',
        start_date  DATE DEFAULT NULL,
        end_date    DATE DEFAULT NULL,
        budget      NUMERIC(12,2) DEFAULT 0,
        notes       TEXT DEFAULT '',
        stop_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_trip_stops_city_id ON trip_stops(city_id);`);
    console.log('✅ Trip Stops table ready');

    // ─── 5. Activities table ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id          SERIAL PRIMARY KEY,
        city_id     INTEGER REFERENCES cities(id) ON DELETE CASCADE,
        name        VARCHAR(300) NOT NULL,
        description TEXT DEFAULT '',
        category    VARCHAR(50) NOT NULL DEFAULT 'sightseeing',
        duration    VARCHAR(50) DEFAULT '2 hours',
        cost        NUMERIC(10,2) DEFAULT 0,
        thumbnail   TEXT DEFAULT NULL,
        rating      NUMERIC(3,1) DEFAULT 4.5,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_city_id ON activities(city_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activities_rating ON activities(rating);`);
    console.log('✅ Activities table ready');

    // ─── 6. Trip Activities table ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS trip_activities (
        id            SERIAL PRIMARY KEY,
        trip_stop_id  INTEGER NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
        activity_id   INTEGER REFERENCES activities(id) ON DELETE SET NULL,
        name          VARCHAR(300) NOT NULL,
        cost          NUMERIC(10,2) DEFAULT 0,
        category      VARCHAR(50) DEFAULT 'sightseeing',
        activity_time VARCHAR(50) DEFAULT '10:00 AM',
        notes         TEXT DEFAULT '',
        activity_order INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_id ON trip_activities(trip_stop_id);`);
    console.log('✅ Trip Activities table ready');

    // ─── 7. Expenses table ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id            SERIAL PRIMARY KEY,
        trip_id       INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        trip_stop_id  INTEGER REFERENCES trip_stops(id) ON DELETE SET NULL,
        category      VARCHAR(50) NOT NULL DEFAULT 'OTHER',
        amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
        expense_date  DATE DEFAULT CURRENT_DATE,
        description   TEXT DEFAULT '',
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);`);
    console.log('✅ Expenses table ready');

    // ─── 8. Saved Destinations table ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_destinations (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        city_id     INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, city_id)
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_saved_destinations_user ON saved_destinations(user_id);`);
    console.log('✅ Saved Destinations table ready');

    console.log('\n🎉 Full database migration complete!\n');
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('\n🔄 Running full database migrations...\n');
    await runMigrations();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
