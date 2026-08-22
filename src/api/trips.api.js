import axiosClient from './axiosClient';

export const tripsAPI = {
  getAll: (params) => axiosClient.get('/trips', { params }),
  getById: (tripId) => axiosClient.get(`/trips/${tripId}`),
  create: (data) => axiosClient.post('/trips', data),
  update: (tripId, data) => axiosClient.put(`/trips/${tripId}`, data),
  delete: (tripId) => axiosClient.delete(`/trips/${tripId}`),
  getDashboard: () => axiosClient.get('/dashboard'),
  getItinerary: (tripId) => axiosClient.get(`/trips/${tripId}/itinerary`),
  getBudget: (tripId) => axiosClient.get(`/trips/${tripId}/budget`),
  getCalendar: (tripId) => axiosClient.get(`/trips/${tripId}/calendar`),
};
