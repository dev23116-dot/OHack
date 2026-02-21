import { create } from 'zustand';
import { UserRole } from '@/types';

const TOKEN_KEY = 'fleetflow_token';

const roleFromString = (s: string): UserRole => {
  if (s === 'fleet_manager' || s === 'dispatcher' || s === 'safety_officer' || s === 'financial_analyst') return s;
  return 'fleet_manager';
};

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
  token: string | null;
  login: (email: string, role: UserRole) => void;
  loginWithToken: (email: string, role: string, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  email: null,
  token: null,
  login: (email, role) => set({ isAuthenticated: true, role, email, token: null }),
  loginWithToken: (email, role, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ isAuthenticated: true, role: roleFromString(role), email, token });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ isAuthenticated: false, role: null, email: null, token: null });
  },
  hydrate: () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) set((s) => ({ ...s, token: t, isAuthenticated: true }));
  },
}));
