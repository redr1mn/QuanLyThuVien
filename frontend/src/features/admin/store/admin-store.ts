import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { adminApi } from '../api/admin-api';
import type { AdminUser } from '../schemas/admin';

type AdminState = {
  dashboard: Awaited<ReturnType<typeof adminApi.dashboard>> | null;
  users: AdminUser[];
  totalUsers: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  loadUsers: (query?: string, page?: number) => Promise<void>;
  setStatus: (id: string, isActive: boolean) => Promise<boolean>;
  setRole: (id: string, role: string) => Promise<boolean>;
};

export const useAdminStore = create<AdminState>((set) => ({
  dashboard: null, users: [], totalUsers: 0, page: 1, pageSize: 20, isLoading: false, error: null,
  loadDashboard: async () => {
    set({ isLoading: true, error: null });
    try { set({ dashboard: await adminApi.dashboard(), isLoading: false }); }
    catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); }
  },
  loadUsers: async (query = '', page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const result = await adminApi.users(query, page);
      set({ users: result.items, totalUsers: result.totalCount, page: result.page, pageSize: result.pageSize, isLoading: false });
    } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); }
  },
  setStatus: async (id, isActive) => {
    try { await adminApi.setStatus(id, isActive); return true; }
    catch (error) { set({ error: getApiErrorMessage(error) }); return false; }
  },
  setRole: async (id, role) => {
    try { await adminApi.setRole(id, role); return true; }
    catch (error) { set({ error: getApiErrorMessage(error) }); return false; }
  },
}));
