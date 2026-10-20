import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('vite has a browser entry document for the standalone SPA', () => {
  const html = read('index.html');
  assert.match(html, /id="root"/);
  assert.match(html, /src="\/src\/main\.tsx"/);
});

test('main entry renders the SPA application', () => {
  const source = read('src/main.tsx');
  assert.match(source, /import App from ['"]\.\/app\/App['"]/);
  assert.match(source, /document\.getElementById\(['"]root['"]\)/);
  assert.match(source, /createRoot\(rootElement\)/);
});

test('vite proxies API requests to the ASP.NET backend', () => {
  const source = read('vite.config.ts');
  assert.match(source, /proxy/);
  assert.match(source, /['"]\/api['"]/);
  assert.match(source, /5194/);
});
