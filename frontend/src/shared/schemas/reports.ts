import { z } from 'zod';
export const reportSchema = z.object({ activeLoans: z.number(), overdueLoans: z.number(), books: z.number(), members: z.number(), borrowVolume: z.number(), returnVolume: z.number(), topBooks: z.array(z.object({ bookId: z.number(), title: z.string(), borrowCount: z.number() })) });
export const reportResponseSchema = z.object({ data: reportSchema.nullable(), errors: z.array(z.object({ code: z.string(), message: z.string() })) });
