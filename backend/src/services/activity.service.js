import { query } from '../config/database.js';
import { ApiError } from '../utils/response.js';

const formatActivity = (row) => ({
  id: row.id,
  cityId: row.city_id,
  cityName: row.city_name || '',
  name: row.name,
  description: row.description || '',
  category: row.category || 'sightseeing',
  duration: row.duration || '2 hours',
  cost: parseFloat(row.cost) || 0,
  thumbnail: row.thumbnail || null,
  rating: parseFloat(row.rating) || 4.5,
});

/**
 * Search/filter activities
 */
export const searchActivities = async ({ cityId, search, category, sort, limit = 50 }) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (cityId) {
    conditions.push(`a.city_id = $${paramIndex}`);
    values.push(parseInt(cityId));
    paramIndex++;
  }

  if (search) {
    conditions.push(`(LOWER(a.name) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
    values.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`LOWER(a.category) = $${paramIndex}`);
    values.push(category.toLowerCase());
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'a.rating DESC';
  switch (sort) {
    case 'cost_asc': orderBy = 'a.cost ASC'; break;
    case 'cost_desc': orderBy = 'a.cost DESC'; break;
    case 'duration_asc': orderBy = 'a.duration ASC'; break;
    case 'name': orderBy = 'a.name ASC'; break;
    case 'rating': default: orderBy = 'a.rating DESC'; break;
  }

  values.push(limit);
  const result = await query(
    `SELECT a.*, c.name AS city_name
     FROM activities a
     LEFT JOIN cities c ON c.id = a.city_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT $${paramIndex}`,
    values
  );

  return result.rows.map(formatActivity);
};

/**
 * Get activity by ID
 */
export const getActivityById = async (activityId) => {
  const result = await query(
    `SELECT a.*, c.name AS city_name
     FROM activities a
     LEFT JOIN cities c ON c.id = a.city_id
     WHERE a.id = $1`,
    [activityId]
  );

  if (result.rows.length === 0) {
    throw new ApiError('Activity not found', 404);
  }

  return formatActivity(result.rows[0]);
};
