import { httpClient } from '../../../shared/api/http-client';
import { memberDetailsResponseSchema, memberPageResponseSchema, type CreateMemberInput } from '../../../shared/schemas/members';

export const membersApi = {
  async list(params: { query?: string; status?: string; page?: number; pageSize?: number }) {
    const response = await httpClient.get('/members', { params });
    return memberPageResponseSchema.parse(response.data).data!;
  },
  async create(input: CreateMemberInput) {
    const response = await httpClient.post('/members', input);
    return memberDetailsResponseSchema.parse(response.data).data!;
  },
};
