import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().nullable().optional(),
});

export const authSessionSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  role: z.enum(['Reader', 'Staff', 'Admin']),
});

export const authEnvelopeSchema = z.object({
  data: authSessionSchema.nullable(),
  errors: z.array(apiErrorSchema),
});

export const loginInputSchema = z.object({
  username: z.string().trim().min(1, 'Nhập tên đăng nhập hoặc email.').max(100),
  password: z.string().min(1, 'Nhập mật khẩu.').max(128),
  rememberMe: z.boolean(),
});

export const registerInputSchema = z.object({
  username: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
  fullName: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
}).refine((input) => input.password === input.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu xác nhận không khớp.',
});

export const registrationEnvelopeSchema = z.object({
  data: z.object({ cardNumber: z.string().min(1) }).nullable(),
  errors: z.array(apiErrorSchema),
});

export type AuthSession = z.infer<typeof authSessionSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = {
  username: string;
  password: string;
  rememberMe: boolean;
};
