import * as userService from '../services/user.service.js';
import { sendSuccess, sendMessage } from '../utils/response.js';

/**
 * GET /api/users/me
 * Frontend: profileData?.data || profileData || user
 * So response = { data: { ...userFields } }
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/me
 * Frontend: updateUser(res?.data || res)
 * So response = { data: { ...updatedUser } }
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, updatedUser);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/me
 */
export const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id);
    return sendMessage(res, 'Account deleted successfully');
  } catch (err) {
    next(err);
  }
};
