import { httpClient } from '../../../shared/api/http-client';
import type { PagedResult } from '../../../shared/api/api-envelope';
import {
  categoryListResponseSchema,
  pagedBookResponseSchema,
  type BookListItem,
  type CatalogQuery,
} from '../../../shared/schemas/catalog';

export const catalogApi = {
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
};
