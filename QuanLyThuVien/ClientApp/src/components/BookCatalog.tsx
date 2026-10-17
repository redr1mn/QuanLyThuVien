import { useEffect, useMemo, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Kiểu dữ liệu                                                       */
/* ------------------------------------------------------------------ */
export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  publisher: string;
  publishYear: number;
  price: number;
  location: string; // VD: "KỆ A2 · TẦNG 3"
  availableQuantity: number;
  totalQuantity: number;
  coverImage: string;
  description: string;
}

interface BookCatalogProps {
  /** Dữ liệu từ ASP.NET Core (Razor Model) truyền sang */
  initialBooks?: Book[];
}

type Availability = 'all' | 'available';
type ViewMode = 'grid' | 'ledger';
interface Slip {
  kind: 'borrow' | 'reserve';
  date: string;
  due?: string;
}

/* ------------------------------------------------------------------ */
/*  Dữ liệu mẫu (dùng khi không có initialBooks)                        */
/* ------------------------------------------------------------------ */
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

const MOCK_BOOKS: Book[] = [
  {
    id: 1, title: 'Truyện Kiều', author: 'Nguyễn Du', category: 'Văn học kinh điển',
    publisher: 'NXB Văn Học', publishYear: 2019, price: 128000, location: 'KỆ A2 · TẦNG 3',
    availableQuantity: 4, totalQuantity: 6, coverImage: img('1544947950-fa07a98d237f'),
    description: 'Kiệt tác thơ Nôm lục bát gồm 3.254 câu, kể về mười lăm năm chìm nổi của nàng Kiều. Bản in này đối chiếu nhiều dị bản và có chú giải điển cố ở lề.',
  },
  {
    id: 2, title: 'Việt Nam Sử Lược', author: 'Trần Trọng Kim', category: 'Lịch sử',
    publisher: 'NXB Văn Hóa Thông Tin', publishYear: 2017, price: 165000, location: 'KỆ B1 · TẦNG 2',
    availableQuantity: 0, totalQuantity: 3, coverImage: img('1481627834876-b7833e8f5570'),
    description: 'Bộ thông sử viết bằng chữ Quốc ngữ đầu tiên, đi từ thời Hồng Bàng đến đầu thế kỷ XX. Các bản in đều đang được luân chuyển nên cần ghi danh chờ.',
  },
  {
    id: 3, title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', category: 'Văn học kinh điển',
    publisher: 'NXB Kim Đồng', publishYear: 2020, price: 78000, location: 'KỆ A3 · TẦNG 1',
    availableQuantity: 7, totalQuantity: 8, coverImage: img('1512820790803-83ca734da794'),
    description: 'Cuộc phiêu lưu của chú dế trẻ kiêu ngạo đi qua bờ ruộng, ngõ cỏ và học bài học đầu tiên về tình bạn. Trang sách thơm mùi đồng nội.',
  },
  {
    id: 4, title: 'Suy Tưởng', author: 'Marcus Aurelius', category: 'Triết học',
    publisher: 'NXB Thế Giới', publishYear: 2018, price: 112000, location: 'KỆ C1 · TẦNG 4',
    availableQuantity: 2, totalQuantity: 4, coverImage: img('1495446815901-a7297e633e8d'),
    description: 'Những ghi chép riêng của vị hoàng đế - triết gia Khắc kỷ viết giữa các chiến dịch biên cương. Mỗi đoạn ngắn là một lời nhắc về sự điềm tĩnh.',
  },
  {
    id: 5, title: 'Đạo Đức Kinh', author: 'Lão Tử', category: 'Triết học',
    publisher: 'NXB Văn Học', publishYear: 2016, price: 95000, location: 'KỆ C2 · TẦNG 2',
    availableQuantity: 3, totalQuantity: 5, coverImage: img('1507842217343-583bb7270b66'),
    description: 'Tám mươi mốt chương cô đọng nền tảng của Đạo gia. Bản dịch giữ nhịp điệu của nguyên tác, kèm lời bình ở chân trang.',
  },
  {
    id: 6, title: 'Lược Sử Thời Gian', author: 'Stephen Hawking', category: 'Khoa học',
    publisher: 'NXB Trẻ', publishYear: 2021, price: 142000, location: 'KỆ D1 · TẦNG 3',
    availableQuantity: 0, totalQuantity: 4, coverImage: img('1524995997946-a1c2e315a42f'),
    description: 'Hành trình đi từ Vụ Nổ Lớn đến hố đen, được kể bằng ngôn ngữ phổ thông. Cả bốn bản đang cho mượn, danh sách chờ mở sẵn.',
  },
  {
    id: 7, title: 'Nguồn Gốc Các Loài', author: 'Charles Darwin', category: 'Khoa học',
    publisher: 'NXB Tri Thức', publishYear: 2015, price: 189000, location: 'KỆ D2 · TẦNG 1',
    availableQuantity: 1, totalQuantity: 2, coverImage: img('1516979187457-637abb4f9353'),
    description: 'Tác phẩm đặt nền móng cho thuyết tiến hóa bằng chọn lọc tự nhiên, với các minh họa chim sẻ, bồ câu và san hô.',
  },
  {
    id: 8, title: 'Kiến Trúc Nhiệt Đới Việt Nam', author: 'Lê Minh Quân', category: 'Kiến trúc & Thiết kế',
    publisher: 'NXB Xây Dựng', publishYear: 2022, price: 245000, location: 'KỆ E1 · TẦNG 2',
    availableQuantity: 3, totalQuantity: 3, coverImage: img('1532012197267-da84d127e765'),
    description: 'Khảo cứu cách mái hiên, giếng trời và lớp vỏ thông gió làm nên một nền kiến trúc thích ứng với khí hậu nóng ẩm. (Dữ liệu mẫu)',
  },
  {
    id: 9, title: 'Lưới Và Khoảng Trắng', author: 'Đặng Tuấn Kiệt', category: 'Kiến trúc & Thiết kế',
    publisher: 'NXB Mỹ Thuật', publishYear: 2023, price: 210000, location: 'KỆ E3 · TẦNG 4',
    availableQuantity: 2, totalQuantity: 3, coverImage: img('1519682337058-a94d519337bc'),
    description: 'Nhập môn trình bày theo Phong cách Thụy Sĩ: lưới cột, chữ không chân và khoảng trắng như một thành phần của bố cục. (Dữ liệu mẫu)',
  },
  {
    id: 10, title: 'Sử Ký Tư Mã Thiên', author: 'Tư Mã Thiên', category: 'Lịch sử',
    publisher: 'NXB Văn Học', publishYear: 2014, price: 220000, location: 'KỆ B3 · TẦNG 5',
    availableQuantity: 1, totalQuantity: 2, coverImage: img('1457369804613-52c61a468e7d'),
    description: 'Bộ sử đồ sộ ghi chép hơn hai nghìn năm lịch sử Trung Hoa qua các thiên bản kỷ, thế gia và liệt truyện.',
  },
];

/* ------------------------------------------------------------------ */
/*  Tiện ích                                                           */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 6;
const pad = (n: number, w = 3) => String(n).padStart(w, '0');
const formatPrice = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n)} ₫`;
const formatDate = (d: Date) => d.toLocaleDateString('vi-VN');
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

/* Font + hoạt ảnh. Font Google cần được nạp ở Index.cshtml. */
const STYLES = `
.bc-root .font-serif{font-family:var(--font-serif)}
.bc-root .font-mono{font-family:var(--font-mono)}
.bc-root .font-sans{font-family:var(--font-sans)}
@keyframes bc-stamp{0%{opacity:0;transform:scale(2.4) rotate(-14deg)}60%{opacity:1;transform:scale(.94) rotate(-6deg)}100%{opacity:.92;transform:scale(1) rotate(-6deg)}}
.bc-stamp-in{animation:bc-stamp .45s cubic-bezier(.2,.9,.3,1) both}
@media (prefers-reduced-motion:reduce){.bc-stamp-in{animation:none;opacity:.92;transform:rotate(-6deg)}}
`;

/* ------------------------------------------------------------------ */
/*  Thành phần nhỏ                                                     */
/* ------------------------------------------------------------------ */
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
      className={`relative aspect-[3/4] overflow-hidden border border-l-4 border-[#D2CBB8] border-l-[#8C2D19] bg-[#E8E3D8] ${
        lift
          ? 'transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:shadow-[-6px_6px_0px_#141413]'
          : ''
      }`}
    >
      <span className="absolute inset-0 flex items-center justify-center p-4 text-center font-serif text-lg italic text-[#5C5954]">
        {book.title}
      </span>
      <img
        src={book.coverImage}
        alt={`Bìa sách ${book.title}`}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        className="absolute inset-0 h-full w-full object-cover sepia-[.2] contrast-95"
      />
      {/* Nếp gáy sách */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
      {/* Mép giấy giả lập */}
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

/* ------------------------------------------------------------------ */
/*  Component chính                                                    */
/* ------------------------------------------------------------------ */
export default function BookCatalog({ initialBooks }: BookCatalogProps) {
  const [books, setBooks] = useState<Book[]>(() =>
    initialBooks && initialBooks.length > 0 ? initialBooks : MOCK_BOOKS
  );
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState<Availability>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [slips, setSlips] = useState<Record<number, Slip>>({});

  /* ---- Dữ liệu dẫn xuất ---- */
  const categories = useMemo(() => Array.from(new Set(books.map((b) => b.category))), [books]);

  const base = useMemo(() => {
    const q = normalize(query.trim());
    return books.filter(
      (b) =>
        (!category || b.category === category) &&
        (!q || normalize(`${b.title} ${b.author}`).includes(q))
    );
  }, [books, query, category]);

  const filtered = useMemo(
    () => (availability === 'available' ? base.filter((b) => b.availableQuantity > 0) : base),
    [base, availability]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const totalCopies = books.reduce((s, b) => s + b.totalQuantity, 0);
  const availCopies = books.reduce((s, b) => s + b.availableQuantity, 0);
  const availTitles = books.filter((b) => b.availableQuantity > 0).length;
  const readyRate = totalCopies ? Math.round((availCopies / totalCopies) * 100) : 0;

  const selected = books.find((b) => b.id === selectedId) ?? null;

  /* ---- Hành động ---- */
  const changeQuery = (v: string) => { setQuery(v); setPage(1); };
  const changeCategory = (v: string) => { setCategory(v); setPage(1); };
  const changeAvailability = (v: Availability) => { setAvailability(v); setPage(1); };
  const resetFilters = () => { setQuery(''); setCategory(''); setAvailability('all'); setPage(1); };

  const submitSlip = (book: Book) => {
    if (slips[book.id]) return;
    const now = new Date();
    const inStock = book.availableQuantity > 0;
    const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    setSlips((s) => ({
      ...s,
      [book.id]: { kind: inStock ? 'borrow' : 'reserve', date: formatDate(now), due: inStock ? formatDate(due) : undefined },
    }));
    if (inStock) {
      setBooks((bs) => bs.map((b) => (b.id === book.id ? { ...b, availableQuantity: b.availableQuantity - 1 } : b)));
    }
  };

  /* ---- Đóng modal bằng Esc, khóa cuộn nền ---- */
  useEffect(() => {
    if (selectedId === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  /* ---- Style dùng chung ---- */
  const ghostBtn =
    'font-sans text-sm border border-[#D2CBB8] px-2.5 py-1 transition-colors hover:bg-[#141413] hover:text-[#F4F1EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8C2D19]';

  /* ================================================================ */
  return (
    <div className="bc-root min-h-screen bg-[#F4F1EA] font-sans text-[#141413] border-t border-[#D2CBB8] lg:grid lg:grid-cols-12">
      <style>{STYLES}</style>

      {/* ============ COLOPHON SIDEBAR ============ */}
      <aside className="border-b border-[#D2CBB8] p-6 font-sans lg:sticky lg:top-0 lg:col-span-3 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <h2 className="mt-2 font-serif text-3xl font-medium leading-tight tracking-tight">
          Sổ Cái <span className="italic text-[#5C5954]">Ấn Bản</span>
        </h2>

        <dl className="mt-6 border-t border-[#D2CBB8] font-mono text-xs uppercase tracking-wider tabular-nums">
          {[
            ['Tổng số ấn bản', pad(books.length)],
            ['Tổng số bản in', pad(totalCopies)],
            ['Bản sẵn sàng', pad(availCopies)],
            ['Đầu sách còn bản', `${pad(availTitles, 2)}/${pad(books.length, 2)}`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-b border-dashed border-[#D2CBB8] py-2.5">
              <dt className="text-[#5C5954]">{k}</dt>
              <dd className="text-sm text-[#141413]">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <div className="flex justify-between font-mono text-xs uppercase tracking-wider tabular-nums text-[#5C5954]">
            <span>Tỷ lệ lưu hành</span><span>{readyRate}%</span>
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

        <ul className="bc-category-filters mt-2 border-t border-[#D2CBB8]">
          {categories.map((c) => {
            const n = books.filter((b) => b.category === c).length;
            const active = category === c;
            return (
              <li key={c} className="border-b border-[#D2CBB8]">
                <button
                  type="button"
                  onClick={() => changeCategory(active ? '' : c)}
                  aria-pressed={active}
                  className={`block w-full px-1 py-2.5 text-left font-sans text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C2D19] ${
                    active ? 'bg-[#8C2D19] text-[#F4F1EA]' : 'text-[#141413] hover:bg-[#E8E3D8]'
                  }`}
                >
                  <span className="flex justify-between tabular-nums">
                    <span>{c}</span><span className="font-mono text-xs uppercase tracking-wider tabular-nums">{pad(n, 2)}</span>
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

      {/* ============ THE STACKS ============ */}
      <main className="lg:col-span-9">
        {/* ---- Section 1: Header & Filter ---- */}
        <header className="bc-catalog-header flex flex-col gap-3 border-b border-[#D2CBB8] bg-[#F4F1EA] px-6 py-4 lg:px-8 lg:py-5">
          <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            Tra Cứu &amp; Chi Tiết Sách Thư Viện
          </h1>

          {/* Phiếu tra cứu */}
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

          {/* Chế độ xem */}
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
            {filtered.length === 0
              ? 'Không có ấn bản nào khớp phiếu tra cứu'
              : `Hiển thị ${pad(start + 1)}–${pad(start + pageItems.length)} / ${pad(filtered.length)} ấn bản`}
          </p>
          </div>
        </header>

        {/* ---- Section 2: Kệ sách ---- */}
        {filtered.length === 0 ? (
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
                    <th key={i} scope="col" className="border-b border-[#D2CBB8] px-4 py-3 font-normal">{h}</th>
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

        {/* Phân trang */}
        {filtered.length > 0 && (
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
      </main>

      {/* ============ Section 3: MODAL "THE FOLIO" ============ */}
      {selected && (() => {
        const slip = slips[selected.id];
        const inStock = selected.availableQuantity > 0;
        const code = `HS-${pad(selected.id)}`;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/75 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="bc-folio-title"
              className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-none border-2 border-[#141413] bg-[#F4F1EA] text-[#141413] shadow-[12px_12px_0px_#141413] md:grid md:grid-cols-12"
            >
              {/* Trang trái */}
              <section className="md:col-span-5 md:border-r border-[#D2CBB8]">
                <div className="bg-[#E8E3D8] p-6">
                  <div className="mx-auto max-w-[220px]"><Cover book={selected} /></div>
                </div>

                <div className="p-5">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[#5C5954]">Phiếu theo dõi mượn trả</p>
                  <dl className="border border-[#D2CBB8] bg-[#F4F1EA] font-mono text-xs uppercase tracking-wider tabular-nums">
                    {[
                      ['Mã phiếu', code],
                      ['Tổng số bản', pad(selected.totalQuantity, 2)],
                      ['Số bản sẵn có', pad(selected.availableQuantity, 2)],
                      ['Giá trị lưu trữ', formatPrice(selected.price)],
                      ['Vị trí kệ', selected.location],
                      ['Hạn hoàn trả', slip?.due ?? '—'],
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
                        className={`bc-stamp-in border-2 px-3 py-2 text-center font-mono text-[11px] font-bold uppercase leading-snug tracking-widest ${
                          slip.kind === 'borrow'
                            ? 'border-[#1E3A5F] text-[#1E3A5F] bg-[#1E3A5F]/5'
                            : 'border-[#8C2D19] text-[#8C2D19] bg-[#8C2D19]/5'
                        }`}
                      >
                        <span className="block">[ĐÃ GHI NHẬN PHIẾU — NGÀY HÔM NAY]</span>
                        <span className="mt-1 block tabular-nums">
                          {slip.kind === 'borrow' ? 'Mượn' : 'Đặt trước'} · {slip.date}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-widest text-[#5C5954]/70">— Chờ đóng dấu —</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Trang phải */}
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
                      onClick={() => submitSlip(selected)}
                      className="w-full bg-[#141413] px-6 py-3.5 font-sans text-sm text-[#F4F1EA] transition-colors hover:bg-[#1E3A5F] sm:w-auto"
                    >
                      Đăng ký mượn ấn bản
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => submitSlip(selected)}
                      className="w-full bg-[#8C2D19] px-6 py-3.5 font-sans text-sm text-[#F4F1EA] transition-colors hover:bg-[#6e2212] sm:w-auto"
                    >
                      Ghi danh đặt trước (chờ luân chuyển)
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
