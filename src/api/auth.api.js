import axiosClient from './axiosClient';

export const authAPI = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  signup: (userData) => axiosClient.post('/auth/signup', userData),
  getProfile: () => axiosClient.get('/users/me'),
  updateProfile: (data) => axiosClient.put('/users/me', data),
  deleteAccount: () => axiosClient.delete('/users/me'),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  getSavedDestinations: () => axiosClient.get('/users/me/saved-destinations'),
  saveDestination: (cityId) => axiosClient.post('/users/me/saved-destinations', { cityId }),
  deleteSavedDestination: (cityId) => axiosClient.delete(`/users/me/saved-destinations/${cityId}`),
};
