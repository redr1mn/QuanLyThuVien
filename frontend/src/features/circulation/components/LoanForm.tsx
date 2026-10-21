import { useEffect, useState, type FormEvent } from 'react';
import type { BookCopy } from '../../../shared/schemas/catalog';
import type { BorrowInput } from '../../../shared/schemas/circulation';
import { isBorrowDueAtValid } from '../../../shared/schemas/circulation';
import { useLoanLookupStore } from '../store/loan-lookup-store';

const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
export function LoanForm({ initialBookId, busy, onSubmit }: { initialBookId?: number; busy?: boolean; onSubmit: (input: BorrowInput) => Promise<boolean> }) {
  const { members, books, copies, bookId, pending, error: lookupError, findMembers, findBooks, selectBook } = useLoanLookupStore();
  const [memberId, setMemberId] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [selected, setSelected] = useState<Array<BookCopy & { title: string }>>([]);
  const [due, setDue] = useState(() => localDateTime(new Date(Date.now() + 7 * 86400000)));
  const [error, setError] = useState('');
  useEffect(() => { void findMembers(''); void (async () => { await findBooks(''); await selectBook(initialBookId ?? 0); })(); }, [findMembers, findBooks, selectBook, initialBookId]);
  function choose(copy: BookCopy) {
    if (selected.some(item => item.id === copy.id)) return;
    setSelected(items => [...items, { ...copy, title: books.find(book => book.id === bookId)?.title ?? '' }]);
    setError('');
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dueAt = new Date(due);
    if (!Number(memberId) || !selected.length) { setError('Chọn độc giả và ít nhất một bản sao còn sẵn.'); return; }
    if (!isBorrowDueAtValid(due)) { setError('Hạn trả phải sau hiện tại và không quá 7 ngày kể từ lúc mượn.'); return; }
    setError('');
    if (await onSubmit({ memberId: Number(memberId), copyIds: selected.map(copy => copy.id), dueAt: dueAt.toISOString() })) {
      setSelected([]); setMemberId(''); await selectBook(bookId); await findBooks(bookQuery);
    }
  }
  return <form onSubmit={submit}><fieldset disabled={busy}><div className="ws-split"><section className="ws-panel"><h2>Kiểm tra độc giả</h2>
    <label className="ws-field">Tìm độc giả<input value={memberQuery} onChange={event => setMemberQuery(event.target.value)} placeholder="Số thẻ, tên, email…" /></label>
    <button type="button" disabled={!!pending} onClick={() => { setMemberId(''); void findMembers(memberQuery); }}>Tra thẻ</button>
    <label className="ws-field">Thẻ đang hoạt động *<select value={memberId} onChange={event => setMemberId(event.target.value)} required><option value="">Chọn độc giả</option>{members.map(member => <option key={member.id} value={member.id}>{member.cardNumber} · {member.fullName}</option>)}</select></label>
    </section><section className="ws-panel"><h2>Chọn bản sao sách</h2><label className="ws-field">Tìm đầu sách<input value={bookQuery} onChange={event => setBookQuery(event.target.value)} placeholder="Tên sách, tác giả hoặc ISBN…" /></label>
    <button type="button" disabled={!!pending} onClick={() => { void selectBook(0); void findBooks(bookQuery); }}>Tra sách</button>
    <p className="ws-muted">Hiển thị tối đa 100 kết quả. Nhập từ khóa để tìm chính xác.</p>
    <label className="ws-field">Đầu sách còn bản sao<select value={bookId || ''} onChange={event => void selectBook(Number(event.target.value))}><option value="">Chọn đầu sách</option>{books.map(book => <option key={book.id} value={book.id}>{book.title} · {book.availableCopies} bản còn</option>)}</select></label>
    {pending > 0 && <p role="status">Đang tra cứu…</p>}
    {!!bookId && <><label className="ws-field">Quét barcode trong đầu sách đã chọn<input value={barcode} onChange={event => setBarcode(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); const copy = copies.find(item => item.barcode === barcode.trim()); if (copy) { choose(copy); setBarcode(''); } else setError('Barcode không thuộc bản sao còn sẵn của đầu sách này.'); } }} placeholder="Quét mã và nhấn Enter" /></label><div className="ws-check-list">{copies.map(copy => <label key={copy.id}><input type="checkbox" checked={selected.some(item => item.id === copy.id)} onChange={event => event.target.checked ? choose(copy) : setSelected(items => items.filter(item => item.id !== copy.id))} /><span className="library-record">{copy.barcode}<small>KỆ / {copy.shelfLocation}</small></span></label>)}{!pending && !copies.length && <p className="ws-empty">Không còn bản sao sẵn sàng.</p>}</div></>}
    {selected.length > 0 && <div className="ws-slip"><span className="library-record">ĐÃ CHỌN / {selected.length} BẢN</span>{selected.map(copy => <p key={copy.id}>{copy.title}<br /><span className="library-record">{copy.barcode}</span> <button type="button" aria-label={`Bỏ ${copy.barcode}`} onClick={() => setSelected(items => items.filter(item => item.id !== copy.id))}>Bỏ ×</button></p>)}</div>}
    <label className="ws-field">Hạn trả *<input type="datetime-local" value={due} min={localDateTime(new Date())} max={localDateTime(new Date(Date.now() + 7 * 86400000))} onChange={event => setDue(event.target.value)} required /></label>
    <p className="ws-muted">Thời hạn mượn tối đa 7 ngày. Hiệu lực thẻ và số sách được kiểm tra khi lập phiếu.</p>
    {(error || lookupError) && <p className="notice notice-error" role="alert">{error || lookupError}</p>}
    </section></div><button className="ws-primary" disabled={busy || !selected.length || !memberId || !!pending}>{busy ? 'Đang ghi sổ…' : 'Lập phiếu mượn →'}</button>
  </fieldset></form>;
}
