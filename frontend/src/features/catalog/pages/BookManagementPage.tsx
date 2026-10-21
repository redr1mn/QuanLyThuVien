import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Pagination } from '../../../shared/components/Editorial';
import { WorkspacePage, Metrics, exportCsv } from '../../../shared/components/WorkspacePage';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import type { BookDetails } from '../../../shared/schemas/catalog';
import { catalogApi } from '../api/catalog-api';
import { useCatalogStore } from '../store/catalog-store';
import { BookEditor } from '../components/BookEditor';

export default function BookManagementPage() {
  const { items, totalCount, page, pageSize, categories, categoryId, availableOnly, isLoading, error, load, loadCategories, addCopy, isSaving } = useCatalogStore();
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<(BookDetails & { coverImage?: string | null }) | 'new' | null>(null);
  const [copyBook, setCopyBook] = useState<{ id: number; title: string } | null>(null);
  const [copiesBook, setCopiesBook] = useState<BookDetails | null>(null);
  const [message, setMessage] = useState('');
  const [detailError, setDetailError] = useState('');
  const [opening, setOpening] = useState(false);
  useEffect(() => { void load({ query: '', categoryId: undefined, availableOnly: false, page: 1, pageSize: 8 }); void loadCategories(); }, [load, loadCategories]);
  async function edit(id: number, copies = false) {
    setOpening(true); setDetailError('');
    try { const book = await catalogApi.get(id); if (copies) setCopiesBook(book); else setEditor({ ...book, coverImage: items.find(item => item.id === id)?.coverImage }); }
    catch (reason) { setDetailError(getApiErrorMessage(reason)); }
    finally { setOpening(false); }
  }
  return <WorkspacePage title="Quản lý sách">
    {!isLoading && !error && <Metrics items={[["Đầu sách phù hợp", totalCount], ["Bản sách · Trang này", items.reduce((sum, book) => sum + book.totalCopies, 0)], ["Bản sẵn sàng · Trang này", items.reduce((sum, book) => sum + book.availableCopies, 0)], ["Đầu sách hết · Trang này", items.filter(book => !book.availableCopies).length]]} />}
    <form className="ws-toolbar" onSubmit={event => { event.preventDefault(); void load({ query, page: 1 }); }}><label className="ws-field ws-search">Tìm kiếm<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tên sách, tác giả, ISBN…" type="search" /></label><label className="ws-field">Thể loại<select value={categoryId ?? ''} onChange={event => void load({ categoryId: event.target.value ? Number(event.target.value) : undefined, page: 1 })}><option value="">Tất cả thể loại</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="ws-field">Tồn kho<select value={availableOnly ? 'available' : 'all'} onChange={event => void load({ availableOnly: event.target.value === 'available', page: 1 })}><option value="all">Tất cả</option><option value="available">Còn sách</option></select></label><button>Tìm kiếm</button></form>
    <div className="ws-section-heading"><p>{totalCount} đầu sách trong mục lục</p><div className="ws-actions"><button onClick={() => exportCsv('danh-muc-sach-trang-hien-tai', [['Mã', 'Tên sách', 'Tác giả', 'Thể loại', 'NXB', 'Năm', 'Tổng', 'Còn', 'Giá'], ...items.map(book => [book.id, book.title, book.author, book.categoryName, book.publisher, book.publishYear, book.totalCopies, book.availableCopies, book.replacementPrice])])}>Xuất CSV (trang này)</button><button onClick={() => window.print()}>In danh mục</button><button className="ws-primary" onClick={() => { useCatalogStore.setState({ error: null }); setEditor('new'); }}>Thêm sách mới</button></div></div>
    {message && <p className="ws-notice" role="status">{message}</p>}{(error || detailError) && <p className="ws-notice" role="alert">{error || detailError}<button onClick={() => void load()}>Thử lại</button></p>}{(isLoading || opening) && <p role="status">Đang mở sổ dữ liệu…</p>}
    <div className="ws-table-scroll" role="region" aria-label="Bảng dữ liệu, cuộn ngang để xem đủ cột" tabIndex={0}><table className="ws-table ws-book-management-table"><thead><tr>{['Mã / Tên sách', 'Tác giả / Thể loại', 'Xuất bản', 'Tồn / Tổng', 'Đơn giá', 'Vị trí', 'Thao tác'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{items.map(book => <tr key={book.id}><td><span className="library-record book-management-id">BK-{String(book.id).padStart(3, '0')}</span><Link className="ws-management-book-title" to={`/books/${book.id}`}>{book.title}</Link></td><td>{book.author}<small>{book.categoryName}</small></td><td>{book.publisher || '—'}<small className="library-record">{book.publishYear ?? '—'}</small></td><td><div className="ws-stock-status"><span className="library-record">{book.availableCopies} / {book.totalCopies}</span><span className={`ws-stamp ${book.availableCopies ? '' : 'ws-danger'}`}>{book.availableCopies ? 'Còn sách' : 'Hết sách'}</span></div></td><td className="library-record">{book.replacementPrice.toLocaleString('vi-VN')} đ</td><td><button className="ws-shelf library-record" disabled={opening} onClick={() => void edit(book.id, true)}>Xem bản sao / Kệ</button></td><td><div className="ws-actions"><button disabled={opening || isSaving} onClick={() => void edit(book.id)}>Sửa</button><button onClick={() => { useCatalogStore.setState({ error: null }); setCopyBook(book); }}>Thêm bản sao</button></div></td></tr>)}{!items.length && !isLoading && <tr><td colSpan={7} className="ws-empty">Không có bản ghi phù hợp. Thử đổi bộ lọc hoặc thêm bản ghi mới.</td></tr>}</tbody></table></div>
    <Pagination page={page} pageSize={pageSize} totalCount={totalCount} disabled={isLoading} onChange={next => void load({ page: next })} />
    {editor && <Dialog title={`${editor === 'new' ? 'Thêm' : 'Cập nhật'} sách`} onClose={() => !isSaving && setEditor(null)}><BookEditor book={editor === 'new' ? undefined : editor} onSaved={() => { setEditor(null); setMessage('Đã lưu hồ sơ sách.'); }} /></Dialog>}
    {copiesBook && <Dialog title="Bản sao & Vị trí kệ" onClose={() => setCopiesBook(null)}><h3>{copiesBook.title}</h3><div className="ws-table-scroll"><table className="ws-table ws-copy-table"><thead><tr><th>Barcode</th><th>Kệ / Ngăn / Tầng</th><th>Trạng thái</th></tr></thead><tbody>{copiesBook.copies.map(copy => <tr key={copy.id}><td className="library-record">{copy.barcode}</td><td className="library-record ws-shelf">{copy.shelfLocation}</td><td>{copy.status}</td></tr>)}{!copiesBook.copies.length && <tr><td colSpan={3}>Chưa có bản sao.</td></tr>}</tbody></table></div></Dialog>}
    {copyBook && <Dialog title="Nhập bản sao vật lý" onClose={() => !isSaving && setCopyBook(null)}><p className="ws-book-title">{copyBook.title}</p><form onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); if (await addCopy(copyBook.id, { barcode: String(form.get('barcode')), shelfLocation: String(form.get('shelfLocation')) })) { setCopyBook(null); setMessage('Đã nhập bản sao vào kho.'); } }}><fieldset className="ws-form-grid" disabled={isSaving}><label className="ws-field">Barcode *<input name="barcode" required autoFocus /></label><label className="ws-field">Kệ / Ngăn / Tầng *<input name="shelfLocation" required /></label></fieldset>{error && <p role="alert" className="ws-notice">{error}</p>}<button className="ws-primary" disabled={isSaving}>{isSaving ? 'Đang nhập…' : 'Nhập bản sao'}</button></form></Dialog>}
  </WorkspacePage>;
}
