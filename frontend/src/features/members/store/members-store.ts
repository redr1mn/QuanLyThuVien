import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { membersApi } from '../api/members-api';
import type { CreateMemberInput, UpdateMemberInput, MemberListItem } from '../../../shared/schemas/members';

type MemberFilters = { query: string; status: string; page: number; pageSize: number };
type MembersState = MemberFilters & { items: MemberListItem[]; totalCount: number; isLoading: boolean; isSaving: boolean; error: string | null; load: (overrides?: Partial<MemberFilters>) => Promise<void>; create: (input: CreateMemberInput) => Promise<boolean>; update: (id: number, input: UpdateMemberInput) => Promise<boolean> };
let latestRequest = 0;
export const useMembersStore = create<MembersState>((set, get) => ({
  query: '', status: '', page: 1, pageSize: 20, items: [], totalCount: 0, isLoading: false, isSaving: false, error: null,
  load: async (overrides = {}) => {
    const requestId = ++latestRequest;
    const { query, status, page, pageSize } = get();
    const request = { query, status, page, pageSize, ...overrides };
    set({ ...request, isLoading: true, error: null });
    try { const result = await membersApi.list(request); if (requestId === latestRequest) set({ items: result.items, totalCount: result.totalCount, page: result.page, isLoading: false }); }
    catch (error) { if (requestId === latestRequest) set({ isLoading: false, error: getApiErrorMessage(error) }); }
  },
  create: async input => {
    set({ isSaving: true, error: null });
    try { await membersApi.create(input); await get().load({ page: 1 }); set({ isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
  update: async (id, input) => {
    set({ isSaving: true, error: null });
    try { await membersApi.update(id, input); await get().load(); set({ isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
}));
