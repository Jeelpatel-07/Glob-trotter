import * as stopService from '../services/stop.service.js';
import { sendSuccess, sendMessage } from '../utils/response.js';

export const getByTrip = async (req, res, next) => {
  try {
    const stops = await stopService.getStopsByTrip(parseInt(req.params.tripId), req.user.id);
    sendSuccess(res, stops);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const stop = await stopService.createStop(parseInt(req.params.tripId), req.user.id, req.body);
    sendSuccess(res, stop, 201);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const stop = await stopService.updateStop(parseInt(req.params.stopId), req.user.id, req.body);
    sendSuccess(res, stop);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await stopService.deleteStop(parseInt(req.params.stopId), req.user.id);
    sendMessage(res, 'Stop deleted successfully');
  } catch (err) { next(err); }
};

export const reorder = async (req, res, next) => {
  try {
    const stops = await stopService.reorderStops(parseInt(req.params.tripId), req.user.id, req.body.stops);
    sendSuccess(res, stops);
  } catch (err) { next(err); }
};

// ─── ACTIVITIES IN STOPS ─────────────────────────────────────────────────────

export const addActivity = async (req, res, next) => {
  try {
    const activity = await stopService.addActivityToStop(parseInt(req.params.stopId), req.user.id, req.body);
    sendSuccess(res, activity, 201);
  } catch (err) { next(err); }
};

export const updateActivity = async (req, res, next) => {
  try {
    const activity = await stopService.updateTripActivity(parseInt(req.params.tripActivityId), req.user.id, req.body);
    sendSuccess(res, activity);
  } catch (err) { next(err); }
};

export const removeActivity = async (req, res, next) => {
  try {
    await stopService.deleteTripActivity(parseInt(req.params.tripActivityId), req.user.id);
    sendMessage(res, 'Activity removed from stop');
  } catch (err) { next(err); }
};

export const reorderActivities = async (req, res, next) => {
  try {
    const activities = await stopService.reorderStopActivities(parseInt(req.params.stopId), req.user.id, req.body.activities);
    sendSuccess(res, activities);
  } catch (err) { next(err); }
};
