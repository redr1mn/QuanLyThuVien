import { httpClient } from '../../../shared/api/http-client';
import { memberDetailsResponseSchema, memberPageResponseSchema, type CreateMemberInput, type UpdateMemberInput } from '../../../shared/schemas/members';

export const membersApi = {
  async get(id: number) {
    const response = await httpClient.get(`/members/${id}`);
    const result = memberDetailsResponseSchema.parse(response.data).data;
    if (!result) throw new Error('Không tìm thấy hồ sơ độc giả.');
    return result;
  },
  async update(id: number, input: UpdateMemberInput) {
    const response = await httpClient.put(`/members/${id}`, input);
    const result = memberDetailsResponseSchema.parse(response.data).data;
    if (!result) throw new Error('Không nhận được hồ sơ đã cập nhật.');
    return result;
  },
  async list(params: { query?: string; status?: string; page?: number; pageSize?: number }) {
    const response = await httpClient.get('/members', { params });
    return memberPageResponseSchema.parse(response.data).data!;
  },
  async create(input: CreateMemberInput) {
    const response = await httpClient.post('/members', input);
    return memberDetailsResponseSchema.parse(response.data).data!;
  },
};
