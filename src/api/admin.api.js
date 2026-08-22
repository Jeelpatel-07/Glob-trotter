import axiosClient from './axiosClient';

export const adminAPI = {
  getAnalytics: () => axiosClient.get('/admin/analytics'),
  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  getTrips: (params) => axiosClient.get('/admin/trips', { params }),
};
