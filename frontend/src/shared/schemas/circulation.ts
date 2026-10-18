import { z } from 'zod';
export const loanSchema = z.object({ id: z.number(), memberId: z.number(), memberName: z.string(), borrowedAtUtc: z.string(), dueAtUtc: z.string(), status: z.string(), copyIds: z.array(z.number()), fineTotal: z.number() });
export const loansResponseSchema = z.object({ data: z.object({ items: z.array(loanSchema), page: z.number(), pageSize: z.number(), totalCount: z.number() }).nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export const loanResponseSchema = z.object({ data: loanSchema.nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export type Loan = z.infer<typeof loanSchema>;
