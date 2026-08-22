import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

async function seed() {
  const isProduction = process.env.NODE_ENV === 'production';
  const client = new Client({ connectionString: DATABASE_URL, ssl: isProduction ? { rejectUnauthorized: false } : false });
  try {
    await client.connect();
    console.log('\n🌱 Seeding full database...\n');

    // ─── 1. Demo users ──────────────────────────────────────────
    const existing = await client.query("SELECT id FROM users WHERE email = 'alex.morgan@example.com'");
    let userId = null;
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash('password123', 12);

      const userRes = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, city, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['Alex', 'Morgan', 'alex.morgan@example.com', passwordHash, 'USER', 'New York', 'United States']
      );
      userId = userRes.rows[0].id;
      console.log('✅ Demo user created: alex.morgan@example.com / password123');

      await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, city, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Admin', 'User', 'admin@globetrotter.io', passwordHash, 'ADMIN', 'San Francisco', 'United States']
      );
      console.log('✅ Admin user created: admin@globetrotter.io / password123');
    } else {
      userId = existing.rows[0].id;
      console.log('ℹ️  Demo users already exist.');
    }

    // ─── 2. Cities seed data ────────────────────────────────────
    const citiesExist = await client.query('SELECT COUNT(*) FROM cities');
    if (parseInt(citiesExist.rows[0].count) === 0) {
      const cities = [
        ['Paris', 'France', 'Europe', 'The City of Light, famous for the Eiffel Tower, Louvre Museum, and world-class cuisine.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', 8.5, 9.5, 48.8566, 2.3522],
        ['Rome', 'Italy', 'Europe', 'The Eternal City with ancient ruins, Renaissance art, and incredible Italian food.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', 7.0, 9.0, 41.9028, 12.4964],
        ['Barcelona', 'Spain', 'Europe', 'A vibrant city known for Gaudi architecture, beaches, and bustling nightlife.', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600', 6.5, 8.5, 41.3874, 2.1686],
        ['London', 'United Kingdom', 'Europe', 'A global metropolis with royal palaces, world-class museums, and diverse culture.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600', 9.0, 9.5, 51.5074, -0.1278],
        ['Amsterdam', 'Netherlands', 'Europe', 'Famous for canals, cycling culture, Van Gogh Museum, and tulip gardens.', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600', 7.5, 8.0, 52.3676, 4.9041],
        ['Tokyo', 'Japan', 'Asia', 'A dazzling blend of ancient temples, cutting-edge technology, and culinary mastery.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', 8.0, 9.5, 35.6762, 139.6503],
        ['Kyoto', 'Japan', 'Asia', 'Japan\'s cultural heart with thousands of temples, gardens, and geisha districts.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600', 7.0, 8.5, 35.0116, 135.7681],
        ['New York', 'United States', 'Americas', 'The Big Apple — iconic skyline, Broadway shows, Central Park, and diverse neighborhoods.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600', 9.5, 9.5, 40.7128, -74.0060],
        ['Sydney', 'Australia', 'Oceania', 'Famous for the Opera House, Harbour Bridge, and beautiful beaches.', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600', 8.0, 9.0, -33.8688, 151.2093],
        ['Cape Town', 'South Africa', 'Africa', 'Where Table Mountain meets the ocean — stunning nature and vibrant culture.', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600', 4.5, 8.0, -33.9249, 18.4241],
      ];

      for (const [name, country, region, description, image, costIndex, popularity, lat, lon] of cities) {
        await client.query(
          `INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [name, country, region, description, image, costIndex, popularity, lat, lon]
        );
      }
      console.log(`✅ ${cities.length} cities seeded`);
    }

    // ─── 3. Activities seed data ─────────────────────────────────
    const activitiesExist = await client.query('SELECT COUNT(*) FROM activities');
    if (parseInt(activitiesExist.rows[0].count) === 0) {
      const allCities = await client.query('SELECT id, name FROM cities');
      const cityMap = {};
      allCities.rows.forEach(c => { cityMap[c.name] = c.id; });

      const activityData = [
        // Paris
        ['Eiffel Tower Summit Tour', 'Paris', 'sightseeing', '3 hours', 45, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600', 4.9],
        ['Louvre Museum Guided Tour', 'Paris', 'culture', '4 hours', 65, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600', 4.8],
        ['Seine River Dinner Cruise', 'Paris', 'food', '2.5 hours', 95, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', 4.7],
        ['Montmartre & Sacre-Coeur Walking Tour', 'Paris', 'sightseeing', '2 hours', 25, 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=600', 4.6],
        ['French Bakery & Pastry Masterclass', 'Paris', 'food', '3 hours', 80, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', 4.9],
        ['Champs-Elysees Luxury Shopping Walk', 'Paris', 'shopping', '3 hours', 0, 'https://images.unsplash.com/photo-1520939817895-060bdef4dc1a?w=600', 4.5],

        // Rome
        ['Colosseum & Roman Forum VIP Access', 'Rome', 'culture', '3.5 hours', 55, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', 4.9],
        ['Vatican Museums & Sistine Chapel', 'Rome', 'culture', '4 hours', 70, 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600', 4.8],
        ['Authentic Pasta & Tiramisu Cooking Class', 'Rome', 'food', '3 hours', 75, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600', 5.0],
        ['Trastevere Evening Food & Wine Tour', 'Rome', 'food', '3.5 hours', 60, 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600', 4.8],
        ['Trevi Fountain & Spanish Steps Night Walk', 'Rome', 'nightlife', '2 hours', 20, 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=600', 4.7],

        // Tokyo
        ['TeamLab Planets Digital Art Museum', 'Tokyo', 'culture', '2 hours', 38, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600', 4.9],
        ['Tsukiji Outer Market Food Tasting Tour', 'Tokyo', 'food', '3 hours', 55, 'https://images.unsplash.com/photo-1554502078-ef0fc409efce?w=600', 4.8],
        ['Shibuya Crossing & Harajuku Culture Tour', 'Tokyo', 'sightseeing', '3.5 hours', 30, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', 4.7],
        ['Akihabara Anime & Gaming Tour', 'Tokyo', 'shopping', '2.5 hours', 25, 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600', 4.6],
        ['Shinjuku Golden Gai Bar Hopping', 'Tokyo', 'nightlife', '3 hours', 60, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600', 4.8],

        // London
        ['Tower of London & Crown Jewels', 'London', 'culture', '3 hours', 40, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600', 4.8],
        ['Westminster Abbey & Big Ben Tour', 'London', 'sightseeing', '2.5 hours', 35, 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600', 4.7],
        ['Borough Market Artisan Food Tour', 'London', 'food', '2 hours', 45, 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600', 4.9],
        ['Thames Speedboat RIB Experience', 'London', 'adventure', '1 hour', 50, 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600', 4.8],
      ];

      for (const [name, cityName, category, duration, cost, thumbnail, rating] of activityData) {
        const cId = cityMap[cityName] || null;
        await client.query(
          `INSERT INTO activities (city_id, name, description, category, duration, cost, thumbnail, rating)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [cId, name, `Experience ${name} in ${cityName}. Highly rated experience.`, category, duration, cost, thumbnail, rating]
        );
      }
      console.log(`✅ ${activityData.length} activities seeded`);
    } else {
      console.log('ℹ️  Activities already exist.');
    }

    // ─── 4. Sample Public Community Trip ─────────────────────────
    const publicTrip = await client.query("SELECT id FROM trips WHERE is_public = true LIMIT 1");
    if (publicTrip.rows.length === 0 && userId) {
      const tripRes = await client.query(
        `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public, share_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, 'demo-community-paris-rome-2026')
         RETURNING id`,
        [
          userId,
          'Classic European Highlights: Paris & Rome',
          'A curated 10-day trip exploring the best art, architecture, and food across France and Italy.',
          '2026-09-01',
          '2026-09-10',
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
          3200,
        ]
      );
      const sampleTripId = tripRes.rows[0].id;

      // Add stops
      const parisCity = await client.query("SELECT id FROM cities WHERE name = 'Paris'");
      const romeCity = await client.query("SELECT id FROM cities WHERE name = 'Rome'");

      const stop1 = await client.query(
        `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
         VALUES ($1, $2, 'Paris', '2026-09-01', '2026-09-05', 1800, 0) RETURNING id`,
        [sampleTripId, parisCity.rows[0]?.id || null]
      );

      const stop2 = await client.query(
        `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
         VALUES ($1, $2, 'Rome', '2026-09-06', '2026-09-10', 1400, 1) RETURNING id`,
        [sampleTripId, romeCity.rows[0]?.id || null]
      );

      // Add planned activities
      await client.query(
        `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
         VALUES 
         ($1, 'Eiffel Tower Summit Tour', 45, 'sightseeing', '10:00 AM', 0),
         ($1, 'Louvre Museum Guided Tour', 65, 'culture', '02:00 PM', 1),
         ($1, 'Seine River Dinner Cruise', 95, 'food', '07:30 PM', 2),
         ($2, 'Colosseum & Roman Forum VIP Access', 55, 'culture', '09:30 AM', 0),
         ($2, 'Authentic Pasta Cooking Class', 75, 'food', '05:00 PM', 1)`,
        [stop1.rows[0].id, stop2.rows[0].id]
      );

      console.log('✅ Demo Community Shared Trip created with stops & activities');
    }

    console.log('\n🎉 Seed complete!\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
