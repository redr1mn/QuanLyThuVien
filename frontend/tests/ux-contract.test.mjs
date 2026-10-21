import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('shared app shell exposes role-aware navigation and logout', () => {
  const shell = read('src/app/layouts/AuthenticatedLayout.tsx') + read('src/app/layouts/LibraryShell.tsx');
  assert.match(shell, /useAuthStore/);
  assert.match(shell, /Đăng xuất/);
  assert.match(shell, /aria-current/);
  assert.match(shell, /menu/);
});

test('auth forms expose password visibility and registration success feedback', () => {
  const login = read('src/pages/auth/LoginPage.tsx');
  const register = read('src/pages/auth/RegisterPage.tsx');
  const passwordField = read('src/shared/components/PasswordField.tsx');
  assert.match(passwordField, /Hiện mật khẩu|Ẩn mật khẩu/);
  assert.match(login, /registeredCardNumber/);
  assert.match(register, /cardNumber/);
});

test('catalog UX includes debounced search and explicit result states', () => {
  const catalog = read('src/features/catalog/pages/CatalogPage.tsx') + read('src/features/catalog/components/BookCatalog.tsx');
  assert.match(catalog, /setTimeout/);
  assert.match(catalog, /Thử lại/);
  assert.match(catalog, /totalCount/);
  assert.match(catalog, /Xóa bộ lọc/);
});

test('API connectivity errors explain how to start the backend', () => {
  const errors = read('src/shared/api/api-error.ts');
  assert.match(errors, /Không kết nối được API/);
  assert.match(errors, /5194/);
});
