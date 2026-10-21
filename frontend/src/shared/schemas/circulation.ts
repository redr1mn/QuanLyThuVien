import { z } from 'zod';
export const loanSchema = z.object({ id: z.number(), memberId: z.number(), memberName: z.string(), borrowedAtUtc: z.string(), dueAtUtc: z.string(), status: z.string(), copyIds: z.array(z.number()), fineTotal: z.number(), renewalCount: z.number().int().nonnegative() });
export const loansResponseSchema = z.object({ data: z.object({ items: z.array(loanSchema), page: z.number(), pageSize: z.number(), totalCount: z.number() }).nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export const loanResponseSchema = z.object({ data: loanSchema.nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export type Loan = z.infer<typeof loanSchema>;
export const returnConditionSchema = z.enum(['Normal', 'Damaged', 'Lost']);
export function isBorrowDueAtValid(value: string, now = Date.now()) {
  const dueAt = new Date(value).getTime();
  return Number.isFinite(dueAt) && dueAt > now && dueAt <= now + 7 * 86400000;
}
export const borrowInputSchema = z.object({ memberId: z.number().int().positive(), copyIds: z.array(z.number().int().positive()).min(1).refine(ids => new Set(ids).size === ids.length, 'Bản sao bị chọn trùng.'), dueAt: z.string().datetime({ offset: true }).refine(value => isBorrowDueAtValid(value), 'Hạn trả phải sau hiện tại và không quá 7 ngày.') });
export type BorrowInput = z.infer<typeof borrowInputSchema>;
export type ReturnCondition = z.infer<typeof returnConditionSchema>;
export type ReturnItem = { copyId: number; condition: ReturnCondition };
export type LoanQuery = { status?: string; overdueOnly?: boolean; memberId?: number; page?: number; pageSize?: number };
