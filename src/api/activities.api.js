import axiosClient from './axiosClient';

export const activitiesAPI = {
  search: (params) => axiosClient.get('/activities', { params }),
  getById: (activityId) => axiosClient.get(`/activities/${activityId}`),
};
