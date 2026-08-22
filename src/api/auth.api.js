import axiosClient from './axiosClient';

export const authAPI = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  signup: (userData) => axiosClient.post('/auth/signup', userData),
  getProfile: () => axiosClient.get('/users/me'),
  updateProfile: (data) => axiosClient.put('/users/me', data),
  deleteAccount: () => axiosClient.delete('/users/me'),
};
