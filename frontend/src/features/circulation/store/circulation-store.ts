import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { circulationApi } from '../api/circulation-api';
import type { Loan } from '../../../shared/schemas/circulation';
type CirculationState = { loans: Loan[]; isLoading: boolean; error: string | null; load: () => Promise<void>; borrow: (input: { memberId: number; copyIds: number[]; dueAt: string }) => Promise<boolean>; returnLoan: (id: number, items: { copyId: number; condition: string }[]) => Promise<boolean> };
export const useCirculationStore = create<CirculationState>((set, get) => ({
  loans: [], isLoading: false, error: null,
  load: async () => { set({ isLoading: true, error: null }); try { const result = await circulationApi.list({}); set({ loans: result.items, isLoading: false }); } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); } },
  borrow: async input => { set({ isLoading: true, error: null }); try { await circulationApi.borrow(input); await get().load(); return true; } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); return false; } },
  returnLoan: async (id, items) => { set({ isLoading: true, error: null }); try { await circulationApi.returnLoan(id, items); await get().load(); return true; } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); return false; } },
}));
