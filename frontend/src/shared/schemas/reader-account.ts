import { z } from 'zod';
import { loanSchema } from './circulation';

const profileSchema = z.object({ id: z.number(), cardNumber: z.string(), fullName: z.string(), email: z.string().nullable(), phone: z.string().nullable(), address: z.string().nullable(), memberType: z.string(), issuedAtUtc: z.string(), expiresAtUtc: z.string(), status: z.string(), maxBooks: z.number(), currentLoanCount: z.number(), overdueCount: z.number() });
const reservationSchema = z.object({ id: z.number(), memberId: z.number(), bookId: z.number(), bookTitle: z.string(), status: z.string(), createdAtUtc: z.string(), expiresAtUtc: z.string().nullable() });
export const readerAccountResponseSchema = z.object({ data: z.object({ profile: profileSchema, currentLoans: z.array(loanSchema), history: z.array(loanSchema), reservations: z.array(reservationSchema), outstandingFines: z.number() }).nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
export type ReaderAccount = z.infer<typeof readerAccountResponseSchema>['data'];
