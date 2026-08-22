import * as activityService from '../services/activity.service.js';
import { sendSuccess } from '../utils/response.js';

export const search = async (req, res, next) => {
  try {
    const { cityId, search, category, sort, limit } = req.query;
    const activities = await activityService.searchActivities({
      cityId,
      search: search || '',
      category: category || '',
      sort: sort || 'rating',
      limit: limit ? parseInt(limit) : 50,
    });
    sendSuccess(res, activities);
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const activity = await activityService.getActivityById(parseInt(req.params.activityId));
    sendSuccess(res, activity);
  } catch (err) { next(err); }
};
