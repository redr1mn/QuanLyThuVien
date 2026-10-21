import { create } from 'zustand';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { catalogApi } from '../api/catalog-api';
import type { BookListItem, CatalogQuery, Category, BookInput, BookDetails } from '../../../shared/schemas/catalog';

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
  selectedId: number | null;
  selectedBook: BookDetails | null;
  detailLoading: boolean;
  detailError: string | null;
  openBook: (id: number | null) => Promise<void>;
  categories: Category[];
  categoryError: string | null;
  isSaving: boolean;
  loadCategories: () => Promise<void>;
  save: (input: BookInput, id?: number) => Promise<boolean>;
  addCopy: (id: number, input: { barcode: string; shelfLocation: string }) => Promise<boolean>;
  load: (overrides?: CatalogQuery) => Promise<void>;
  resetFilters: () => void;
};

let latestRequest = 0;
let detailRequest = 0;
export const useCatalogStore = create<CatalogState>((set, get) => ({
  selectedId: null, selectedBook: null, detailLoading: false, detailError: null,
  openBook: async id => {
    const requestId = ++detailRequest;
    set({ selectedId: id, selectedBook: null, detailLoading: !!id, detailError: null });
    if (!id) return;
    try { const selectedBook = await catalogApi.get(id); if (requestId === detailRequest) set({ selectedBook, detailLoading: false }); }
    catch (error) { if (requestId === detailRequest) set({ detailError: getApiErrorMessage(error), detailLoading: false }); }
  },
  categories: [], categoryError: null, isSaving: false,
  loadCategories: async () => {
    set({ categoryError: null });
    try { set({ categories: await catalogApi.categories() }); }
    catch (error) { set({ categoryError: getApiErrorMessage(error) }); }
  },
  save: async (input, id) => {
    set({ isSaving: true, error: null });
    try { await catalogApi.save(input, id); await get().load(); set({ isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
  addCopy: async (id, input) => {
    set({ isSaving: true, error: null });
    try { await catalogApi.addCopy(id, input); await get().load(); set({ isSaving: false }); return true; }
    catch (error) { set({ isSaving: false, error: getApiErrorMessage(error) }); return false; }
  },
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
    const requestId = ++latestRequest;
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
      if (requestId !== latestRequest) return;
      set({ items: result.items, totalCount: result.totalCount, page: result.page, pageSize: result.pageSize, isLoading: false });
    } catch (error) {
      if (requestId !== latestRequest) return;
      set({ isLoading: false, error: getApiErrorMessage(error) });
    }
  },
  resetFilters: () => set({ query: '', categoryId: undefined, availableOnly: false, page: 1 }),
}));
