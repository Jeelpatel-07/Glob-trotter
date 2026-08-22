import { query } from '../config/database.js';

/**
 * Get dashboard data for the authenticated user
 * Frontend uses: tripsAPI.getDashboard() => GET /api/dashboard
 * Dashboard page also calls tripsAPI.getAll() separately for trip cards.
 * This endpoint returns quick stats and recent trips.
 */
export const getDashboardData = async (userId) => {
  // Get trips with stop counts
  const tripsResult = await query(
    `SELECT t.*,
       COALESCE(sc.cnt, 0) AS stop_count
     FROM trips t
     LEFT JOIN (SELECT trip_id, COUNT(*) AS cnt FROM trip_stops GROUP BY trip_id) sc ON sc.trip_id = t.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );

  const now = new Date();
  const trips = tripsResult.rows;

  const stats = {
    total: trips.length,
    upcoming: trips.filter(t => new Date(t.start_date) > now).length,
    ongoing: trips.filter(t => new Date(t.start_date) <= now && new Date(t.end_date) >= now).length,
    completed: trips.filter(t => new Date(t.end_date) < now).length,
  };

  // Format recent trips
  const recentTrips = trips.slice(0, 6).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    startDate: row.start_date,
    endDate: row.end_date,
    coverImage: row.cover_image || '',
    budget: parseFloat(row.budget) || 0,
    destinations: parseInt(row.stop_count) || 0,
    stopCount: parseInt(row.stop_count) || 0,
  }));

  // Get popular cities for recommendations
  const popularCities = await query(
    `SELECT id, name, country, region, image, cost_index, popularity
     FROM cities
     ORDER BY popularity DESC
     LIMIT 6`
  );

  return {
    stats,
    recentTrips,
    popularCities: popularCities.rows.map(c => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      image: c.image,
      costIndex: parseFloat(c.cost_index),
      popularity: parseFloat(c.popularity),
    })),
  };
};
