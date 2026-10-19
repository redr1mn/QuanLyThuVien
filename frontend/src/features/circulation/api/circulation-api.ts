import { httpClient } from '../../../shared/api/http-client';
import { loanResponseSchema, loansResponseSchema } from '../../../shared/schemas/circulation';
export const circulationApi = {
  async list(params: { status?: string; overdueOnly?: boolean }) { const response = await httpClient.get('/loans', { params }); return loansResponseSchema.parse(response.data).data!; },
  async borrow(input: { memberId: number; copyIds: number[]; dueAt: string }) { const response = await httpClient.post('/loans', input); return loanResponseSchema.parse(response.data).data!; },
  async returnLoan(id: number, items: { copyId: number; condition: string }[]) { const response = await httpClient.post(`/loans/${id}/return`, { items }); return loanResponseSchema.parse(response.data).data!; },
};
