import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { reservationsApi } from '../api/reservations-api';
type ReservationsState = { isLoading: boolean; error: string | null; create: (memberId: number, bookId: number) => Promise<boolean>; cancel: (id: number) => Promise<boolean> };
export const useReservationsStore = create<ReservationsState>(set => ({ isLoading: false, error: null, create: async (memberId, bookId) => { set({ isLoading: true, error: null }); try { await reservationsApi.create(memberId, bookId); set({ isLoading: false }); return true; } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); return false; } }, cancel: async id => { set({ isLoading: true, error: null }); try { await reservationsApi.cancel(id); set({ isLoading: false }); return true; } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); return false; } } }));
