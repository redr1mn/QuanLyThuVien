import { httpClient } from '../../../shared/api/http-client';
import { reportResponseSchema } from '../../../shared/schemas/reports';
export const reportsApi = { async overview(from: string, to: string) { const response = await httpClient.get('/reports/overview', { params: { from, to } }); return reportResponseSchema.parse(response.data).data!; } };
