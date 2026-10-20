import { z } from 'zod';

export const adminDashboardSchema = z.object({
  totalUsers: z.number(), activeUsers: z.number(), readers: z.number(), staff: z.number(), admins: z.number(),
  books: z.number(), activeLoans: z.number(), overdueLoans: z.number(),
});

export const adminUserSchema = z.object({
  id: z.string(), userName: z.string(), email: z.string().nullable(), displayName: z.string(),
  role: z.string(), isActive: z.boolean(), memberId: z.number().nullable(),
});

export const adminUsersSchema = z.object({
  items: z.array(adminUserSchema), page: z.number(), pageSize: z.number(), totalCount: z.number(),
});

export const adminDashboardEnvelopeSchema = z.object({ data: adminDashboardSchema.nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export const adminUsersEnvelopeSchema = z.object({ data: adminUsersSchema.nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export const adminActionEnvelopeSchema = z.object({ data: z.unknown().nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });

export type AdminUser = z.infer<typeof adminUserSchema>;
