import { query } from '../config/database.js';
import { ApiError } from '../utils/response.js';

const formatCity = (row) => ({
  id: row.id,
  name: row.name,
  country: row.country,
  region: row.region || '',
  description: row.description || '',
  image: row.image || null,
  costIndex: parseFloat(row.cost_index) || 5.0,
  popularity: parseFloat(row.popularity) || 5.0,
  latitude: row.latitude ? parseFloat(row.latitude) : null,
  longitude: row.longitude ? parseFloat(row.longitude) : null,
});

/**
 * Search/list cities with filters and sorting
 */
export const searchCities = async ({ search, region, sort, limit = 50 }) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(LOWER(name) LIKE $${paramIndex} OR LOWER(country) LIKE $${paramIndex})`);
    values.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  if (region) {
    conditions.push(`region = $${paramIndex}`);
    values.push(region);
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Determine sort
  let orderBy = 'popularity DESC';
  switch (sort) {
    case 'name': orderBy = 'name ASC'; break;
    case 'cost_asc': orderBy = 'cost_index ASC'; break;
    case 'cost_desc': orderBy = 'cost_index DESC'; break;
    case 'popularity': default: orderBy = 'popularity DESC'; break;
  }

  values.push(limit);
  const result = await query(
    `SELECT * FROM cities ${where} ORDER BY ${orderBy} LIMIT $${paramIndex}`,
    values
  );

  return result.rows.map(formatCity);
};

/**
 * Get city by ID
 */
export const getCityById = async (cityId) => {
  const result = await query('SELECT * FROM cities WHERE id = $1', [cityId]);
  if (result.rows.length === 0) {
    throw new ApiError('City not found', 404);
  }
  return formatCity(result.rows[0]);
};
