import { httpClient } from '../../../shared/api/http-client';
import { readerAccountResponseSchema } from '../../../shared/schemas/reader-account';
export const readerAccountApi = { async get() { const response = await httpClient.get('/reader/account'); return readerAccountResponseSchema.parse(response.data).data!; }, async renew(loanId: number) { await httpClient.post(`/loans/${loanId}/renew`); } };
