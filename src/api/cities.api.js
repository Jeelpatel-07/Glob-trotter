import axiosClient from './axiosClient';

export const citiesAPI = {
  search: (params) => axiosClient.get('/cities', { params }),
  getById: (cityId) => axiosClient.get(`/cities/${cityId}`),
};
