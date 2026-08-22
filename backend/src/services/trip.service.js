import { query, getClient } from '../config/database.js';
import { ApiError } from '../utils/response.js';
import crypto from 'crypto';

const formatTrip = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  startDate: row.start_date,
  endDate: row.end_date,
  coverImage: row.cover_image || '',
  budget: parseFloat(row.budget) || 0,
  isPublic: row.is_public || false,
  shareToken: row.share_token || null,
  destinations: parseInt(row.stop_count) || 0,
  stopCount: parseInt(row.stop_count) || 0,
  userName: row.user_name || (row.first_name ? `${row.first_name} ${row.last_name}` : ''),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Create a new trip
 */
export const createTrip = async (userId, data) => {
  const { name, description, startDate, endDate, coverImage, budget } = data;

  const result = await query(
    `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *,
       0 AS stop_count`,
    [userId, name, description || '', startDate, endDate, coverImage || '', budget || 0]
  );

  return formatTrip(result.rows[0]);
};

/**
 * Get all trips (or filter by public=true for Community page)
 */
export const getUserTrips = async (userId, options = {}) => {
  if (options.public) {
    let where = 'WHERE t.is_public = true';
    const values = [];
    if (options.search) {
      where += ' AND (LOWER(t.name) LIKE $1 OR LOWER(t.description) LIKE $1)';
      values.push(`%${options.search.toLowerCase()}%`);
    }
    const result = await query(
      `SELECT t.*,
         COALESCE(sc.cnt, 0) AS stop_count,
         u.first_name, u.last_name
       FROM trips t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN (SELECT trip_id, COUNT(*) AS cnt FROM trip_stops GROUP BY trip_id) sc ON sc.trip_id = t.id
       ${where}
       ORDER BY t.created_at DESC`,
      values
    );
    return result.rows.map(formatTrip);
  }

  const result = await query(
    `SELECT t.*,
       COALESCE(sc.cnt, 0) AS stop_count
     FROM trips t
     LEFT JOIN (SELECT trip_id, COUNT(*) AS cnt FROM trip_stops GROUP BY trip_id) sc ON sc.trip_id = t.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );

  return result.rows.map(formatTrip);
};

/**
 * Get a single trip by ID
 */
export const getTripById = async (tripId, userId) => {
  const result = await query(
    `SELECT t.*,
       COALESCE(sc.cnt, 0) AS stop_count
     FROM trips t
     LEFT JOIN (SELECT trip_id, COUNT(*) AS cnt FROM trip_stops GROUP BY trip_id) sc ON sc.trip_id = t.id
     WHERE t.id = $1`,
    [tripId]
  );

  if (result.rows.length === 0) {
    throw new ApiError('Trip not found', 404);
  }

  const trip = result.rows[0];

  if (trip.user_id !== userId && !trip.is_public) {
    throw new ApiError('Not authorized to access this trip', 403);
  }

  return formatTrip(trip);
};

/**
 * Update a trip
 */
export const updateTrip = async (tripId, userId, data) => {
  const existing = await query('SELECT user_id FROM trips WHERE id = $1', [tripId]);
  if (existing.rows.length === 0) {
    throw new ApiError('Trip not found', 404);
  }
  if (existing.rows[0].user_id !== userId) {
    throw new ApiError('Not authorized to update this trip', 403);
  }

  const fields = [];
  const values = [];
  let paramIndex = 1;

  const fieldMap = {
    name: 'name',
    description: 'description',
    startDate: 'start_date',
    endDate: 'end_date',
    coverImage: 'cover_image',
    budget: 'budget',
    isPublic: 'is_public',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = $${paramIndex}`);
      values.push(data[key]);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    throw new ApiError('No fields to update', 400);
  }

  fields.push(`updated_at = NOW()`);
  values.push(tripId);

  const result = await query(
    `UPDATE trips SET ${fields.join(', ')} WHERE id = $${paramIndex}
     RETURNING *,
       (SELECT COUNT(*) FROM trip_stops WHERE trip_id = trips.id) AS stop_count`,
    values
  );

  return formatTrip(result.rows[0]);
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId, userId) => {
  const existing = await query('SELECT user_id FROM trips WHERE id = $1', [tripId]);
  if (existing.rows.length === 0) {
    throw new ApiError('Trip not found', 404);
  }
  if (existing.rows[0].user_id !== userId) {
    throw new ApiError('Not authorized to delete this trip', 403);
  }

  await query('DELETE FROM trips WHERE id = $1', [tripId]);
  return true;
};

/**
 * Get trip itinerary (Trip + Stops + Activities mapped into days)
 */
export const getTripItinerary = async (tripId, userId) => {
  const tripResult = await query(
    `SELECT t.*,
       COALESCE(sc.cnt, 0) AS stop_count
     FROM trips t
     LEFT JOIN (SELECT trip_id, COUNT(*) AS cnt FROM trip_stops GROUP BY trip_id) sc ON sc.trip_id = t.id
     WHERE t.id = $1`,
    [tripId]
  );

  if (tripResult.rows.length === 0) {
    throw new ApiError('Trip not found', 404);
  }

  const trip = tripResult.rows[0];
  if (trip.user_id !== userId && !trip.is_public) {
    throw new ApiError('Not authorized', 403);
  }

  const stopsResult = await query(
    `SELECT ts.*,
       c.name AS city_name_lookup, c.country AS city_country, c.image AS city_image,
       c.cost_index AS city_cost_index, c.latitude, c.longitude
     FROM trip_stops ts
     LEFT JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = $1
     ORDER BY ts.stop_order ASC`,
    [tripId]
  );

  const stopIds = stopsResult.rows.map(s => s.id);
  let activitiesByStop = {};

  if (stopIds.length > 0) {
    const activitiesResult = await query(
      `SELECT * FROM trip_activities 
       WHERE trip_stop_id = ANY($1) 
       ORDER BY activity_order ASC, id ASC`,
      [stopIds]
    );
    activitiesResult.rows.forEach(a => {
      if (!activitiesByStop[a.trip_stop_id]) activitiesByStop[a.trip_stop_id] = [];
      activitiesByStop[a.trip_stop_id].push({
        id: a.id,
        name: a.name,
        cost: parseFloat(a.cost) || 0,
        category: a.category || 'sightseeing',
        time: a.activity_time || '10:00 AM',
        order: a.activity_order,
      });
    });
  }

  const days = [];
  let dayNumber = 1;

  for (const stop of stopsResult.rows) {
    const startDate = stop.start_date ? new Date(stop.start_date) : null;
    const endDate = stop.end_date ? new Date(stop.end_date) : null;
    const cityName = stop.city_name || stop.city_name_lookup || 'Unknown';
    const stopActivities = activitiesByStop[stop.id] || [];

    if (startDate && endDate) {
      const diffDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
      for (let d = 0; d < diffDays; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d);
        // Distribute activities across days or attach all on day 1
        const dayActs = d === 0 ? stopActivities : [];
        const dayTotal = dayActs.reduce((acc, curr) => acc + curr.cost, 0);

        days.push({
          dayNumber: dayNumber++,
          date: date.toISOString().split('T')[0],
          city: cityName,
          stopId: stop.id,
          activities: dayActs,
          totalCost: dayTotal,
        });
      }
    } else {
      const dayTotal = stopActivities.reduce((acc, curr) => acc + curr.cost, 0);
      days.push({
        dayNumber: dayNumber++,
        date: startDate ? startDate.toISOString().split('T')[0] : null,
        city: cityName,
        stopId: stop.id,
        activities: stopActivities,
        totalCost: dayTotal,
      });
    }
  }

  return {
    trip: formatTrip(trip),
    days,
    stops: stopsResult.rows.map(s => ({
      id: s.id,
      cityId: s.city_id,
      cityName: s.city_name || s.city_name_lookup || '',
      startDate: s.start_date,
      endDate: s.end_date,
      budget: parseFloat(s.budget) || 0,
      order: s.stop_order,
      notes: s.notes || '',
      activities: activitiesByStop[s.id] || [],
      city: s.city_id ? {
        id: s.city_id,
        name: s.city_name_lookup,
        country: s.city_country,
        image: s.city_image,
      } : null,
    })),
  };
};

/**
 * Budget and Cost Engine for Itinerary View & Charts
 */
export const getTripBudget = async (tripId, userId) => {
  const itinerary = await getTripItinerary(tripId, userId);
  const totalBudget = parseFloat(itinerary.trip?.budget) || 0;

  // Calculate costs from stop budgets and activities
  let stopBudgets = 0;
  let activityCosts = 0;
  const categoryMap = {
    'Activities': 0,
    'Sightseeing': 0,
    'Culture': 0,
    'Food & Dining': 0,
    'Accommodation / Stay': 0,
    'Transportation': 0,
  };

  itinerary.stops.forEach(stop => {
    const stopB = parseFloat(stop.budget) || 0;
    stopBudgets += stopB;
    categoryMap['Accommodation / Stay'] += stopB;

    (stop.activities || []).forEach(act => {
      const c = parseFloat(act.cost) || 0;
      activityCosts += c;
      const cat = act.category?.toLowerCase() || '';
      if (cat === 'food') categoryMap['Food & Dining'] += c;
      else if (cat === 'culture') categoryMap['Culture'] += c;
      else if (cat === 'sightseeing') categoryMap['Sightseeing'] += c;
      else categoryMap['Activities'] += c;
    });
  });

  const totalSpent = stopBudgets + activityCosts;
  const isOverBudget = totalBudget > 0 && totalSpent > totalBudget;

  const categoryBreakdown = Object.entries(categoryMap)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount }));

  if (categoryBreakdown.length === 0) {
    categoryBreakdown.push({ category: 'Planned Budget', amount: totalBudget || 0 });
  }

  const dailySpending = itinerary.days.map((day, idx) => ({
    day: `Day ${day.dayNumber || idx + 1}`,
    amount: day.totalCost || 0,
  }));

  return {
    totalBudget,
    totalSpent,
    remainingBudget: Math.max(0, totalBudget - totalSpent),
    isOverBudget,
    categoryBreakdown,
    dailySpending,
  };
};

/**
 * Calendar Events Engine
 */
export const getTripCalendar = async (tripId, userId) => {
  if (tripId && tripId !== 'all') {
    const itinerary = await getTripItinerary(parseInt(tripId), userId);
    return (itinerary.stops || []).map((s, i) => ({
      id: s.id,
      name: `${s.cityName || 'Stop'} (${itinerary.trip.name})`,
      startDate: s.startDate || itinerary.trip.startDate,
      endDate: s.endDate || itinerary.trip.endDate,
      color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'][i % 5],
    }));
  }

  // Get all user trips for calendar
  const trips = await getUserTrips(userId);
  return trips.map((t, i) => ({
    id: t.id,
    name: t.name,
    startDate: t.startDate,
    endDate: t.endDate,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'][i % 6],
  }));
};

/**
 * Public Trip Sharing — enable sharing and return share token
 */
export const enableTripSharing = async (tripId, userId) => {
  const trip = await query('SELECT user_id, share_token FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) {
    throw new ApiError('Trip not found', 404);
  }
  if (trip.rows[0].user_id !== userId) {
    throw new ApiError('Not authorized', 403);
  }

  let shareToken = trip.rows[0].share_token;
  if (!shareToken) {
    shareToken = crypto.randomBytes(16).toString('hex');
  }

  await query(
    'UPDATE trips SET is_public = true, share_token = $1, updated_at = NOW() WHERE id = $2',
    [shareToken, tripId]
  );

  return {
    shareToken,
    shareUrl: `/public/trips/${shareToken}`,
    isPublic: true,
  };
};

/**
 * Get Public Trip by Share Token (NO AUTH REQUIRED)
 */
export const getPublicTripByToken = async (shareToken) => {
  const tripResult = await query(
    `SELECT t.*, u.first_name, u.last_name
     FROM trips t
     JOIN users u ON u.id = t.user_id
     WHERE t.share_token = $1 AND t.is_public = true`,
    [shareToken]
  );

  if (tripResult.rows.length === 0) {
    throw new ApiError('Shared trip not found or link has expired', 404);
  }

  const trip = tripResult.rows[0];
  const itinerary = await getTripItinerary(trip.id, trip.user_id);

  return {
    ...itinerary.trip,
    days: itinerary.days,
    stops: itinerary.stops,
  };
};

/**
 * Copy a Public Trip into Authenticated User's Account (Transaction Safe)
 */
export const copyPublicTrip = async (shareToken, targetUserId) => {
  const tripResult = await query(
    'SELECT * FROM trips WHERE share_token = $1 AND is_public = true',
    [shareToken]
  );

  if (tripResult.rows.length === 0) {
    throw new ApiError('Shared trip not found', 404);
  }

  const sourceTrip = tripResult.rows[0];
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Copy Trip
    const newTripRes = await client.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image, budget, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING *`,
      [
        targetUserId,
        `Copy of ${sourceTrip.name}`,
        sourceTrip.description,
        sourceTrip.start_date,
        sourceTrip.end_date,
        sourceTrip.cover_image,
        sourceTrip.budget,
      ]
    );
    const newTrip = newTripRes.rows[0];

    // 2. Copy Stops
    const sourceStops = await client.query(
      'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY stop_order ASC',
      [sourceTrip.id]
    );

    for (const stop of sourceStops.rows) {
      const newStopRes = await client.query(
        `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, notes, stop_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [newTrip.id, stop.city_id, stop.city_name, stop.start_date, stop.end_date, stop.budget, stop.notes, stop.stop_order]
      );
      const newStopId = newStopRes.rows[0].id;

      // 3. Copy Activities in Stop
      const sourceActivities = await client.query(
        'SELECT * FROM trip_activities WHERE trip_stop_id = $1 ORDER BY activity_order ASC',
        [stop.id]
      );

      for (const act of sourceActivities.rows) {
        await client.query(
          `INSERT INTO trip_activities (trip_stop_id, activity_id, name, cost, category, activity_time, notes, activity_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [newStopId, act.activity_id, act.name, act.cost, act.category, act.activity_time, act.notes, act.activity_order]
        );
      }
    }

    await client.query('COMMIT');
    return formatTrip(newTrip);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─── SAVED DESTINATIONS ──────────────────────────────────────────────────────

export const saveDestination = async (userId, cityId) => {
  await query(
    `INSERT INTO saved_destinations (user_id, city_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, city_id) DO NOTHING`,
    [userId, cityId]
  );
  return { message: 'Destination saved' };
};

export const getSavedDestinations = async (userId) => {
  const result = await query(
    `SELECT c.* 
     FROM saved_destinations sd
     JOIN cities c ON c.id = sd.city_id
     WHERE sd.user_id = $1
     ORDER BY sd.created_at DESC`,
    [userId]
  );
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region,
    image: row.image,
    costIndex: parseFloat(row.cost_index),
    popularity: parseFloat(row.popularity),
  }));
};

export const removeSavedDestination = async (userId, cityId) => {
  await query(
    'DELETE FROM saved_destinations WHERE user_id = $1 AND city_id = $2',
    [userId, cityId]
  );
  return { message: 'Destination removed' };
};

export { formatTrip };
