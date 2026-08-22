import * as adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export const getAnalytics = async (_req, res, next) => {
  try {
    const data = await adminService.getAdminAnalytics();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAdminUsers(req.query);
    sendSuccess(res, users);
  } catch (err) { next(err); }
};

export const getTrips = async (req, res, next) => {
  try {
    const trips = await adminService.getAdminTrips(req.query);
    sendSuccess(res, trips);
  } catch (err) { next(err); }
};
