import { httpClient } from '../../../shared/api/http-client';
import { adminActionEnvelopeSchema, adminDashboardEnvelopeSchema, adminUsersEnvelopeSchema } from '../schemas/admin';

export const adminApi = {
  async dashboard() {
    const response = await httpClient.get('/admin/dashboard');
    return adminDashboardEnvelopeSchema.parse(response.data).data!;
  },
  async users(query: string, page = 1, pageSize = 20) {
    const response = await httpClient.get('/admin/users', { params: { query: query || undefined, page, pageSize } });
    return adminUsersEnvelopeSchema.parse(response.data).data!;
  },
  async setStatus(id: string, isActive: boolean) {
    const response = await httpClient.patch(`/admin/users/${id}/status`, { isActive });
    adminActionEnvelopeSchema.parse(response.data);
  },
  async setRole(id: string, role: string) {
    const response = await httpClient.patch(`/admin/users/${id}/role`, { role });
    adminActionEnvelopeSchema.parse(response.data);
  },
};
