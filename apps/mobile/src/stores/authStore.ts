import { create } from 'zustand';
import type { AuthUser } from '@pawflo/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasDog: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser, hasDog: boolean) => void;
  setHasDog: (hasDog: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasDog: false,
  isLoading: true,
  setUser: (user, hasDog) => set({ user, isAuthenticated: true, hasDog }),
  setHasDog: (hasDog) => set({ hasDog }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearAuth: () => set({ user: null, isAuthenticated: false, hasDog: false }),
}));
