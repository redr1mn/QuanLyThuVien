import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Load the production schemas, rather than re-declaring their validation here.
async function schema(name) {
  const source = fs.readFileSync(new URL(`../src/shared/schemas/${name}.ts`, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled.replace(/from ['"]zod['"]/g, `from '${import.meta.resolve('zod')}'`)).toString('base64')}`);
}
const catalog = await schema('catalog');
const circulation = await schema('circulation');
const members = await schema('members');

test('book details accept every physical-copy status supported by the backend', () => {
  const book = { id: 12, isbn: null, title: 'Sách kiểm thử', author: 'Tác giả', publisher: null, publishYear: null, description: null, replacementPrice: 100000, categoryId: 1, categoryName: 'Văn học', copies: ['Available', 'OnLoan', 'Reserved', 'Lost', 'Damaged'].map((status, index) => ({ id: index + 1, barcode: `COPY-${index}`, shelfLocation: 'A-01', status })) };
  assert.equal(catalog.bookDetailsResponseSchema.parse({ data: book, errors: [] }).data.copies.length, 5);
  assert.equal(catalog.bookCopySchema.safeParse({ ...book.copies[0], status: 'Unknown' }).success, false);
});

test('book creation rejects invalid category, negative replacement price and blank titles', () => {
  const book = { title: 'Sách', author: 'Tác giả', categoryId: 1, isbn: null, publisher: null, publishYear: null, description: null, replacementPrice: 0, coverImage: null };
  assert.equal(catalog.bookInputSchema.safeParse(book).success, true);
  for (const change of [{ categoryId: 0 }, { replacementPrice: -1 }, { title: '  ' }]) assert.equal(catalog.bookInputSchema.safeParse({ ...book, ...change }).success, false);
});

test('borrow request uses distinct physical-copy IDs and a future deadline within seven days', () => {
  const valid = { memberId: 3, copyIds: [11, 12], dueAt: new Date(Date.now() + 6 * 86400000).toISOString() };
  assert.equal(circulation.borrowInputSchema.safeParse(valid).success, true);
  for (const change of [{ copyIds: [] }, { copyIds: [11, 11] }, { copyIds: [-1] }, { memberId: 0 }, { dueAt: new Date(Date.now() + 8 * 86400000).toISOString() }, { dueAt: 'invalid' }]) assert.equal(circulation.borrowInputSchema.safeParse({ ...valid, ...change }).success, false);
  const now = Date.parse('2026-10-21T03:00:00Z');
  assert.equal(circulation.isBorrowDueAtValid('2026-10-28T03:00:00Z', now), true);
  assert.equal(circulation.isBorrowDueAtValid('2026-10-28T03:00:00.001Z', now), false);
  assert.equal(circulation.isBorrowDueAtValid('2026-10-21T03:00:00Z', now), false);
});

test('return conditions and member statuses match backend enums', () => {
  for (const condition of ['Normal', 'Damaged', 'Lost']) assert.equal(circulation.returnConditionSchema.safeParse(condition).success, true);
  assert.equal(circulation.returnConditionSchema.safeParse('LightDamage').success, false);
  const member = { id: 1, cardNumber: 'LIB-TEST', fullName: 'Người đọc', email: null, phone: null, address: null, memberType: 'Reader', issuedAtUtc: '2026-10-21T00:00:00Z', expiresAtUtc: '2027-10-21T00:00:00Z', maxBooks: 5, currentLoanCount: 0, overdueCount: 0 };
  for (const status of ['Active', 'Suspended', 'Expired']) assert.equal(members.memberSchema.safeParse({ ...member, status }).success, true);
  assert.equal(members.memberSchema.safeParse({ ...member, status: true }).success, false);
});
