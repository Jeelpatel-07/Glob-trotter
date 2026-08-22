import * as authService from '../services/auth.service.js';
import { sendSuccess, sendMessage } from '../utils/response.js';

/**
 * POST /api/auth/signup
 * Frontend does NOT auto-login after signup — redirects to /login
 */
export const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    return sendMessage(res, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Frontend expects: res.data.user and res.data.token
 * Since axios interceptor returns response.data, HTTP body = { data: { user, token } }
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return sendSuccess(res, { user, token });
  } catch (err) {
    next(err);
  }
};
