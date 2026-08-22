import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

async function addSampleTrips() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('\n Adding extra sample trips for Travelers and Admins...\n');

    // ─── 1. SEED FOR ALEX (TRAVELER) ─────────────────────────────────────────
    const travelerRes = await client.query("SELECT id FROM users WHERE email = 'alex.morgan@example.com'");
    if (travelerRes.rows.length === 0) {
      console.error('❌ Error: User alex.morgan@example.com not found. Run seed script first.');
      process.exit(1);
    }
    const travelerId = travelerRes.rows[0].id;

    // Clear existing sample trips except the public community one
    await client.query("DELETE FROM trips WHERE user_id = $1 AND name != 'Classic European Highlights: Paris & Rome'", [travelerId]);

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
        travelerId,
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
        travelerId,
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
        travelerId,
        'Summer Barcelona Escape',
        'Beach relaxation and Gaudi architecture tours in Catalonia.',
        completedStart.toISOString().split('T')[0],
        completedEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
        1500.00
      ]
    );
    const completedTripId = completedTripRes.rows[0].id;


    // ─── 2. SEED FOR ADMIN ───────────────────────────────────────────────────
    const adminRes = await client.query("SELECT id FROM users WHERE email = 'admin@globetrotter.io'");
    if (adminRes.rows.length === 0) {
      console.error('❌ Error: User admin@globetrotter.io not found. Run seed script first.');
      process.exit(1);
    }
    const adminId = adminRes.rows[0].id;

    // Clear existing trips for admin
    await client.query("DELETE FROM trips WHERE user_id = $1", [adminId]);

    // Admin Ongoing Trip (Great Rome & Paris Adventure)
    const adminOngoingTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        adminId,
        'Great Rome & Paris Adventure',
        'Exploring museums, dining, and historical sites in France and Italy.',
        ongoingStart.toISOString().split('T')[0],
        ongoingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
        4000.00
      ]
    );
    const adminOngoingTripId = adminOngoingTripRes.rows[0].id;

    // Admin Upcoming Trip (Sydney Beach Holiday)
    const adminUpcomingTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        adminId,
        'Sydney Beach Holiday',
        'Surfing, coastal walks, and beachside dining in New South Wales.',
        upcomingStart.toISOString().split('T')[0],
        upcomingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600',
        3000.00
      ]
    );
    const adminUpcomingTripId = adminUpcomingTripRes.rows[0].id;

    // Admin Completed Trip (New York Spring Tour)
    const adminCompletedTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        adminId,
        'New York Spring Tour',
        'Walking tour across Central Park, Broadway, and Empire State Building.',
        completedStart.toISOString().split('T')[0],
        completedEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600',
        2200.00
      ]
    );
    const adminCompletedTripId = adminCompletedTripRes.rows[0].id;


    // ─── 3. SEED STOPS AND LINKS ─────────────────────────────────────────────
    const tokyoCity = await client.query("SELECT id FROM cities WHERE name = 'Tokyo'");
    const kyotoCity = await client.query("SELECT id FROM cities WHERE name = 'Kyoto'");
    const londonCity = await client.query("SELECT id FROM cities WHERE name = 'London'");
    const barcelonaCity = await client.query("SELECT id FROM cities WHERE name = 'Barcelona'");
    const parisCity = await client.query("SELECT id FROM cities WHERE name = 'Paris'");
    const romeCity = await client.query("SELECT id FROM cities WHERE name = 'Rome'");
    const sydneyCity = await client.query("SELECT id FROM cities WHERE name = 'Sydney'");
    const newYorkCity = await client.query("SELECT id FROM cities WHERE name = 'New York'");

    // Traveler Stops
    const travelerStop1 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Tokyo', $3, $4, 1200, 0) RETURNING id`,
      [ongoingTripId, tokyoCity.rows[0]?.id || null, ongoingStart.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    );
    const travelerStop2 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Kyoto', $3, $4, 800, 1) RETURNING id`,
      [ongoingTripId, kyotoCity.rows[0]?.id || null, now.toISOString().split('T')[0], ongoingEnd.toISOString().split('T')[0]]
    );
    const travelerUpcomingStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'London', $3, $4, 1500, 0) RETURNING id`,
      [upcomingTripId, londonCity.rows[0]?.id || null, upcomingStart.toISOString().split('T')[0], upcomingEnd.toISOString().split('T')[0]]
    );
    const travelerCompletedStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Barcelona', $3, $4, 1000, 0) RETURNING id`,
      [completedTripId, barcelonaCity.rows[0]?.id || null, completedStart.toISOString().split('T')[0], completedEnd.toISOString().split('T')[0]]
    );

    // Admin Stops
    const adminStop1 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Paris', $3, $4, 2000, 0) RETURNING id`,
      [adminOngoingTripId, parisCity.rows[0]?.id || null, ongoingStart.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    );
    const adminStop2 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Rome', $3, $4, 1500, 1) RETURNING id`,
      [adminOngoingTripId, romeCity.rows[0]?.id || null, now.toISOString().split('T')[0], ongoingEnd.toISOString().split('T')[0]]
    );
    const adminUpcomingStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Sydney', $3, $4, 2500, 0) RETURNING id`,
      [adminUpcomingTripId, sydneyCity.rows[0]?.id || null, upcomingStart.toISOString().split('T')[0], upcomingEnd.toISOString().split('T')[0]]
    );
    const adminCompletedStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'New York', $3, $4, 1800, 0) RETURNING id`,
      [adminCompletedTripId, newYorkCity.rows[0]?.id || null, completedStart.toISOString().split('T')[0], completedEnd.toISOString().split('T')[0]]
    );


    // ─── 4. SEED ACTIVITIES ──────────────────────────────────────────────────
    // Traveler Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'TeamLab Planets Digital Art Museum', 38, 'culture', '10:00 AM', 0),
       ($1, 'Tsukiji Outer Market Food Tasting Tour', 55, 'food', '01:00 PM', 1),
       ($2, 'Kyoto Kinkaku-ji (Golden Pavilion) Visit', 15, 'culture', '09:00 AM', 0)`,
      [travelerStop1.rows[0].id, travelerStop2.rows[0].id]
    );
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Tower of London & Crown Jewels', 40, 'culture', '11:00 AM', 0),
       ($1, 'Borough Market Food Tour', 45, 'food', '02:00 PM', 1)`,
      [travelerUpcomingStop.rows[0].id]
    );
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Sagrada Familia Basilica Tour', 35, 'culture', '10:30 AM', 0),
       ($1, 'Park Guell Walking Tour', 22, 'sightseeing', '03:00 PM', 1)`,
      [travelerCompletedStop.rows[0].id]
    );

    // Admin Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Eiffel Tower Summit Tour', 45, 'sightseeing', '10:00 AM', 0),
       ($1, 'Louvre Museum Guided Tour', 65, 'culture', '02:00 PM', 1),
       ($2, 'Colosseum & Roman Forum VIP Access', 55, 'culture', '09:30 AM', 0)`,
      [adminStop1.rows[0].id, adminStop2.rows[0].id]
    );
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Sydney Opera House Tour', 32, 'culture', '11:00 AM', 0),
       ($1, 'Bondi Beach Surf Lesson', 65, 'adventure', '02:00 PM', 1)`,
      [adminUpcomingStop.rows[0].id]
    );
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Empire State Building Observatory', 48, 'sightseeing', '10:30 AM', 0),
       ($1, 'Central Park Bike Rental & Tour', 25, 'adventure', '01:00 PM', 1)`,
      [adminCompletedStop.rows[0].id]
    );

    console.log('✅ 3 sample trips successfully seeded for both Traveler and Admin accounts!');
    console.log('🎉 Seed additions complete!\n');
  } catch (err) {
    console.error('❌ Error creating sample trips:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addSampleTrips();
