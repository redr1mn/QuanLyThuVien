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

export const bookDetailsSchema = z.object({
  id: z.number(), isbn: z.string().nullable().optional(), title: z.string(), author: z.string(),
  publisher: z.string().nullable().optional(), publishYear: z.number().nullable().optional(), description: z.string().nullable().optional(),
  replacementPrice: z.number(), categoryId: z.number(), categoryName: z.string(),
  copies: z.array(z.object({ id: z.number(), barcode: z.string(), shelfLocation: z.string(), status: z.string() })),
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
