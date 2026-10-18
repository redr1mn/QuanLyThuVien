import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, addMonths, available, borrow, overdueDays, returnLoan, seed, today } from '../src/components/workspace-data.ts';

test('month extension clamps to the last valid day', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2024-02-29', 12), '2025-02-28');
});
test('overdue fine never counts negative days', () => {
  assert.equal(overdueDays('2026-10-10', '2026-10-17'), 7);
  assert.equal(overdueDays('2026-10-18', '2026-10-17'), 0);
});
test('successful borrow reduces available stock and leaves original snapshot unchanged', () => {
  const s = seed();
  const next = borrow(s, 'DG001', ['S005'], addDays(today(), 14));
  assert.equal(available(next, 'S005'), available(s, 'S005') - 1);
  assert.equal(next.loans.length, s.loans.length + 1);
  assert.equal(s.loans.length, 4);
});
test('expired, locked and unknown readers are rejected', () => {
  const s = seed();
  for (const id of ['DG003', 'unknown']) assert.throws(() => borrow(s, id, ['S005'], today()));
  s.readers[0].locked = true;
  assert.throws(() => borrow(s, 'DG001', ['S005'], today()));
});
test('reader with overdue books cannot borrow', () => {
  assert.throws(() => borrow(seed(), 'DG002', ['S005'], today()), /quá hạn/);
});
test('unavailable and nonexistent books are rejected', () => {
  for (const id of ['S004', 'unknown']) assert.throws(() => borrow(seed(), 'DG001', [id], today()), /hết/);
});
test('empty, duplicate selections and borrowing over the limit are rejected', () => {
  const s = seed();
  assert.throws(() => borrow(s, 'DG001', [], today()));
  assert.throws(() => borrow(s, 'DG001', ['S005', 'S005'], today()));
  s.settings.maxBooks = 2;
  assert.throws(() => borrow(s, 'DG001', ['S005'], today()));
});
test('due dates outside the configured window are rejected', () => {
  for (const date of [addDays(today(), -1), addDays(today(), 15)]) assert.throws(() => borrow(seed(), 'DG001', ['S005'], date));
});
test('normal return restores stock and charges six overdue days', () => {
  const s = seed();
  const next = returnLoan(s, 'PM002', {});
  assert.equal(available(next, 'S004'), 1);
  assert.equal(next.loans.find(l => l.id === 'PM002').fine, 12000);
  assert.throws(() => returnLoan(next, 'PM002', {}));
});
test('lost books are not returned to available stock and incur compensation', () => {
  const s = seed();
  const next = returnLoan(s, 'PM002', { S004: 'Mất sách' });
  assert.equal(available(next, 'S004'), 0);
  assert.equal(next.books.find(b => b.id === 'S004').total, 0);
  assert.equal(next.loans.find(l => l.id === 'PM002').fine, 91000);
});
