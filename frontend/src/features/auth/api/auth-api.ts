import { httpClient } from '../../../shared/api/http-client';
import {
  authEnvelopeSchema,
  type AuthSession,
  type LoginInput,
} from '../schemas/auth';

export const authApi = {
  async me(): Promise<AuthSession | null> {
    const response = await httpClient.get('/auth/me');
    return authEnvelopeSchema.parse(response.data).data;
  },

  async login(input: LoginInput): Promise<AuthSession> {
    const response = await httpClient.post('/auth/login', input);
    const envelope = authEnvelopeSchema.parse(response.data);
    if (!envelope.data) throw new Error('Đăng nhập không trả về phiên hợp lệ.');
    return envelope.data;
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  },
};
