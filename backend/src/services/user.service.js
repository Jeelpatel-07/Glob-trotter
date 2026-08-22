import { query } from '../config/database.js';
import { ApiError } from '../utils/response.js';
import { formatUser } from './auth.service.js';

/**
 * Get user profile by ID
 */
export const getProfile = async (userId) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new ApiError('User not found', 404);
  }
  return formatUser(result.rows[0]);
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, data) => {
  const { firstName, lastName, email, phone, city, country } = data;

  // If email is being changed, check for duplicates
  if (email) {
    const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), userId]);
    if (existing.rows.length > 0) {
      throw new ApiError('Email is already in use', 409);
    }
  }

  // Build dynamic update query from provided fields
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (firstName !== undefined) { updates.push(`first_name = $${paramIndex++}`); values.push(firstName); }
  if (lastName !== undefined) { updates.push(`last_name = $${paramIndex++}`); values.push(lastName); }
  if (email !== undefined) { updates.push(`email = $${paramIndex++}`); values.push(email.toLowerCase()); }
  if (phone !== undefined) { updates.push(`phone = $${paramIndex++}`); values.push(phone); }
  if (city !== undefined) { updates.push(`city = $${paramIndex++}`); values.push(city); }
  if (country !== undefined) { updates.push(`country = $${paramIndex++}`); values.push(country); }

  if (updates.length === 0) {
    throw new ApiError('No fields to update', 400);
  }

  updates.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new ApiError('User not found', 404);
  }

  return formatUser(result.rows[0]);
};

/**
 * Delete user account
 */
export const deleteAccount = async (userId) => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
  if (result.rows.length === 0) {
    throw new ApiError('User not found', 404);
  }
  return true;
};
