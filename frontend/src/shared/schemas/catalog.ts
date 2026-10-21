import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().nullable().optional(),
});

export const bookListItemSchema = z.object({
  id: z.number(),
  isbn: z.string().nullable().optional(),
  title: z.string(),
  author: z.string(),
  publisher: z.string().nullable().optional(),
  publishYear: z.number().nullable().optional(),
  categoryId: z.number(),
  categoryName: z.string(),
  replacementPrice: z.number(),
  coverImage: z.string().nullable().optional(),
  availableCopies: z.number().int().nonnegative(),
  totalCopies: z.number().int().nonnegative(),
});

export const pagedBookResponseSchema = z.object({
  data: z.object({
    items: z.array(bookListItemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
  }).nullable(),
  errors: z.array(apiErrorSchema),
});

export const bookCopySchema = z.object({ id: z.number().int().positive(), barcode: z.string(), shelfLocation: z.string(), status: z.enum(['Available', 'OnLoan', 'Reserved', 'Lost', 'Damaged']) });
export const bookInputSchema = z.object({
  title: z.string().trim().min(1, 'Nhập tên sách.'), author: z.string().trim().min(1, 'Nhập tác giả.'),
  categoryId: z.number().int().positive('Chọn thể loại.'), isbn: z.string().nullable(), publisher: z.string().nullable(),
  publishYear: z.number().int().nullable(), description: z.string().nullable(), replacementPrice: z.number().nonnegative(), coverImage: z.string().nullable(),
});
export const copyInputSchema = z.object({ barcode: z.string().trim().min(1, 'Nhập barcode.'), shelfLocation: z.string().trim().min(1, 'Nhập vị trí kệ.') });
export type BookInput = z.infer<typeof bookInputSchema>;
export type BookCopy = z.infer<typeof bookCopySchema>;
export type Category = { id: number; name: string; slug: string };

export const bookDetailsSchema = z.object({
  id: z.number(), isbn: z.string().nullable().optional(), title: z.string(), author: z.string(),
  publisher: z.string().nullable().optional(), publishYear: z.number().nullable().optional(), description: z.string().nullable().optional(),
  replacementPrice: z.number(), categoryId: z.number(), categoryName: z.string(),
  copies: z.array(bookCopySchema),
});

export const bookDetailsResponseSchema = z.object({ data: bookDetailsSchema.nullable(), errors: z.array(apiErrorSchema) });
export type BookDetails = z.infer<typeof bookDetailsSchema>;

export const categoryListResponseSchema = z.object({
  data: z.array(z.object({ id: z.number(), name: z.string(), slug: z.string() })).nullable(),
  errors: z.array(apiErrorSchema),
});

export type BookListItem = z.infer<typeof bookListItemSchema>;
export type CatalogQuery = {
  query?: string;
  categoryId?: number;
  availableOnly?: boolean;
  page?: number;
  pageSize?: number;
};
