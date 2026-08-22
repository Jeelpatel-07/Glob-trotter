import axiosClient from './axiosClient';

export const budgetAPI = {
  getBudget: (tripId) => axiosClient.get(`/trips/${tripId}/budget`),
};
