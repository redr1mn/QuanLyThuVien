export type ApiError = { code: string; message: string; field?: string | null };

export type ApiEnvelope<T> = {
  data: T | null;
  errors: ApiError[];
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};
