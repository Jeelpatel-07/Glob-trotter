import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { query } from '../config/database.js';

/**
 * Authentication middleware — verifies Bearer token and attaches req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired', 401);
      }
      return sendError(res, 'Invalid token', 401);
    }

    // Verify user still exists in DB
    const result = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User no longer exists', 401);
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Authorization middleware — restricts access to ADMIN role
 */
export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, 'Admin access required', 403);
  }
  next();
};
