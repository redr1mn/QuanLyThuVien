import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCatalog, { type Book } from '../components/BookCatalog';
import { useCatalogStore } from '../store/catalog-store';
import { useAuthStore } from '../../auth/store/auth-store';
import { useReaderAccountStore } from '../../reader-account/store/reader-account-store';
import { useReservationsStore } from '../../reservations/store/reservations-store';

export default function CatalogPage() {
  const store = useCatalogStore();
  const { items, query, load, loadCategories, totalCount } = store;
  const { user } = useAuthStore();
  const reservations = useReservationsStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(query);
  const [receipts, setReceipts] = useState<Record<number, { kind: 'reserve'; date: string }>>({});
  useEffect(() => { void load({ page: 1, pageSize: 6 }); void loadCategories(); return () => { void useCatalogStore.getState().openBook(null); }; }, [load, loadCategories]);
  useEffect(() => {
    const timer = setTimeout(() => { if (searchTerm !== query) void load({ query: searchTerm, page: 1 }); }, 350);
    return () => clearTimeout(timer);
  }, [load, query, searchTerm]);
  const books: Book[] = items.map(book => ({ id: book.id, title: book.title, author: book.author, category: book.categoryName, publisher: book.publisher || '—', publishYear: book.publishYear ?? '—', price: book.replacementPrice, location: `HS-${String(book.id).padStart(3, '0')}`, availableQuantity: book.availableCopies, totalQuantity: book.totalCopies, coverImage: book.coverImage || '', description: '' }));
  const selectedBase = books.find(book => book.id === store.selectedId) ?? null;
  const detail = store.selectedBook;
  const selected: Book | null = selectedBase ? { ...selectedBase, ...(detail ? { description: detail.description || 'Chưa có ghi chú lưu trữ.', location: [...new Set(detail.copies.map(copy => copy.shelfLocation))].join(' · ') || 'Chưa nhập bản sao', totalQuantity: detail.copies.length, availableQuantity: detail.copies.filter(copy => copy.status === 'Available').length } : { description: 'Đang tải ghi chú lưu trữ…' }) } : null;
  const canBorrow = user?.role === 'Staff' || user?.role === 'Admin';
  async function action(book: Book) {
    if (book.availableQuantity > 0 && canBorrow) { await store.openBook(null); navigate(`/staff/circulation?tab=borrow&book=${book.id}`); return; }
    if (!user) { await store.openBook(null); navigate('/login?returnUrl=/'); return; }
    if (user.role !== 'Reader') { useReservationsStore.setState({ error: 'Đặt trước cần thực hiện bằng tài khoản độc giả.' }); return; }
    const accountStore = useReaderAccountStore.getState();
    await accountStore.load();
    const account = useReaderAccountStore.getState().account;
    if (!account) { useReservationsStore.setState({ error: useReaderAccountStore.getState().error || 'Không tải được hồ sơ thẻ.' }); return; }
    if (await reservations.create(account.profile.id, book.id)) setReceipts(previous => ({ ...previous, [book.id]: { kind: 'reserve', date: new Date().toLocaleDateString('vi-VN') } }));
  }
  return <BookCatalog books={books} categories={store.categories} totalCount={totalCount} page={store.page} pageSize={store.pageSize} query={searchTerm} category={store.categoryId ? String(store.categoryId) : ''} availability={store.availableOnly ? 'available' : 'all'} isLoading={store.isLoading} error={store.error} categoryError={store.categoryError} selected={selected} detailLoading={store.detailLoading} detailError={store.detailError} selectedIsbn={detail?.isbn} isSaving={reservations.isLoading} actionError={reservations.error} receipt={selected ? receipts[selected.id] : undefined} canBorrow={canBorrow}
    onQuery={setSearchTerm} onCategory={value => void load({ categoryId: value ? Number(value) : undefined, page: 1 })} onAvailability={value => void load({ availableOnly: value === 'available', page: 1 })} onPage={page => void load({ page })} onReset={() => { setSearchTerm(''); store.resetFilters(); void load({ query: '', categoryId: undefined, availableOnly: false, page: 1 }); }} onRetry={() => void load()} onRetryCategories={() => void loadCategories()} onSelect={id => { useReservationsStore.setState({ error: null }); void store.openBook(id); }} onAction={book => void action(book)}
    copyList={detail && <section className="mx-auto mt-6 w-full max-w-[40rem]"><h3 className="text-center font-mono text-xs uppercase tracking-wider">Bản sao / Tọa độ kệ</h3><ul className="mt-2 border-t border-[#D2CBB8]">{detail.copies.map(copy => <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center justify-items-center gap-3 border-b border-[#D2CBB8] py-2 font-mono text-xs max-sm:grid-cols-1" key={copy.id}><span className="justify-self-start text-left">{copy.barcode}</span><span className="text-[#1E3A5F]">{copy.shelfLocation}</span><span className={copy.status === 'Available' ? 'text-[#1E3A5F]' : 'text-[#8C2D19]'}>{{ Available: 'Còn sách', OnLoan: 'Đang mượn', Reserved: 'Đã giữ chỗ', Lost: 'Mất sách', Damaged: 'Hư hỏng' }[copy.status]}</span></li>)}</ul>{!detail.copies.length && <p className="mt-2 text-center text-sm text-[#5C5954]">Chưa có bản sao trong kho.</p>}</section>} />;
}
