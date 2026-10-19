import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { catalogApi } from '../api/catalog-api';
import type { BookListItem, CatalogQuery } from '../../../shared/schemas/catalog';

type CatalogState = {
  query: string;
  categoryId?: number;
  availableOnly: boolean;
  page: number;
  pageSize: number;
  items: BookListItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  load: (overrides?: CatalogQuery) => Promise<void>;
  resetFilters: () => void;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  query: '',
  categoryId: undefined,
  availableOnly: false,
  page: 1,
  pageSize: 20,
  items: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  load: async (overrides = {}) => {
    const state = get();
    const request = {
      query: state.query,
      categoryId: state.categoryId,
      availableOnly: state.availableOnly,
      page: state.page,
      pageSize: state.pageSize,
      ...overrides,
    };
    set({ ...request, isLoading: true, error: null });
    try {
      const result = await catalogApi.list(request);
      set({ items: result.items, totalCount: result.totalCount, page: result.page, pageSize: result.pageSize, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getApiErrorMessage(error) });
    }
  },
  resetFilters: () => set({ query: '', categoryId: undefined, availableOnly: false, page: 1 }),
}));
