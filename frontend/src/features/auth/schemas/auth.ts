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

export type AuthSession = z.infer<typeof authSessionSchema>;
export type LoginInput = {
  username: string;
  password: string;
  rememberMe: boolean;
};
