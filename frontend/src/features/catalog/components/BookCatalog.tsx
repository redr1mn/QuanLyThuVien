// Presentation ported from qlthuvien_old/QuanLyThuVien/ClientApp/src/components/BookCatalog.tsx.
// REST data is supplied by CatalogPage; the old mock inventory and simulated loans are removed.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Category } from '../../../shared/schemas/catalog';
type Slip = { kind: 'reserve'; date: string; due?: string };
type Availability = 'all' | 'available';
type ViewMode = 'grid' | 'ledger';
const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
const formatDate = (d: Date) => d.toLocaleDateString('vi-VN');
export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  publisher: string;
  publishYear: number | string;
  price: number;
  location: string; // VD: "KỆ A2 · TẦNG 3"
  availableQuantity: number;
  totalQuantity: number;
  coverImage: string;
  description: string;
}

const STYLES = `
.bc-root .font-serif{font-family:var(--font-serif)}
.bc-root .font-mono{font-family:var(--font-mono)}
.bc-root .font-sans{font-family:var(--font-sans)}
@keyframes bc-stamp{0%{opacity:0;transform:scale(2.4) rotate(-14deg)}60%{opacity:1;transform:scale(.94) rotate(-6deg)}100%{opacity:.92;transform:scale(1) rotate(-6deg)}}
.bc-stamp-in{animation:bc-stamp .45s cubic-bezier(.2,.9,.3,1) both}
@media (prefers-reduced-motion:reduce){.bc-stamp-in{animation:none;opacity:.92;transform:rotate(-6deg)}}
`;

function AvailabilityStamp({ book }: { book: Book }) {
  const inStock = book.availableQuantity > 0;
  return (
    <span
      className={`inline-block border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest -rotate-2 ${
        inStock
          ? 'border-[#1E3A5F] text-[#1E3A5F] bg-[#1E3A5F]/5'
          : 'border-[#8C2D19] text-[#8C2D19] bg-[#8C2D19]/5'
      }`}
    >
      {inStock ? `[LƯU HÀNH: CÒN ${book.availableQuantity} BẢN]` : '[TẠM HẾT KHO]'}
    </span>
  );
}

function Cover({ book, lift = false, stamp = false }: { book: Book; lift?: boolean; stamp?: boolean }) {
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden border border-[#D2CBB8] bg-[#E8E3D8] ${
        lift
          ? 'transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:shadow-[-6px_6px_0px_#141413]'
          : ''
      }`}
    >
      <span className="absolute inset-0 flex items-center justify-center p-4 text-center font-serif text-lg italic text-[#5C5954]">
        {book.title}
      </span>
      {book.coverImage && <img
        src={book.coverImage}
        alt={`Bìa sách ${book.title}`}
        loading="lazy"
        // Ẩn ảnh lỗi để lộ tên sách ở lớp phía dưới, thay vì hiện biểu tượng ảnh hỏng.
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        className="absolute inset-0 h-full w-full object-cover sepia-[.2] contrast-95"
      />}
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-1.5 border-l border-[#D2CBB8] bg-[repeating-linear-gradient(180deg,#F4F1EA_0_2px,#D2CBB8_2px_3px)]"
      />
      {stamp && (
        <span className="absolute bottom-3 left-3 bg-[#F4F1EA]/90">
          <AvailabilityStamp book={book} />
        </span>
      )}
    </div>
  );
}


interface Props {
  books: Book[]; categories: Category[]; totalCount: number; page: number; pageSize: number;
  query: string; category: string; availability: Availability;
  isLoading: boolean; error: string | null; categoryError: string | null;
  selected: Book | null; detailLoading: boolean; detailError: string | null;
  selectedIsbn?: string | null; copyList: ReactNode; receipt?: Slip; isSaving: boolean; actionError: string | null; canBorrow: boolean;
  onQuery: (value: string) => void; onCategory: (value: string) => void;
  onAvailability: (value: Availability) => void; onPage: (value: number) => void;
  onReset: () => void; onRetry: () => void; onRetryCategories: () => void;
  onSelect: (id: number | null) => void; onAction: (book: Book) => void;
}
export default function BookCatalog({ books, categories, totalCount, page, pageSize, query, category, availability, isLoading, error, categoryError, selected, detailLoading, detailError, selectedIsbn, copyList, receipt, isSaving, actionError, canBorrow, onQuery: changeQuery, onCategory: changeCategory, onAvailability: changeAvailability, onPage: setPage, onReset: resetFilters, onRetry, onRetryCategories, onSelect: setSelectedId, onAction }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = books;
  const totalCopies = books.reduce((sum, book) => sum + book.totalQuantity, 0);
  const availCopies = books.reduce((sum, book) => sum + book.availableQuantity, 0);
  const availTitles = books.filter(book => book.availableQuantity > 0).length;
  const readyRate = totalCopies ? Math.round(availCopies / totalCopies * 100) : 0;
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!selected) return;
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { dialog?.close(); trigger?.focus(); };
  }, [selected?.id]);
  const ghostBtn =
    'font-sans text-sm border border-[#D2CBB8] px-2.5 py-1 transition-colors hover:bg-[#141413] hover:text-[#F4F1EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8C2D19]';

  return (
    <div className="bc-root min-h-screen bg-[#F4F1EA] font-sans text-[#141413] border-t border-[#D2CBB8] lg:grid lg:grid-cols-12">
      <style>{STYLES}</style>

      <aside className="border-b border-[#D2CBB8] p-6 font-sans lg:sticky lg:top-0 lg:col-span-3 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <h2 className="mt-2 font-serif text-3xl font-medium leading-tight tracking-tight">
          Sổ Cái <span className="italic text-[#5C5954]">Ấn Bản</span>
        </h2>

        <dl className="mt-6 border-t border-[#D2CBB8] font-mono text-xs uppercase tracking-wider tabular-nums">
          {[
            ['Tổng số ấn bản', pad(totalCount)],
            ['Bản in / trang', pad(totalCopies)],
            ['Sẵn sàng / trang', pad(availCopies)],
            ['Đầu sách còn / trang', `${pad(availTitles, 2)}/${pad(books.length, 2)}`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-b border-dashed border-[#D2CBB8] py-2.5">
              <dt className="text-[#5C5954]">{k}</dt>
              <dd className="text-sm text-[#141413]">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-2 text-xs text-[#5C5954]">Số bản in và tỷ lệ được tính trên trang đang hiển thị.</p>
        <div className="mt-4">
          <div className="flex justify-between font-mono text-xs uppercase tracking-wider tabular-nums text-[#5C5954]">
            <span>Tỷ lệ sẵn sàng / trang</span><span>{readyRate}%</span>
          </div>
          <div className="mt-1.5 h-2 border border-[#D2CBB8] bg-[#E8E3D8]">
            <div className="h-full bg-[#1E3A5F]" style={{ width: `${readyRate}%` }} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => changeAvailability(availability === 'available' ? 'all' : 'available')}
          aria-pressed={availability === 'available'}
          className={`mt-2 w-full border px-3 py-2 text-left font-sans text-sm transition-colors ${
            availability === 'available'
              ? 'border-[#8C2D19] bg-[#8C2D19] text-[#F4F1EA]'
              : 'border-[#D2CBB8] text-[#5C5954] hover:bg-[#E8E3D8] hover:text-[#141413]'
          }`}
        >
          {availability === 'available' ? '[✓] ' : '[ ] '}Chỉ bản lưu hành
        </button>

        {categoryError && <p role="alert" className="notice notice-error">Không tải được thể loại.<button onClick={onRetryCategories}>Thử lại</button></p>}
        <ul className="bc-category-filters mt-2 border-t border-[#D2CBB8]">
          {categories.map((c) => {
            const n = books.filter((b) => b.category === c.name).length;
            const active = category === String(c.id);
            return (
              <li key={c.id} className="border-b border-[#D2CBB8]">
                <button
                  type="button"
                  onClick={() => changeCategory(active ? '' : String(c.id))}
                  aria-pressed={active}
                  className={`block w-full px-1 py-2.5 text-left font-sans text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C2D19] ${
                    active ? 'bg-[#8C2D19] text-[#F4F1EA]' : 'text-[#141413] hover:bg-[#E8E3D8]'
                  }`}
                >
                  <span className="flex justify-between tabular-nums">
                    <span>{c.name}</span><span className="font-mono text-xs uppercase tracking-wider tabular-nums">↗</span>
                  </span>
                  <span aria-hidden="true" className={`mt-1.5 block h-1 transition-colors ${active ? 'bg-[#F4F1EA]/25' : 'bg-[#E8E3D8]'}`}>
                    <span
                      className={`block h-full transition-colors ${active ? 'bg-[#F4F1EA]' : 'bg-[#1E3A5F]'}`}
                      style={{ width: `${(n / Math.max(books.length, 1)) * 100}%` }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 font-serif text-sm italic leading-snug text-[#5C5954] normal-case">
          Mỗi cuốn sách được ghi vào sổ là một cuộc hẹn chưa nói hết.
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider tabular-nums text-[#5C5954]">
          Cập nhật: {formatDate(new Date())}
        </p>
      </aside>

      <section className="lg:col-span-9" aria-labelledby="catalog-title">
        <header className="bc-catalog-header flex flex-col gap-3 border-b border-[#D2CBB8] bg-[#F4F1EA] px-6 py-4 lg:px-8 lg:py-5">
          <h1 id="catalog-title" className="sr-only">
            Tra Cứu &amp; Chi Tiết Sách Thư Viện
          </h1>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="bc-search" className="font-sans text-sm font-medium text-[#141413]">
                Phiếu tra cứu
              </label>
              <span className="font-sans text-xs text-[#5C5954]">Nhập tên sách hoặc tác giả để tra cứu nhanh</span>
            </div>
            <input
              id="bc-search"
              type="search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Ví dụ: Truyện Kiều, Hawking, kiến trúc…"
              className="min-h-11 w-full rounded-none border border-[#D2CBB8] bg-[#E8E3D8]/60 px-4 py-2.5 font-sans text-base placeholder:text-[#5C5954]/70 focus:border-[#8C2D19] focus:bg-[#F4F1EA] focus:outline-none"
            />
          </div>

          <div className="flex flex-col items-start gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="inline-flex max-w-full border border-[#D2CBB8]" role="group" aria-label="Chế độ xem">
              {([
                ['grid', 'Lưới ấn bản'],
                ['ledger', 'Gáy sách / Sổ cái'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={viewMode === key}
                  onClick={() => setViewMode(key)}
                  className={`min-h-11 px-3.5 py-2 font-sans text-sm transition-colors ${
                    viewMode === key ? 'bg-[#141413] text-[#F4F1EA]' : 'text-[#5C5954] hover:bg-[#E8E3D8] hover:text-[#141413]'
                  }`}
                >
                  {key === 'grid' ? '▦ ' : '☰ '}{label}
                </button>
              ))}
            </div>

          <p className="font-mono text-xs uppercase tracking-wider tabular-nums text-[#5C5954]" aria-live="polite">
            {totalCount === 0
              ? 'Không có ấn bản nào khớp phiếu tra cứu'
              : `Hiển thị ${pad(start + 1)}–${pad(start + pageItems.length)} / ${pad(totalCount)} ấn bản`}
          </p>
          </div>
        </header>

        {isLoading ? <div className="loading-panel" role="status">Đang tải danh mục…</div> : error ? <div className="notice notice-error" role="alert"><strong>Không thể tải danh mục</strong><span>{error}</span><button className={ghostBtn} onClick={onRetry}>Thử lại</button></div> : totalCount === 0 ? (
          <div className="border-b border-[#D2CBB8] p-10 text-center">
            <p className="font-serif text-2xl italic text-[#5C5954]">Ngăn kệ này chưa có ấn bản nào.</p>
            <p className="mt-2 text-sm text-[#5C5954]">Thử đổi từ khóa, chọn thể loại khác hoặc xóa bộ lọc để xem toàn bộ kho.</p>
            <button type="button" onClick={resetFilters} className={`mt-5 ${ghostBtn}`}>
              Xóa bộ lọc
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 border-l border-t border-[#D2CBB8] sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((book, i) => (
              <article
                key={book.id}
                className="group flex flex-col border-b border-r border-[#D2CBB8] bg-[#F4F1EA] px-6 py-4 transition-colors duration-300 hover:bg-[#E8E3D8]/50"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-mono text-xs tabular-nums text-[#5C5954]">{pad(start + i + 1)}</span>
                  <span className="border border-[#D2CBB8] bg-[#E8E3D8] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider tabular-nums text-[#1E3A5F]">
                    {book.location}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(book.id)}
                  aria-label={`Chi tiết sách ${book.title}`}
                  className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8C2D19]"
                >
                  <Cover book={book} lift stamp />
                </button>

                <div className="bc-book-summary mt-3 flex flex-1 flex-col gap-1">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#8C2D19]">{book.category}</p>
                  <h3 className="line-clamp-2 font-serif text-xl font-medium leading-tight tracking-tight text-[#141413]">
                    {book.title}
                  </h3>
                  <p className="font-sans text-sm italic text-[#5C5954]">{book.author}</p>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-dashed border-[#D2CBB8] pt-1">
                  <span className="whitespace-nowrap font-mono text-xs uppercase tracking-wider tabular-nums text-[#5C5954]">
                    {formatPrice(book.price)} · {book.publishYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedId(book.id)}
                    className="min-h-8 whitespace-nowrap font-sans text-sm text-[#141413] transition-colors group-hover:text-[#8C2D19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C2D19]"
                  >
                    Chi tiết sách →
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[#D2CBB8]">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-[#E8E3D8]/60 font-mono text-[11px] uppercase tracking-wider text-[#5C5954]">
                  {['STT', 'Ấn bản', 'Thể loại', 'Tọa độ kệ', 'Năm XB', 'Tồn kho', 'Tình trạng', ''].map((h, i) => (
                    <th key={i} scope="col" className="border-b border-[#D2CBB8] px-4 py-3 font-normal">{h === 'Tọa độ kệ' ? 'Mã hồ sơ' : h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((book, i) => (
                  <tr
                    key={book.id}
                    onClick={() => setSelectedId(book.id)}
                    className="group cursor-pointer border-b border-[#D2CBB8] transition-colors hover:bg-[#E8E3D8]/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-[#5C5954]">
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`block h-14 w-3 border-x border-[#141413]/30 ${book.availableQuantity > 0 ? 'bg-[#1E3A5F]' : 'bg-[#8C2D19]'}`}
                        />
                        {pad(start + i + 1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-1 font-serif text-lg font-medium leading-tight tracking-tight">{book.title}</p>
                      <p className="font-sans text-sm italic text-[#5C5954]">{book.author}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[#8C2D19]">{book.category}</td>
                    <td className="px-4 py-3 font-mono text-xs uppercase tracking-wider tabular-nums text-[#1E3A5F]">{book.location}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{book.publishYear}</td>
                    <td className="px-4 py-3 font-mono text-xs uppercase tracking-wider tabular-nums">
                      {pad(book.availableQuantity, 2)}/{pad(book.totalQuantity, 2)}
                    </td>
                    <td className="px-4 py-3"><AvailabilityStamp book={book} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedId(book.id); }}
                        className="whitespace-nowrap font-sans text-sm transition-colors group-hover:text-[#8C2D19]"
                      >
                        Chi tiết sách →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalCount > 0 && !isLoading && !error && (
          <nav
            aria-label="Phân trang"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D2CBB8] bg-[#E8E3D8]/40 px-6 py-4 font-sans text-sm"
          >
            <button
              type="button"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="transition-colors hover:text-[#8C2D19] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-inherit"
            >
              Trang trước
            </button>
            <div className="flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === safePage ? 'page' : undefined}
                  className={`h-8 w-8 border font-mono text-xs tabular-nums transition-colors ${n > 1 ? '-ml-px' : ''} ${
                    n === safePage
                      ? 'relative z-10 border-[#8C2D19] bg-[#8C2D19] text-[#F4F1EA]'
                      : 'border-[#D2CBB8] hover:bg-[#E8E3D8]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="transition-colors hover:text-[#8C2D19] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-inherit"
            >
              Trang sau
            </button>
          </nav>
        )}
      </section>

      {selected && (() => {
        const slip = receipt;
        const inStock = selected.availableQuantity > 0;
        const code = `HS-${pad(selected.id)}`;
        return (
          <dialog className="bc-folio" aria-labelledby="bc-folio-title" ref={dialogRef} onCancel={(event) => { event.preventDefault(); setSelectedId(null); }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
          >
            <div
              role="document"

              aria-labelledby="bc-folio-title"
              className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-none border-2 border-[#141413] bg-[#F4F1EA] text-[#141413] shadow-[12px_12px_0px_#141413] md:grid md:grid-cols-12"
            >
              <section className="md:col-span-5 md:border-r border-[#D2CBB8]">
                <div className="bg-[#E8E3D8] p-6">
                  <div className="mx-auto max-w-[220px]"><Cover book={selected} /></div>
                </div>

                <div className="p-5">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[#5C5954]">Phiếu thông tin ấn bản</p>
                  <dl className="border border-[#D2CBB8] bg-[#F4F1EA] font-mono text-xs uppercase tracking-wider tabular-nums">
                    {[
                      ['Mã hồ sơ', code],
                      ['Tổng số bản', pad(selected.totalQuantity, 2)],
                      ['Số bản sẵn có', pad(selected.availableQuantity, 2)],
                      ['Giá trị lưu trữ', formatPrice(selected.price)],
                      ['Vị trí kệ', selected.location],
                      ['Mã ISBN', selectedIsbn || '—'],
                    ].map(([k, v], i, arr) => (
                      <div key={k} className={`flex justify-between gap-3 px-3 py-2 ${i < arr.length - 1 ? 'border-b border-[#D2CBB8]' : ''}`}>
                        <dt className="text-[#5C5954]">{k}</dt>
                        <dd className={`text-right ${k === 'Vị trí kệ' ? 'text-[#1E3A5F]' : ''}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 flex min-h-[92px] items-center justify-center border border-dashed border-[#D2CBB8] p-3">
                    {slip ? (
                      <div
                        key={`${selected.id}-${slip.date}`}
                        className="bc-stamp-in border-2 px-3 py-2 text-center font-mono text-[11px] font-bold uppercase leading-snug tracking-widest border-[#8C2D19] text-[#8C2D19] bg-[#8C2D19]/5"
                      >
                        <span className="block">[ĐÃ GHI NHẬN PHIẾU — NGÀY HÔM NAY]</span>
                        <span className="mt-1 block tabular-nums">
                          Đặt trước · {slip.date}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-widest text-[#5C5954]/70">{detailLoading ? "Đang mở hồ sơ…" : "— Hồ sơ lưu trữ —"}</span>
                    )}
                  </div>
                </div>
              </section>

              <section className="relative flex flex-col p-6 md:col-span-7 md:p-8">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-5 bg-gradient-to-r from-[#141413]/15 to-transparent md:block" />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs uppercase tracking-wider tabular-nums text-[#5C5954]">Hồ sơ {code}</span>
                  <button type="button" onClick={() => setSelectedId(null)} className={ghostBtn}>
                    [ĐÓNG ✕]
                  </button>
                </div>

                <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-[#8C2D19]">{selected.category}</p>
                <h2 id="bc-folio-title" className="mt-1.5 font-serif text-2xl font-medium leading-tight tracking-tight md:text-3xl">
                  {selected.title}
                </h2>
                <p className="mt-1 font-serif text-lg italic text-[#5C5954]">{selected.author}</p>

                <dl className="mt-5 border-t border-[#D2CBB8] text-sm">
                  {[
                    ['Nhà xuất bản', selected.publisher],
                    ['Năm xuất bản', String(selected.publishYear)],
                    ['Thể loại', selected.category],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-[#D2CBB8] py-2">
                      <dt className="font-mono text-xs uppercase tracking-wider text-[#5C5954]">{k}</dt>
                      <dd className={`text-right ${k === 'Năm xuất bản' ? 'font-mono tabular-nums' : ''}`}>{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#5C5954]">Tóm tắt &amp; ghi chú lưu trữ</p>
                  <p className="mt-2 border-l-2 border-[#8C2D19] pl-4 font-sans text-sm leading-relaxed">{selected.description}</p>
                </div>

                {detailError && <div role="alert" className="notice notice-error">{detailError}<button onClick={() => setSelectedId(selected.id)}>Thử lại</button></div>}
                {actionError && <p role="alert" className="notice notice-error">{actionError}</p>}
                {copyList}
                <div className="mt-auto pt-8">
                  {slip ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-default bg-[#5C5954] px-6 py-3.5 font-sans text-sm text-[#F4F1EA] sm:w-auto"
                    >
                      Phiếu đã được ghi nhận ✓
                    </button>
                  ) : inStock ? (
                    <button
                      type="button"
                      onClick={() => onAction(selected)}
                      disabled={!canBorrow || detailLoading || !!detailError} className="w-full disabled:opacity-60 bg-[#141413] px-6 py-3.5 font-sans text-sm text-[#F4F1EA] transition-colors hover:bg-[#1E3A5F] sm:w-auto"
                    >
                      {canBorrow ? 'Lập phiếu mượn ấn bản' : 'Mượn tại quầy bằng thẻ thư viện'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAction(selected)}
                      disabled={isSaving || detailLoading || !!detailError} className="w-full disabled:opacity-60 bg-[#8C2D19] px-6 py-3.5 font-sans text-sm text-[#F4F1EA] transition-colors hover:bg-[#6e2212] sm:w-auto"
                    >
                      {isSaving ? 'Đang ghi danh…' : 'Ghi danh đặt trước (chờ luân chuyển)'}
                    </button>
                  )}
                </div>
              </section>
            </div>
          </dialog>
        );
      })()}
    </div>
  );
}
