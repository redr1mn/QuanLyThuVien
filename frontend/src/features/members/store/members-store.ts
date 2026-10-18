import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { membersApi } from '../api/members-api';
import type { CreateMemberInput, MemberListItem } from '../../../shared/schemas/members';

type MembersState = { query: string; status: string; items: MemberListItem[]; totalCount: number; isLoading: boolean; error: string | null; load: (overrides?: Partial<Pick<MembersState, 'query' | 'status'>>) => Promise<void>; create: (input: CreateMemberInput) => Promise<boolean> };
export const useMembersStore = create<MembersState>((set, get) => ({
  query: '', status: '', items: [], totalCount: 0, isLoading: false, error: null,
  load: async (overrides = {}) => { const request = { query: get().query, status: get().status, page: 1, pageSize: 20, ...overrides }; set({ ...overrides, isLoading: true, error: null }); try { const result = await membersApi.list(request); set({ items: result.items, totalCount: result.totalCount, isLoading: false }); } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); } },
  create: async (input) => { set({ isLoading: true, error: null }); try { await membersApi.create(input); await get().load(); return true; } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); return false; } },
}));
