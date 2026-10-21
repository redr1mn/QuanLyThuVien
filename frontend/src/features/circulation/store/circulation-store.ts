import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { circulationApi } from '../api/circulation-api';
import type { Loan, LoanQuery, BorrowInput, ReturnItem } from '../../../shared/schemas/circulation';

type CirculationState = {
  loans: Loan[]; page: number; pageSize: number; totalCount: number; status: string; overdueOnly: boolean;
  isLoading: boolean; isSaving: boolean; error: string | null; receipt: Loan | null;
  load: (query?: LoanQuery) => Promise<void>;
  borrow: (input: BorrowInput) => Promise<boolean>;
  returnLoan: (id: number, items: ReturnItem[]) => Promise<boolean>;
  renew: (id: number) => Promise<boolean>;
};
let latestRequest = 0;
export const useCirculationStore = create<CirculationState>((set, get) => ({
  loans: [], page: 1, pageSize: 20, totalCount: 0, status: '', overdueOnly: false, isLoading: false, isSaving: false, error: null, receipt: null,
  load: async (query = {}) => {
    const requestId = ++latestRequest;
    const { page, pageSize, status, overdueOnly } = get();
    const request = { page, pageSize, status, overdueOnly, ...query };
    set({ ...request, isLoading: true, error: null });
    try { const result = await circulationApi.list(request); if (requestId === latestRequest) set({ loans: result.items, totalCount: result.totalCount, page: result.page, pageSize: result.pageSize, isLoading: false }); }
    catch (error) { if (requestId === latestRequest) set({ isLoading: false, error: getApiErrorMessage(error) }); }
  },
  borrow: async input => {
    set({ isSaving: true, error: null, receipt: null });
    try { const receipt = await circulationApi.borrow(input); await get().load({ page: 1 }); set({ receipt, isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
  returnLoan: async (id, items) => {
    set({ isSaving: true, error: null, receipt: null });
    try { const receipt = await circulationApi.returnLoan(id, items); await get().load(); set({ receipt, isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
  renew: async id => {
    set({ isSaving: true, error: null, receipt: null });
    try { const receipt = await circulationApi.renew(id); await get().load(); set({ receipt, isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
}));
