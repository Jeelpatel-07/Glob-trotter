import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('gt_user') || 'null'),
  token: localStorage.getItem('gt_token') || null,
  isAuthenticated: !!localStorage.getItem('gt_token'),

  login: (user, token) => {
    localStorage.setItem('gt_token', token);
    localStorage.setItem('gt_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('gt_token');
    localStorage.removeItem('gt_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData };
    localStorage.setItem('gt_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

export default useAuthStore;
