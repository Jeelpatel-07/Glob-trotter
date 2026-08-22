import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/response.js';

const SALT_ROUNDS = 12;

/**
 * Format a DB user row into the frontend-expected user object.
 * Frontend expects camelCase: id, firstName, lastName, email, role, photo, phone, city, country
 */
const formatUser = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  role: row.role,
  photo: row.photo || null,
  phone: row.phone || '',
  city: row.city || '',
  country: row.country || '',
  createdAt: row.created_at,
});

/**
 * Register a new user
 */
export const signup = async ({ firstName, lastName, email, password, phone, city, country, additionalInfo }) => {
  // Check for duplicate email
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new ApiError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, city, country, additional_info)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [firstName, lastName, email.toLowerCase(), passwordHash, phone || '', city || '', country || '', additionalInfo || '']
  );

  return formatUser(result.rows[0]);
};

/**
 * Authenticate a user and return user + JWT
 */
export const login = async ({ email, password }) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  if (result.rows.length === 0) {
    throw new ApiError('Invalid email or password', 401);
  }

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new ApiError('Invalid email or password', 401);
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user: formatUser(user), token };
};

export { formatUser };
