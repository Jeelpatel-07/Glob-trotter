import * as tripService from '../services/trip.service.js';
import { sendSuccess } from '../utils/response.js';

export const enableSharing = async (req, res, next) => {
  try {
    const data = await tripService.enableTripSharing(parseInt(req.params.tripId), req.user.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getPublicTrip = async (req, res, next) => {
  try {
    const trip = await tripService.getPublicTripByToken(req.params.shareToken);
    sendSuccess(res, trip);
  } catch (err) { next(err); }
};

export const copyPublicTrip = async (req, res, next) => {
  try {
    const newTrip = await tripService.copyPublicTrip(req.params.shareToken, req.user.id);
    sendSuccess(res, newTrip, 201);
  } catch (err) { next(err); }
};
