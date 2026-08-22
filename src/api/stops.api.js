import axiosClient from './axiosClient';

export const stopsAPI = {
  getByTrip: (tripId) => axiosClient.get(`/trips/${tripId}/stops`),
  create: (tripId, data) => axiosClient.post(`/trips/${tripId}/stops`, data),
  update: (stopId, data) => axiosClient.put(`/stops/${stopId}`, data),
  delete: (stopId) => axiosClient.delete(`/stops/${stopId}`),
  reorder: (tripId, stops) => axiosClient.patch(`/trips/${tripId}/stops/reorder`, { stops }),
  addActivity: (stopId, data) => axiosClient.post(`/stops/${stopId}/activities`, data),
  removeActivity: (tripActivityId) => axiosClient.delete(`/trip-activities/${tripActivityId}`),
  updateActivity: (tripActivityId, data) => axiosClient.put(`/trip-activities/${tripActivityId}`, data),
  reorderActivities: (stopId, activities) => axiosClient.patch(`/stops/${stopId}/activities/reorder`, { activities }),
};
