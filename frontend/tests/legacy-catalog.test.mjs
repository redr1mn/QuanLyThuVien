import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const source = fs.readFileSync(new URL('../src/features/catalog/components/BookCatalog.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const executable = compiled.replace(/from (["'])(react(?:\/jsx-runtime)?)\1/g, (_, quote, name) => `from ${quote}${import.meta.resolve(name)}${quote}`);
const { default: BookCatalog } = await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`);
const noop = () => {};
// Fixtures belong only to this test; the application never imports them.
const book = { id: 42, title: 'Ấn bản kiểm thử', author: 'Tác giả kiểm thử', category: 'Thể loại', publisher: 'NXB', publishYear: 2026, price: 100000, location: 'HS-042', availableQuantity: 2, totalQuantity: 3, coverImage: '/test-cover.jpg', description: 'Ghi chú hồ sơ' };
const props = { books: [book], categories: [{ id: 1, name: 'Thể loại', slug: 'the-loai' }], totalCount: 9, page: 1, pageSize: 6, query: '', category: '', availability: 'all', isLoading: false, error: null, categoryError: null, selected: null, detailLoading: false, detailError: null, copyList: null, isSaving: false, actionError: null, canBorrow: false, onQuery: noop, onCategory: noop, onAvailability: noop, onPage: noop, onReset: noop, onRetry: noop, onRetryCategories: noop, onSelect: noop, onAction: noop };

test('ported catalog renders the original edition ledger, cover grid and view controls', () => {
  const html = renderToStaticMarkup(createElement(BookCatalog, props));
  assert.match(html, /Sổ Cái/);
  assert.match(html, /Ấn Bản/);
  assert.match(html, /Lưới ấn bản/);
  assert.match(html, /Gáy sách \/ Sổ cái/);
  assert.match(html, /alt="Bìa sách Ấn bản kiểm thử"/);
  assert.match(html, /CÒN 2 BẢN/);
  assert.match(html, /009/);
});

test('API failure renders instead of an invented stock list or empty-success state', () => {
  const html = renderToStaticMarkup(createElement(BookCatalog, { ...props, books: [], totalCount: 0, error: 'API kiểm thử không khả dụng' }));
  assert.match(html, /API kiểm thử không khả dụng/);
  assert.match(html, /Thử lại/);
  assert.doesNotMatch(html, /Ngăn kệ này chưa có/);
  assert.doesNotMatch(html, /Ấn bản kiểm thử/);
});

test('folio preserves archival metadata without claiming a successful transaction', () => {
  const html = renderToStaticMarkup(createElement(BookCatalog, { ...props, selected: { ...book, availableQuantity: 0 }, selectedIsbn: 'TEST-ISBN', copyList: createElement('p', null, 'BARCODE-42 / KỆ A2') }));
  assert.match(html, /<dialog[^>]*aria-labelledby="bc-folio-title"/);
  assert.match(html, /Phiếu thông tin ấn bản/);
  assert.match(html, /TEST-ISBN/);
  assert.match(html, /BARCODE-42 \/ KỆ A2/);
  assert.match(html, /Ghi danh đặt trước/);
  assert.doesNotMatch(html, /ĐÃ GHI NHẬN PHIẾU/);
});
