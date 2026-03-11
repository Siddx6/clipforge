import { create } from 'zustand';
import { loginUser, registerUser, logoutUser, getMe } from '../api/auth.api';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await loginUser(email, password);
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await registerUser(name, email, password);
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    await logoutUser();
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      const data = await getMe();
      set({ user: data });
    } catch {
      set({ user: null });
    }
  },
  refreshUser: async () => {
  try {
    const data = await getMe();
    set({ user: data });
    return data;
  } catch {
    // silently fail
  }
},

  clearError: () => set({ error: null }),
}));

export default useAuthStore;