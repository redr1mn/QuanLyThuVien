import { httpClient } from '../../../shared/api/http-client';
import { borrowInputSchema, loanResponseSchema, loansResponseSchema, type LoanQuery, type ReturnItem, type BorrowInput } from '../../../shared/schemas/circulation';
export const circulationApi = {
  async list(params: LoanQuery) { const response = await httpClient.get('/loans', { params }); return loansResponseSchema.parse(response.data).data!; },
  async borrow(input: BorrowInput) { const response = await httpClient.post('/loans', borrowInputSchema.parse(input)); return loanResponseSchema.parse(response.data).data!; },
  async returnLoan(id: number, items: ReturnItem[]) { const response = await httpClient.post(`/loans/${id}/return`, { items }); return loanResponseSchema.parse(response.data).data!; },
  async renew(id: number) { const response = await httpClient.post(`/loans/${id}/renew`); return loanResponseSchema.parse(response.data).data!; },
};
