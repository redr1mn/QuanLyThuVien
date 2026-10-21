import { z } from 'zod';

export const memberSchema = z.object({
  id: z.number(), cardNumber: z.string(), fullName: z.string(), email: z.string().nullable(), phone: z.string().nullable(), address: z.string().nullable(), memberType: z.string(), issuedAtUtc: z.string(), expiresAtUtc: z.string(), status: z.enum(['Active', 'Suspended', 'Expired']), maxBooks: z.number().int(), currentLoanCount: z.number().int().nonnegative(), overdueCount: z.number().int().nonnegative(),
});
export const memberListItemSchema = memberSchema.pick({ id: true, cardNumber: true, fullName: true, email: true, phone: true, memberType: true, expiresAtUtc: true, status: true, currentLoanCount: true, overdueCount: true });
export const memberPageResponseSchema = z.object({ data: z.object({ items: z.array(memberListItemSchema), page: z.number(), pageSize: z.number(), totalCount: z.number() }).nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export const memberDetailsResponseSchema = z.object({ data: memberSchema.nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export type MemberListItem = z.infer<typeof memberListItemSchema>;
export type CreateMemberInput = { cardNumber: string; fullName: string; email?: string; phone?: string; address?: string; memberType: string; maxBooks: number; expiresAtUtc: string };
export type MemberDetails = z.infer<typeof memberSchema>;
export type UpdateMemberInput = CreateMemberInput & { status: MemberDetails['status'] };
