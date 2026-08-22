import axiosClient from './axiosClient';

export const shareAPI = {
  enableSharing: (tripId) => axiosClient.post(`/trips/${tripId}/share`),
  getPublicTrip: (shareToken) => axiosClient.get(`/public/trips/${shareToken}`),
  copyPublicTrip: (shareToken) => axiosClient.post(`/public/trips/${shareToken}/copy`),
};
