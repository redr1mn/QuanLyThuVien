import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('role routes use real feature pages and backend-backed guards', () => {
  const routes = read('src/app/router/routes.tsx');
  assert.match(routes, /ReaderAccountPage/);
  assert.match(routes, /MembersPage/);
  assert.match(routes, /CirculationPage/);
  assert.match(routes, /ReportsPage/);
  assert.match(routes, /BookDetailsPage/);
  assert.match(routes, /AdminDashboardPage/);
  assert.match(routes, /AdminUsersPage/);
  assert.match(routes, /roles=\{\['Admin'\]\}/);
  assert.match(routes, /RequireRole/);
  assert.doesNotMatch(routes, /Workspace/);
});

test('catalog exposes a navigable book detail page', () => {
  const routes = read('src/app/router/routes.tsx');
  const table = read('src/features/catalog/components/BookTable.tsx');
  assert.match(routes, /path="books\/:id"/);
  assert.match(table, /to=\{`\/books\/\$\{book\.id\}`\}/);
});

test('SPA entry does not depend on legacy workspace components', () => {
  const entry = read('src/main.tsx');
  const app = read('src/app/App.tsx');
  assert.doesNotMatch(entry, /Workspace|BookCatalog/);
  assert.doesNotMatch(app, /Workspace|localStorage/);
});
