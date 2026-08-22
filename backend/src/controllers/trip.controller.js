import * as tripService from '../services/trip.service.js';
import { sendSuccess, sendMessage } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.user.id, req.body);
    sendSuccess(res, trip, 201);
  } catch (err) { next(err); }
};

export const getAll = async (req, res, next) => {
  try {
    const trips = await tripService.getUserTrips(req.user.id, {
      public: req.query.public === 'true',
      search: req.query.search,
    });
    sendSuccess(res, trips);
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(parseInt(req.params.tripId), req.user.id);
    sendSuccess(res, trip);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const trip = await tripService.updateTrip(parseInt(req.params.tripId), req.user.id, req.body);
    sendSuccess(res, trip);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    await tripService.deleteTrip(parseInt(req.params.tripId), req.user.id);
    sendMessage(res, 'Trip deleted successfully');
  } catch (err) { next(err); }
};

export const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await tripService.getTripItinerary(parseInt(req.params.tripId), req.user.id);
    sendSuccess(res, itinerary);
  } catch (err) { next(err); }
};

export const getBudget = async (req, res, next) => {
  try {
    const budget = await tripService.getTripBudget(parseInt(req.params.tripId), req.user.id);
    sendSuccess(res, budget);
  } catch (err) { next(err); }
};

export const getCalendar = async (req, res, next) => {
  try {
    const calendar = await tripService.getTripCalendar(req.params.tripId, req.user.id);
    sendSuccess(res, calendar);
  } catch (err) { next(err); }
};

export const saveDestination = async (req, res, next) => {
  try {
    const result = await tripService.saveDestination(req.user.id, parseInt(req.body.cityId));
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

export const getSavedDestinations = async (req, res, next) => {
  try {
    const destinations = await tripService.getSavedDestinations(req.user.id);
    sendSuccess(res, destinations);
  } catch (err) { next(err); }
};

export const removeSavedDestination = async (req, res, next) => {
  try {
    const result = await tripService.removeSavedDestination(req.user.id, parseInt(req.params.cityId));
    sendSuccess(res, result);
  } catch (err) { next(err); }
};
