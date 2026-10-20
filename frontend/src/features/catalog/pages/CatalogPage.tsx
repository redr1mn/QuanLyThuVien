import { useEffect, useState } from 'react';
import { BookTable } from '../components/BookTable';
import { useCatalogStore } from '../store/catalog-store';

export default function CatalogPage() {
  const { items, isLoading, error, query, availableOnly, page, pageSize, totalCount, load, resetFilters } = useCatalogStore();
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = setTimeout(() => { if (searchTerm !== query) void load({ query: searchTerm, page: 1 }); }, 350);
    return () => clearTimeout(timer);
  }, [load, query, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasFilters = Boolean(searchTerm || availableOnly);

  return <section className="catalog-page" aria-labelledby="catalog-title">
    <div className="catalog-heading"><div><span className="eyebrow">Danh mục thư viện</span><h1 id="catalog-title">Tra cứu sách</h1></div><span className="catalog-count">{totalCount} đầu sách</span></div>
    <div className="catalog-toolbar" role="search">
      <label className="search-field"><span>Tìm trong thư viện</span><input aria-label="Tìm sách" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tên sách hoặc tác giả" /></label>
      <label className="availability-toggle"><input type="checkbox" checked={availableOnly} onChange={(event) => void load({ availableOnly: event.target.checked, page: 1 })} /> <span>Chỉ hiện sách còn</span></label>
      {hasFilters && <button className="secondary-button" type="button" onClick={() => { setSearchTerm(''); resetFilters(); void load({ query: '', availableOnly: false, page: 1 }); }}>Đặt lại bộ lọc</button>}
    </div>
    <div className="catalog-results-heading"><span>{isLoading ? 'Đang cập nhật kết quả…' : `Hiển thị ${items.length} trong ${totalCount} đầu sách`}</span>{query && <span>Từ khoá: “{query}”</span>}</div>
    {isLoading && <div className="loading-panel" role="status"><span className="loading-dot" />Đang tải danh mục…</div>}
    {error && <div className="notice notice-error" role="alert"><strong>Không thể tải danh mục</strong><span>{error}</span><button className="secondary-button" type="button" onClick={() => void load()}>Thử lại</button></div>}
    {!isLoading && !error && <><BookTable books={items} /><div className="catalog-pagination"><button className="secondary-button" disabled={page <= 1} onClick={() => void load({ page: page - 1 })}>Trang trước</button><span>Trang {page} / {totalPages}</span><button className="secondary-button" disabled={page >= totalPages} onClick={() => void load({ page: page + 1 })}>Trang sau</button></div></>}
  </section>;
}
