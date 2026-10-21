import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import type { BookDetails } from '../../../shared/schemas/catalog';
import { catalogApi } from '../api/catalog-api';

export default function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const bookId = Number(id);
    if (!Number.isInteger(bookId) || bookId <= 0) { setError('Mã sách không hợp lệ.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try { setBook(await catalogApi.get(bookId)); }
    catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  return <section aria-labelledby="book-details-title">
    <Link className="catalog-back-link" to="/">← Quay lại danh mục</Link>
    {isLoading && <p className="loading-panel" role="status">Đang tải thông tin sách…</p>}
    {error && <div className="notice notice-error" role="alert"><strong>Không thể tải chi tiết sách</strong><span>{error}</span><button className="secondary-button" type="button" onClick={() => void load()}>Thử lại</button></div>}
    {!isLoading && !error && book && <article className="book-details">
      <div><span className="eyebrow">{book.categoryName}</span><h1 id="book-details-title">{book.title}</h1><p className="book-details-author">{book.author}</p><p className="book-details-description">{book.description || 'Chưa có mô tả cho đầu sách này.'}</p></div>
      <dl className="book-details-meta"><div><dt>Nhà xuất bản</dt><dd>{book.publisher || '—'}</dd></div><div><dt>Năm xuất bản</dt><dd>{book.publishYear || '—'}</dd></div><div><dt>ISBN</dt><dd>{book.isbn || '—'}</dd></div><div><dt>Bản sao sẵn sàng</dt><dd>{book.copies.filter(copy => copy.status === 'Available').length} / {book.copies.length}</dd></div></dl>
      <section className="book-copy-list" aria-labelledby="book-copies-title"><h2 id="book-copies-title">Các bản sao</h2>{book.copies.length ? <ul>{book.copies.map(copy => <li key={copy.id}><span>{copy.barcode}</span><span className="ws-shelf">Kệ {copy.shelfLocation}</span><strong className={`ws-stamp ${copy.status === 'Available' ? '' : 'ws-danger'}`}>{{ Available: 'Còn sách', OnLoan: 'Đang mượn', Reserved: 'Đã giữ chỗ', Lost: 'Mất sách', Damaged: 'Hư hỏng' }[copy.status]}</strong></li>)}</ul> : <p>Chưa có bản sao được nhập.</p>}</section>
    </article>}
  </section>;
}
