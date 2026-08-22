import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Middleware factory: validates req.body against a Zod schema
 * @param {import('zod').ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors.map((e) => e.message).join(', ');
      return sendError(res, message, 400);
    }
    next(err);
  }
};
