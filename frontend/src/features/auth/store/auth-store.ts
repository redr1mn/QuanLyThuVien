import { create } from 'zustand';
import axios from 'axios';
import { authApi } from '../api/auth-api';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import type { AuthSession, LoginInput, RegisterInput } from '../schemas/auth';

type AuthState = {
  user: AuthSession | null;
  isLoading: boolean;
  hasCheckedSession: boolean;
  error: string | null;
  loadSession: () => Promise<void>;
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<string | null>;
  logout: () => Promise<void>;
};

const messageFromError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
    return getApiErrorMessage(error);
  }
  return error instanceof Error ? error.message : 'Không thể kết nối máy chủ.';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  hasCheckedSession: false,
  error: null,
  loadSession: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ user: await authApi.me(), isLoading: false, hasCheckedSession: true });
    } catch (error) {
      // A missing session is a normal public-route state. Only form actions surface API errors.
      set({ user: null, isLoading: false, error: null, hasCheckedSession: true });
    }
  },
  login: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.login(input);
      set({ user, isLoading: false, hasCheckedSession: true });
      return true;
    } catch (error) {
      set({ user: null, isLoading: false, error: messageFromError(error) });
      return false;
    }
  },
  register: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const cardNumber = await authApi.register(input);
      set({ isLoading: false });
      return cardNumber;
    } catch (error) {
      set({ isLoading: false, error: messageFromError(error) });
      return null;
    }
  },
  logout: async () => {
    await authApi.logout();
    set({ user: null, error: null });
  },
}));
