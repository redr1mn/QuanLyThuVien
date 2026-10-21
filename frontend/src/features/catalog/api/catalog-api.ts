import { httpClient } from '../../../shared/api/http-client';
import type { PagedResult } from '../../../shared/api/api-envelope';
import {
  categoryListResponseSchema,
  pagedBookResponseSchema,
  bookDetailsResponseSchema,
  bookCopySchema, bookInputSchema, copyInputSchema,
  type BookInput,
  type BookListItem,
  type CatalogQuery,
} from '../../../shared/schemas/catalog';

export const catalogApi = {
  async save(input: BookInput, id?: number) {
    const payload = bookInputSchema.parse(input);
    const response = id ? await httpClient.put(`/books/${id}`, payload) : await httpClient.post('/books', payload);
    const result = bookDetailsResponseSchema.parse(response.data).data;
    if (!result) throw new Error('Không nhận được hồ sơ sách.');
    return result;
  },
  async addCopy(id: number, input: { barcode: string; shelfLocation: string }) {
    const response = await httpClient.post(`/books/${id}/copies`, copyInputSchema.parse(input));
    return bookCopySchema.parse(response.data.data);
  },
  async list(query: CatalogQuery = {}): Promise<PagedResult<BookListItem>> {
    const response = await httpClient.get('/books', { params: query });
    const parsed = pagedBookResponseSchema.parse(response.data);
    if (!parsed.data) throw new Error('Catalog API không trả về dữ liệu.');
    return parsed.data;
  },

  async categories() {
    const response = await httpClient.get('/categories');
    return categoryListResponseSchema.parse(response.data).data ?? [];
  },

  async get(id: number) {
    const response = await httpClient.get(`/books/${id}`);
    const parsed = bookDetailsResponseSchema.parse(response.data);
    if (!parsed.data) throw new Error('Chi tiết sách không tồn tại.');
    return parsed.data;
  },
};
