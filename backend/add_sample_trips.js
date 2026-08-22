import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globetrotter';

async function addSampleTrips() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('\n Adding extra sample trips (including India trips) for Travelers and Admins...\n');

    // ─── 1. RETRIEVE USER IDS ────────────────────────────────────────────────
    const travelerRes = await client.query("SELECT id FROM users WHERE email = 'alex.morgan@example.com'");
    if (travelerRes.rows.length === 0) {
      console.error('❌ Error: User alex.morgan@example.com not found. Run seed script first.');
      process.exit(1);
    }
    const travelerId = travelerRes.rows[0].id;

    const adminRes = await client.query("SELECT id FROM users WHERE email = 'admin@globetrotter.io'");
    if (adminRes.rows.length === 0) {
      console.error('❌ Error: User admin@globetrotter.io not found. Run seed script first.');
      process.exit(1);
    }
    const adminId = adminRes.rows[0].id;

    // Clear existing trips for both to avoid duplicates
    await client.query("DELETE FROM trips WHERE user_id IN ($1, $2)", [travelerId, adminId]);

    const now = new Date();

    // ─── 2. SEED FOR TRAVELER (ALEX) ─────────────────────────────────────────
    // Traveler Ongoing Trip (Autumn in Tokyo & Kyoto)
    const travelerOngoingStart = new Date(now);
    travelerOngoingStart.setDate(now.getDate() - 3);
    const travelerOngoingEnd = new Date(now);
    travelerOngoingEnd.setDate(now.getDate() + 4);

    const travelerOngoingRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        travelerId,
        'Autumn in Tokyo & Kyoto',
        'Exploring autumn leaves, temples, sushi markets, and technology in Japan.',
        travelerOngoingStart.toISOString().split('T')[0],
        travelerOngoingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
        2500.00
      ]
    );
    const travelerOngoingId = travelerOngoingRes.rows[0].id;

    // Traveler Upcoming Trip (Incredible India: Golden Triangle)
    const travelerUpcomingStart = new Date(now);
    travelerUpcomingStart.setDate(now.getDate() + 45);
    const travelerUpcomingEnd = new Date(now);
    travelerUpcomingEnd.setDate(now.getDate() + 52);

    const travelerUpcomingRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        travelerId,
        'Incredible India: Golden Triangle',
        'Exploring royal palaces, ancient forts, Mughlai cuisine, and the historic Taj Mahal.',
        travelerUpcomingStart.toISOString().split('T')[0],
        travelerUpcomingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600',
        1800.00
      ]
    );
    const travelerUpcomingId = travelerUpcomingRes.rows[0].id;

    // Traveler Completed Trip (Explore Barcelona)
    const travelerCompletedStart = new Date(now);
    travelerCompletedStart.setDate(now.getDate() - 25);
    const travelerCompletedEnd = new Date(now);
    travelerCompletedEnd.setDate(now.getDate() - 20);

    const travelerCompletedRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        travelerId,
        'Summer Barcelona Escape',
        'Beach relaxation and Gaudi architecture tours in Catalonia.',
        travelerCompletedStart.toISOString().split('T')[0],
        travelerCompletedEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
        1500.00
      ]
    );
    const travelerCompletedId = travelerCompletedRes.rows[0].id;


    // ─── 3. SEED FOR ADMIN ───────────────────────────────────────────────────
    // Admin Ongoing Trip (Great Rome & Paris Adventure)
    const adminOngoingRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        adminId,
        'Great Rome & Paris Adventure',
        'Exploring museums, dining, and historical sites in France and Italy.',
        travelerOngoingStart.toISOString().split('T')[0],
        travelerOngoingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
        4000.00
      ]
    );
    const adminOngoingId = adminOngoingRes.rows[0].id;

    // Admin Upcoming Trip (India Beach & Culture Escape)
    const adminUpcomingStart = new Date(now);
    adminUpcomingStart.setDate(now.getDate() + 60);
    const adminUpcomingEnd = new Date(now);
    adminUpcomingEnd.setDate(now.getDate() + 67);

    const adminUpcomingRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        adminId,
        'India Beach & Culture Escape',
        'Touring the bustling markets of Mumbai and relaxing on the sunny beaches of Goa.',
        adminUpcomingStart.toISOString().split('T')[0],
        adminUpcomingEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1512411961611-37f2257e8d1b?w=600',
        2200.00
      ]
    );
    const adminUpcomingId = adminUpcomingRes.rows[0].id;

    // Admin Completed Trip (New York Spring Tour)
    const adminCompletedRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false) RETURNING id`,
      [
        adminId,
        'New York Spring Tour',
        'Walking tour across Central Park, Broadway, and Empire State Building.',
        travelerCompletedStart.toISOString().split('T')[0],
        travelerCompletedEnd.toISOString().split('T')[0],
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600',
        2200.00
      ]
    );
    const adminCompletedId = adminCompletedRes.rows[0].id;


    // ─── 4. SEED STOPS AND LINKS ─────────────────────────────────────────────
    const tokyoCity = await client.query("SELECT id FROM cities WHERE name = 'Tokyo'");
    const kyotoCity = await client.query("SELECT id FROM cities WHERE name = 'Kyoto'");
    const londonCity = await client.query("SELECT id FROM cities WHERE name = 'London'");
    const barcelonaCity = await client.query("SELECT id FROM cities WHERE name = 'Barcelona'");
    const parisCity = await client.query("SELECT id FROM cities WHERE name = 'Paris'");
    const romeCity = await client.query("SELECT id FROM cities WHERE name = 'Rome'");
    const sydneyCity = await client.query("SELECT id FROM cities WHERE name = 'Sydney'");
    const newYorkCity = await client.query("SELECT id FROM cities WHERE name = 'New York'");
    const mumbaiCity = await client.query("SELECT id FROM cities WHERE name = 'Mumbai'");
    const delhiCity = await client.query("SELECT id FROM cities WHERE name = 'Delhi'");
    const jaipurCity = await client.query("SELECT id FROM cities WHERE name = 'Jaipur'");
    const agraCity = await client.query("SELECT id FROM cities WHERE name = 'Agra'");
    const goaCity = await client.query("SELECT id FROM cities WHERE name = 'Goa'");

    // Traveler Stops (Tokyo & Kyoto)
    const travelerStop1 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Tokyo', $3, $4, 1200, 0) RETURNING id`,
      [travelerOngoingId, tokyoCity.rows[0]?.id || null, travelerOngoingStart.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    );
    const travelerStop2 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Kyoto', $3, $4, 800, 1) RETURNING id`,
      [travelerOngoingId, kyotoCity.rows[0]?.id || null, now.toISOString().split('T')[0], travelerOngoingEnd.toISOString().split('T')[0]]
    );

    // Traveler Stops (India: Delhi, Agra, Jaipur)
    const delhiStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Delhi', $3, $4, 600, 0) RETURNING id`,
      [travelerUpcomingId, delhiCity.rows[0]?.id || null, travelerUpcomingStart.toISOString().split('T')[0], new Date(travelerUpcomingStart.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
    );
    const agraStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Agra', $3, $4, 500, 1) RETURNING id`,
      [travelerUpcomingId, agraCity.rows[0]?.id || null, new Date(travelerUpcomingStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], new Date(travelerUpcomingStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
    );
    const jaipurStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Jaipur', $3, $4, 700, 2) RETURNING id`,
      [travelerUpcomingId, jaipurCity.rows[0]?.id || null, new Date(travelerUpcomingStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], travelerUpcomingEnd.toISOString().split('T')[0]]
    );

    // Traveler Stops (Barcelona)
    const travelerCompletedStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Barcelona', $3, $4, 1000, 0) RETURNING id`,
      [travelerCompletedId, barcelonaCity.rows[0]?.id || null, travelerCompletedStart.toISOString().split('T')[0], travelerCompletedEnd.toISOString().split('T')[0]]
    );

    // Admin Stops (Paris & Rome)
    const adminStop1 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Paris', $3, $4, 2000, 0) RETURNING id`,
      [adminOngoingId, parisCity.rows[0]?.id || null, travelerOngoingStart.toISOString().split('T')[0], now.toISOString().split('T')[0]]
    );
    const adminStop2 = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Rome', $3, $4, 1500, 1) RETURNING id`,
      [adminOngoingId, romeCity.rows[0]?.id || null, now.toISOString().split('T')[0], travelerOngoingEnd.toISOString().split('T')[0]]
    );

    // Admin Stops (India: Mumbai & Goa)
    const adminMumbaiStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Mumbai', $3, $4, 1000, 0) RETURNING id`,
      [adminUpcomingId, mumbaiCity.rows[0]?.id || null, adminUpcomingStart.toISOString().split('T')[0], new Date(adminUpcomingStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
    );
    const adminGoaStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'Goa', $3, $4, 1200, 1) RETURNING id`,
      [adminUpcomingId, goaCity.rows[0]?.id || null, new Date(adminUpcomingStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], adminUpcomingEnd.toISOString().split('T')[0]]
    );

    // Admin Stops (New York)
    const adminCompletedStop = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, stop_order)
       VALUES ($1, $2, 'New York', $3, $4, 1800, 0) RETURNING id`,
      [adminCompletedId, newYorkCity.rows[0]?.id || null, travelerCompletedStart.toISOString().split('T')[0], travelerCompletedEnd.toISOString().split('T')[0]]
    );


    // ─── 5. SEED ACTIVITIES ──────────────────────────────────────────────────
    // Traveler Ongoing (Tokyo & Kyoto) Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'TeamLab Planets Digital Art Museum', 38, 'culture', '10:00 AM', 0),
       ($1, 'Tsukiji Outer Market Food Tasting Tour', 55, 'food', '01:00 PM', 1),
       ($2, 'Kyoto Kinkaku-ji (Golden Pavilion) Visit', 15, 'culture', '09:00 AM', 0)`,
      [travelerStop1.rows[0].id, travelerStop2.rows[0].id]
    );

    // Traveler Upcoming (India: Delhi, Agra, Jaipur) Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Old Delhi Rickshaw Ride & Spice Market', 15, 'culture', '10:00 AM', 0),
       ($2, 'Taj Mahal Sunrise Guided Tour', 30, 'sightseeing', '06:00 AM', 0),
       ($3, 'Amer Fort & Royal Hawa Mahal Private Tour', 25, 'culture', '11:00 AM', 0)`,
      [delhiStop.rows[0].id, agraStop.rows[0].id, jaipurStop.rows[0].id]
    );

    // Traveler Completed (Barcelona) Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Sagrada Familia Basilica Tour', 35, 'culture', '10:30 AM', 0),
       ($1, 'Park Guell Walking Tour', 22, 'sightseeing', '03:00 PM', 1)`,
      [travelerCompletedStop.rows[0].id]
    );

    // Admin Ongoing (Paris & Rome) Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Eiffel Tower Summit Tour', 45, 'sightseeing', '10:00 AM', 0),
       ($1, 'Louvre Museum Guided Tour', 65, 'culture', '02:00 PM', 1),
       ($2, 'Colosseum & Roman Forum VIP Access', 55, 'culture', '09:30 AM', 0)`,
      [adminStop1.rows[0].id, adminStop2.rows[0].id]
    );

    // Admin Upcoming (India: Mumbai & Goa) Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Gateway of India & Taj Palace Walk', 0, 'sightseeing', '10:00 AM', 0),
       ($1, 'Mumbai Street Food Tasting Tour', 20, 'food', '05:00 PM', 1),
       ($2, 'Grande Island Scuba Diving & Watersports', 50, 'adventure', '09:00 AM', 0),
       ($2, 'Old Goa Churches & Spice Plantation Lunch', 22, 'food', '01:00 PM', 1)`,
      [adminMumbaiStop.rows[0].id, adminGoaStop.rows[0].id]
    );

    // Admin Completed (New York) Activities
    await client.query(
      `INSERT INTO trip_activities (trip_stop_id, name, cost, category, activity_time, activity_order)
       VALUES
       ($1, 'Empire State Building Observatory', 48, 'sightseeing', '10:30 AM', 0),
       ($1, 'Central Park Bike Rental & Tour', 25, 'adventure', '01:00 PM', 1)`,
      [adminCompletedStop.rows[0].id]
    );

    console.log('✅ Updated Traveler and Admin trips seeded successfully, including brand new India Trips!');
    console.log('🎉 Seed additions complete!\n');
  } catch (err) {
    console.error('❌ Error creating sample trips:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addSampleTrips();
