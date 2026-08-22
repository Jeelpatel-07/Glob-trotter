import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

async function addSampleTrips() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('\n Adding extra sample trips for alex.morgan@example.com...\n');

    // 1. Get user ID of alex.morgan@example.com
    const userRes = await client.query("SELECT id FROM users WHERE email = 'alex.morgan@example.com'");
    if (userRes.rows.length === 0) {
      console.error('❌ Error: User alex.morgan@example.com not found. Run seed script first.');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;

    // 2. Clear existing sample trips except the public community one
    // to avoid duplicating multiple ongoing/completed runs
    await client.query("DELETE FROM trips WHERE user_id = $1 AND name != 'Classic European Highlights: Paris & Rome'", [userId]);

    // 3. Define the new sample trips with stops and activities
    const now = new Date();

    // Ongoing Trip (Autumn in Tokyo & Kyoto)
    const ongoingStart = new Date(now);
    ongoingStart.setDate(now.getDate() - 3);
    const ongoingEnd = new Date(now);
    ongoingEnd.setDate(now.getDate() + 4);

    const ongoingTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        userId,
        'Autumn in Tokyo & Kyoto',
        'Exploring autumn leaves, temples, sushi markets, and technology.',
        ongoingStart.toISOString().split('T')[0],
        ongoingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
        2500.00
      ]
    );
    const ongoingTripId = ongoingTripRes.rows[0].id;

    // Upcoming Trip (Wonders of London)
    const upcomingStart = new Date(now);
    upcomingStart.setDate(now.getDate() + 30);
    const upcomingEnd = new Date(now);
    upcomingEnd.setDate(now.getDate() + 35);

    const upcomingTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        userId,
        'Wonders of London',
        'Sightseeing tour across palaces, museums, and royal parks.',
        upcomingStart.toISOString().split('T')[0],
        upcomingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600',
        1800.00
      ]
    );
    const upcomingTripId = upcomingTripRes.rows[0].id;

    // Completed Trip (Explore Barcelona)
    const completedStart = new Date(now);
    completedStart.setDate(now.getDate() - 25);
    const completedEnd = new Date(now);
    completedEnd.setDate(now.getDate() - 20);

    const completedTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        userId,
        'Summer Barcelona Escape',
        'Beach relaxation and Gaudi architecture tours in Catalonia.',
        completedStart.toISOString().split('T')[0],
        completedEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
        1500.00
      ]
    );
    const completedTripId = completedTripRes.rows[0].id;

    // Get cities to link stops
    const tokyoCity = await client.query("SELECT id FROM cities WHERE name = 'Tokyo'");
    const kyotoCity = await client.query("SELECT id FROM cities WHERE name = 'Kyoto'");
    const londonCity = await client.query("SELECT id FROM cities WHERE name = 'London'");
    const barcelonaCity = await client.query("SELECT id FROM cities WHERE name = 'Barcelona'");

    // Add Stops for Ongoing Trip (Tokyo & Kyoto)
    const ongoingStop1Res = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Tokyo', $3, $4, 1200, 0) RETURNING id`,
      [ongoingTripId, tokyoCity.rows[0]?.id || null, ongoingStart.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    );
    const ongoingStop2Res = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Kyoto', $3, $4, 800, 1) RETURNING id`,
      [ongoingTripId, kyotoCity.rows[0]?.id || null, now.toISOString().split('T')[0], ongoingEnd.toISOString().split('T')[0]]
    );

    // Add Stops for Upcoming Trip (London)
    const upcomingStopRes = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'London', $3, $4, 1500, 0) RETURNING id`,
      [upcomingTripId, londonCity.rows[0]?.id || null, upcomingStart.toISOString().split('T')[0], upcomingEnd.toISOString().split('T')[0]]
    );

    // Add Stops for Completed Trip (Barcelona)
    const completedStopRes = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Barcelona', $3, $4, 1000, 0) RETURNING id`,
      [completedTripId, barcelonaCity.rows[0]?.id || null, completedStart.toISOString().split('T')[0], completedEnd.toISOString().split('T')[0]]
    );

    // Add Activities for Ongoing Trip (Tokyo & Kyoto)
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'TeamLab Planets Digital Art Museum', 38, 'culture', '10:00 AM', 0),
       ($1, 'Tsukiji Outer Market Food Tasting Tour', 55, 'food', '01:00 PM', 1),
       ($2, 'Kyoto Kinkaku-ji (Golden Pavilion) Visit', 15, 'culture', '09:00 AM', 0)`,
      [ongoingStop1Res.rows[0].id, ongoingStop2Res.rows[0].id]
    );

    // Add Activities for Upcoming Trip (London)
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Tower of London & Crown Jewels', 40, 'culture', '11:00 AM', 0),
       ($1, 'Borough Market Food Tour', 45, 'food', '02:00 PM', 1)`,
      [upcomingStopRes.rows[0].id]
    );

    // Add Activities for Completed Trip (Barcelona)
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Sagrada Familia Basilica Tour', 35, 'culture', '10:30 AM', 0),
       ($1, 'Park Guell Walking Tour', 22, 'sightseeing', '03:00 PM', 1)`,
      [completedStopRes.rows[0].id]
    );

    console.log('✅ 3 new sample trips successfully created (Ongoing, Upcoming, Completed)!');
    console.log('🎉 Seed additions complete!\n');
  } catch (err) {
    console.error('❌ Error creating sample trips:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addSampleTrips();
