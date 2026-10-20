import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('auth API exposes registration input and response contracts', () => {
  const schema = read('src/features/auth/schemas/auth.ts');
  const api = read('src/features/auth/api/auth-api.ts');
  assert.match(schema, /registerInputSchema/);
  assert.match(schema, /registrationEnvelopeSchema/);
  assert.match(api, /auth\/register/);
});

test('SPA has React login and registration pages', () => {
  const routes = read('src/app/router/routes.tsx');
  const login = read('src/pages/auth/LoginPage.tsx');
  const register = read('src/pages/auth/RegisterPage.tsx');
  assert.match(routes, /LoginPage/);
  assert.match(routes, /RegisterPage/);
  assert.match(login, /useAuthStore/);
  assert.match(register, /useAuthStore/);
});
