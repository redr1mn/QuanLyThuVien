import { httpClient } from '../../../shared/api/http-client';
import {
  authEnvelopeSchema,
  registrationEnvelopeSchema,
  type AuthSession,
  type LoginInput,
  type RegisterInput,
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

  async register(input: RegisterInput): Promise<string> {
    const { confirmPassword: _confirmPassword, ...request } = input;
    const response = await httpClient.post('/auth/register', request);
    const envelope = registrationEnvelopeSchema.parse(response.data);
    if (!envelope.data) throw new Error('Đăng ký không trả về số thẻ.');
    return envelope.data.cardNumber;
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  },
};
