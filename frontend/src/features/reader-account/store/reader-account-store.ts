import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { readerAccountApi } from '../api/reader-account-api';
import type { ReaderAccount } from '../../../shared/schemas/reader-account';
type ReaderAccountState = { account: ReaderAccount; isLoading: boolean; error: string | null; load: () => Promise<void>; renew: (loanId: number) => Promise<boolean> };
export const useReaderAccountStore = create<ReaderAccountState>((set, get) => ({ account: null, isLoading: false, error: null, load: async () => { set({ isLoading: true, error: null }); try { set({ account: await readerAccountApi.get(), isLoading: false }); } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); } }, renew: async loanId => { set({ isLoading: true, error: null }); try { await readerAccountApi.renew(loanId); await get().load(); return true; } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); return false; } } }));
