import { useEffect } from 'react';
import { BookTable } from '../components/BookTable';
import { useCatalogStore } from '../store/catalog-store';

export default function CatalogPage() {
  const { items, isLoading, error, query, availableOnly, load } = useCatalogStore();

  useEffect(() => { void load(); }, [load]);

  return <section aria-labelledby="catalog-title">
    <h1 id="catalog-title">Danh mục sách</h1>
    <div className="ws-actions">
      <input aria-label="Tìm sách" value={query} onChange={(event) => void load({ query: event.target.value, page: 1 })} placeholder="Tìm theo tên hoặc tác giả" />
      <label><input type="checkbox" checked={availableOnly} onChange={(event) => void load({ availableOnly: event.target.checked, page: 1 })} /> Chỉ còn sách</label>
    </div>
    {isLoading && <p role="status">Đang tải danh mục…</p>}
    {error && <p role="alert">{error}</p>}
    {!isLoading && !error && <BookTable books={items} />}
  </section>;
}
