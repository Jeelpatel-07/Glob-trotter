import useAuthStore from '../store/authStore';

export default function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
  return { user, token, isAuthenticated, login, logout, updateUser };
}
