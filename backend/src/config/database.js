import pg from 'pg';
import config from './env.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.database.url,
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transactions
 * @returns {Promise<pg.PoolClient>}
 */
export const getClient = () => pool.connect();

/**
 * Test database connectivity
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    return !!result.rows[0];
  } catch {
    return false;
  }
};

export default pool;
