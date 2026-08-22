import * as cityService from '../services/city.service.js';
import { sendSuccess } from '../utils/response.js';

export const search = async (req, res, next) => {
  try {
    const { search, region, sort, limit } = req.query;
    const cities = await cityService.searchCities({
      search: search || '',
      region: region || '',
      sort: sort || 'popularity',
      limit: limit ? parseInt(limit) : 50,
    });
    sendSuccess(res, cities);
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const city = await cityService.getCityById(parseInt(req.params.cityId));
    sendSuccess(res, city);
  } catch (err) { next(err); }
};
