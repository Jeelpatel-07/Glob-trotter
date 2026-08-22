import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData(req.user.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};
