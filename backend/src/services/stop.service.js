import { query, getClient } from '../config/database.js';
import { ApiError } from '../utils/response.js';

const formatStop = (row, activities = []) => ({
  id: row.id,
  tripId: row.trip_id,
  cityId: row.city_id,
  cityName: row.city_name || row.city_name_lookup || '',
  startDate: row.start_date,
  endDate: row.end_date,
  budget: parseFloat(row.budget) || 0,
  notes: row.notes || '',
  order: row.stop_order,
  activities: activities.map(a => ({
    id: a.id,
    activityId: a.activity_id,
    name: a.name,
    cost: parseFloat(a.cost) || 0,
    category: a.category || 'sightseeing',
    time: a.activity_time || '',
    order: a.activity_order,
    notes: a.notes || '',
  })),
  city: row.city_name_lookup ? {
    id: row.city_id,
    name: row.city_name_lookup,
    country: row.city_country || '',
    image: row.city_image || null,
  } : null,
});

/**
 * Verify trip ownership — returns trip or throws
 */
const verifyTripOwnership = async (tripId, userId) => {
  const result = await query('SELECT user_id FROM trips WHERE id = $1', [tripId]);
  if (result.rows.length === 0) {
    throw new ApiError('Trip not found', 404);
  }
  if (result.rows[0].user_id !== userId) {
    throw new ApiError('Not authorized', 403);
  }
  return result.rows[0];
};

/**
 * Verify stop ownership through its trip
 */
const verifyStopOwnership = async (stopId, userId) => {
  const result = await query(
    `SELECT ts.id, ts.trip_id, t.user_id 
     FROM trip_stops ts
     JOIN trips t ON t.id = ts.trip_id
     WHERE ts.id = $1`,
    [stopId]
  );
  if (result.rows.length === 0) {
    throw new ApiError('Stop not found', 404);
  }
  if (result.rows[0].user_id !== userId) {
    throw new ApiError('Not authorized', 403);
  }
  return result.rows[0];
};

/**
 * Verify planned activity ownership through stop and trip
 */
const verifyActivityOwnership = async (tripActivityId, userId) => {
  const result = await query(
    `SELECT ta.id, ta.trip_stop_id, ts.trip_id, t.user_id
     FROM trip_activities ta
     JOIN trip_stops ts ON ts.id = ta.trip_stop_id
     JOIN trips t ON t.id = ts.trip_id
     WHERE ta.id = $1`,
    [tripActivityId]
  );
  if (result.rows.length === 0) {
    throw new ApiError('Activity not found in trip', 404);
  }
  if (result.rows[0].user_id !== userId) {
    throw new ApiError('Not authorized', 403);
  }
  return result.rows[0];
};

/**
 * Get all stops for a trip (including activities)
 */
export const getStopsByTrip = async (tripId, userId) => {
  await verifyTripOwnership(tripId, userId);

  const stopsResult = await query(
    `SELECT ts.*,
       c.name AS city_name_lookup, c.country AS city_country, c.image AS city_image
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
      activitiesByStop[a.trip_stop_id].push(a);
    });
  }

  return stopsResult.rows.map(s => formatStop(s, activitiesByStop[s.id] || []));
};

/**
 * Create a new stop in a trip
 */
export const createStop = async (tripId, userId, data) => {
  await verifyTripOwnership(tripId, userId);

  const orderResult = await query(
    'SELECT COALESCE(MAX(stop_order), -1) + 1 AS next_order FROM trip_stops WHERE trip_id = $1',
    [tripId]
  );
  const nextOrder = data.order !== undefined ? data.order : orderResult.rows[0].next_order;

  const result = await query(
    `INSERT INTO trip_stops (trip_id, city_id, city_name, start_date, end_date, budget, notes, stop_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      tripId,
      data.cityId || null,
      data.cityName || '',
      data.startDate || null,
      data.endDate || null,
      data.budget || 0,
      data.notes || '',
      nextOrder,
    ]
  );

  const stop = await query(
    `SELECT ts.*,
       c.name AS city_name_lookup, c.country AS city_country, c.image AS city_image
     FROM trip_stops ts
     LEFT JOIN cities c ON c.id = ts.city_id
     WHERE ts.id = $1`,
    [result.rows[0].id]
  );

  return formatStop(stop.rows[0], []);
};

/**
 * Update a stop
 */
export const updateStop = async (stopId, userId, data) => {
  await verifyStopOwnership(stopId, userId);

  const fields = [];
  const values = [];
  let paramIndex = 1;

  const fieldMap = {
    cityId: 'city_id',
    cityName: 'city_name',
    startDate: 'start_date',
    endDate: 'end_date',
    budget: 'budget',
    notes: 'notes',
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

  fields.push('updated_at = NOW()');
  values.push(stopId);

  await query(
    `UPDATE trip_stops SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );

  const result = await query(
    `SELECT ts.*,
       c.name AS city_name_lookup, c.country AS city_country, c.image AS city_image
     FROM trip_stops ts
     LEFT JOIN cities c ON c.id = ts.city_id
     WHERE ts.id = $1`,
    [stopId]
  );

  const activities = await query(
    `SELECT * FROM trip_activities WHERE trip_stop_id = $1 ORDER BY activity_order ASC`,
    [stopId]
  );

  return formatStop(result.rows[0], activities.rows);
};

/**
 * Delete a stop
 */
export const deleteStop = async (stopId, userId) => {
  await verifyStopOwnership(stopId, userId);
  await query('DELETE FROM trip_stops WHERE id = $1', [stopId]);
  return true;
};

/**
 * Reorder stops
 */
export const reorderStops = async (tripId, userId, stops) => {
  await verifyTripOwnership(tripId, userId);

  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (const stop of stops) {
      await client.query(
        'UPDATE trip_stops SET stop_order = $1, updated_at = NOW() WHERE id = $2 AND trip_id = $3',
        [stop.order, stop.id, tripId]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getStopsByTrip(tripId, userId);
};

// ─── STOP ACTIVITIES ─────────────────────────────────────────────────────────

/**
 * Add an activity to a stop
 */
export const addActivityToStop = async (stopId, userId, data) => {
  await verifyStopOwnership(stopId, userId);

  let name = data.name || '';
  let cost = data.cost || 0;
  let category = data.category || 'sightseeing';

  // If activityId provided, inherit defaults from activity catalog
  if (data.activityId) {
    const act = await query('SELECT * FROM activities WHERE id = $1', [data.activityId]);
    if (act.rows.length > 0) {
      if (!name) name = act.rows[0].name;
      if (data.cost === undefined) cost = parseFloat(act.rows[0].cost);
      if (!data.category) category = act.rows[0].category;
    }
  }

  if (!name) {
    throw new ApiError('Activity name is required', 400);
  }

  const orderResult = await query(
    'SELECT COALESCE(MAX(activity_order), -1) + 1 AS next_order FROM trip_activities WHERE trip_stop_id = $1',
    [stopId]
  );
  const nextOrder = data.order !== undefined ? data.order : orderResult.rows[0].next_order;

  const result = await query(
    `INSERT INTO trip_activities (trip_stop_id, activity_id, name, cost, category, activity_time, notes, activity_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [stopId, data.activityId || null, name, cost, category, data.time || '10:00 AM', data.notes || '', nextOrder]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    tripStopId: row.trip_stop_id,
    activityId: row.activity_id,
    name: row.name,
    cost: parseFloat(row.cost) || 0,
    category: row.category,
    time: row.activity_time,
    order: row.activity_order,
    notes: row.notes,
  };
};

/**
 * Update an activity in a stop
 */
export const updateTripActivity = async (tripActivityId, userId, data) => {
  await verifyActivityOwnership(tripActivityId, userId);

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.name !== undefined) { fields.push(`name = $${paramIndex}`); values.push(data.name); paramIndex++; }
  if (data.cost !== undefined) { fields.push(`cost = $${paramIndex}`); values.push(data.cost); paramIndex++; }
  if (data.category !== undefined) { fields.push(`category = $${paramIndex}`); values.push(data.category); paramIndex++; }
  if (data.time !== undefined) { fields.push(`activity_time = $${paramIndex}`); values.push(data.time); paramIndex++; }
  if (data.notes !== undefined) { fields.push(`notes = $${paramIndex}`); values.push(data.notes); paramIndex++; }

  if (fields.length === 0) {
    throw new ApiError('No fields to update', 400);
  }

  fields.push('updated_at = NOW()');
  values.push(tripActivityId);

  const result = await query(
    `UPDATE trip_activities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  const row = result.rows[0];
  return {
    id: row.id,
    tripStopId: row.trip_stop_id,
    activityId: row.activity_id,
    name: row.name,
    cost: parseFloat(row.cost) || 0,
    category: row.category,
    time: row.activity_time,
    order: row.activity_order,
    notes: row.notes,
  };
};

/**
 * Delete an activity from a stop
 */
export const deleteTripActivity = async (tripActivityId, userId) => {
  await verifyActivityOwnership(tripActivityId, userId);
  await query('DELETE FROM trip_activities WHERE id = $1', [tripActivityId]);
  return true;
};

/**
 * Reorder activities in a stop
 */
export const reorderStopActivities = async (stopId, userId, activities) => {
  await verifyStopOwnership(stopId, userId);

  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (const act of activities) {
      await client.query(
        'UPDATE trip_activities SET activity_order = $1, updated_at = NOW() WHERE id = $2 AND trip_stop_id = $3',
        [act.order, act.id, stopId]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const result = await query(
    'SELECT * FROM trip_activities WHERE trip_stop_id = $1 ORDER BY activity_order ASC',
    [stopId]
  );
  return result.rows;
};
