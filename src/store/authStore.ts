import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userId: string, username: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:           null,
      userId:          null,
      username:        null,
      email:           null,
      isAuthenticated: false,

      setAuth: (token, userId, username, email) => {
        localStorage.setItem('token', token);
        set({ token, userId, username, email, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, userId: null, username: null, email: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);