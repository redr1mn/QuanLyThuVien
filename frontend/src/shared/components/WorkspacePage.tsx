import { useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';

// React equivalents of the old Razor page wrapper and Workspace Metrics.
export function WorkspacePage({ title, tabs, children }: { title: string; tabs?: ReadonlyArray<readonly [string, string]>; children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const active = params.get('tab') ?? tabs?.[0]?.[0];
  return <section className="library-page"><h1>{title}</h1>{tabs && <nav className="library-page-tabs" aria-label={title}>{tabs.map(([key, label]) => <a key={key} href={`?tab=${key}`} aria-current={active === key ? 'page' : undefined} onClick={event => { event.preventDefault(); setParams({ tab: key }); }}>{label}</a>)}</nav>}<div className="library-page-body">{children}</div></section>;
}
export function Metrics({ items }: { items: ReadonlyArray<readonly [string, string | number]> }) {
  return <dl className="ws-metrics">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
export function exportCsv(name: string, rows: unknown[][]) {
  const csv = rows.map(row => row.map(value => { let text = String(value ?? ''); if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`; return `"${text.replace(/"/g, '""')}"`; }).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${name}.csv`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
