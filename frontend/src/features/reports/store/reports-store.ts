import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { reportsApi } from '../api/reports-api';
import type { z } from 'zod';
import { reportSchema } from '../../../shared/schemas/reports';
type Report = z.infer<typeof reportSchema>;
type ReportsState = { report: Report | null; isLoading: boolean; error: string | null; load: (from: string, to: string) => Promise<void> };
export const useReportsStore = create<ReportsState>(set => ({ report: null, isLoading: false, error: null, load: async (from, to) => { set({ isLoading: true, error: null }); try { set({ report: await reportsApi.overview(from, to), isLoading: false }); } catch (error) { set({ isLoading: false, error: getApiErrorMessage(error) }); } } }));
