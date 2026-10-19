import { create } from 'zustand';
import axios from 'axios';
import { authApi } from '../api/auth-api';
import type { AuthSession, LoginInput } from '../schemas/auth';

type AuthState = {
  user: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  loadSession: () => Promise<void>;
  login: (input: LoginInput) => Promise<boolean>;
  logout: () => Promise<void>;
};

const messageFromError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401)
    return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
  return error instanceof Error ? error.message : 'Không thể kết nối máy chủ.';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  loadSession: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ user: await authApi.me(), isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false, error: messageFromError(error) });
    }
  },
  login: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.login(input);
      set({ user, isLoading: false });
      return true;
    } catch (error) {
      set({ user: null, isLoading: false, error: messageFromError(error) });
      return false;
    }
  },
  logout: async () => {
    await authApi.logout();
    set({ user: null, error: null });
  },
}));
