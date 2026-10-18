import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

const bookListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  categoryId: z.number(),
  categoryName: z.string(),
  availableCopies: z.number().int().nonnegative(),
  totalCopies: z.number().int().nonnegative(),
});

const responseSchema = z.object({
  data: z.object({
    items: z.array(bookListItemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
  }),
  errors: z.array(z.object({ code: z.string(), message: z.string() })),
});

test('catalog response accepts a valid paged book payload', () => {
  const result = responseSchema.safeParse({
    data: {
      items: [{ id: 1, title: 'Lập trình C#', author: 'Nguyễn An', categoryId: 2, categoryName: 'Công nghệ', availableCopies: 1, totalCopies: 2 }],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    },
    errors: [],
  });

  assert.equal(result.success, true);
});

test('catalog response rejects a book payload without an id', () => {
  const result = responseSchema.safeParse({
    data: { items: [{ title: 'Thiếu mã', author: 'Unknown', categoryId: 1, categoryName: 'Khác', availableCopies: 0, totalCopies: 0 }], page: 1, pageSize: 20, totalCount: 1 },
    errors: [],
  });

  assert.equal(result.success, false);
});
