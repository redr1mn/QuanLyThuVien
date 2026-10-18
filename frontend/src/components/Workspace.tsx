import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { addDays, addMonths, available, borrow, dateLabel, defaults, money, newId, overdueDays, returnLoan, seed, today, type BookRecord, type Employee, type Reader, type Store } from './workspace-data';
import './workspace.css';
import MembersPage from '../features/members/pages/MembersPage';

type Props = { page: 'books' | 'readers' | 'circulation' | 'account' | 'reports' | 'users' | 'settings'; tab?: string; role?: string; baseUrl?: string };
type Editor = { kind: 'book' | 'reader' | 'user'; id?: string } | null;
const storageKey = 'library-workspace-demo-v1';
const text = (f: FormData, name: string) => String(f.get(name) ?? '').trim();
const number = (f: FormData, name: string) => Number(f.get(name));
const matches = (query: string, ...values: unknown[]) => values.join(' ').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
const stamp = (label: string, danger = false) => <span className={`ws-stamp ${danger ? 'ws-danger' : ''}`}>{label}</span>;
function Field({ label, name, value, type = 'text', required = true, min, max, step }: { label: string; name: string; value?: string | number; type?: string; required?: boolean; min?: string | number; max?: string | number; step?: string | number }) {
  return <label className="ws-field">{label}<input name={name} type={type} defaultValue={value} required={required} min={min} max={max} step={step} /></label>;
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (s: string) => void; options: string[] }) {
  return <label className="ws-field">{label}<select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>;
}
function Table({ heads, rows, empty = 'Không có bản ghi phù hợp. Thử đổi bộ lọc hoặc thêm bản ghi mới.' }: { heads: string[]; rows: ReactNode[][]; empty?: string }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / 8));
  const current = Math.min(page, pages);
  return <><div className="ws-table-scroll" role="region" aria-label="Bảng dữ liệu, cuộn ngang để xem đủ cột" tabIndex={0}><table className="ws-table"><thead><tr>{heads.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr key={i} className={i < (current - 1) * 8 || i >= current * 8 ? "ws-print-only-row" : ""}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>) : <tr><td colSpan={heads.length} className="ws-empty">{empty}</td></tr>}</tbody></table></div><div className="ws-pagination"><span>{rows.length} bản ghi · Trang {current}/{pages}</span><div className="ws-actions"><button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>Trước</button><button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>Sau</button></div></div></>;
}
function Metrics({ items }: { items: [string, string | number][] }) { return <dl className="ws-metrics">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>; }
function exportCsv(name: string, rows: unknown[][]) {
  // Protect spreadsheet users from formula injection in exported user-entered strings.
  const csv = rows.map(row => row.map(v => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; }).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = `${name}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Workspace({ page, tab = '', role = '', baseUrl = '/' }: Props) {
  const [store, setStore] = useState<Store>(seed);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả thể loại');
  const [publisher, setPublisher] = useState('Tất cả nhà xuất bản');
  const [editor, setEditor] = useState<Editor>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; run: () => void } | null>(null);
  const [readerId, setReaderId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [due, setDue] = useState('');
  const [returnId, setReturnId] = useState(() => new URLSearchParams(location.search).get('loan') ?? '');
  const [conditions, setConditions] = useState<Record<string, string>>({});
  const [from, setFrom] = useState(addDays(today(), -90));
  const [to, setTo] = useState(today());
  const [period, setPeriod] = useState('90 ngày gần nhất');
  const dialog = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const s = store;
  const link = (path: string) => `${baseUrl}${path}`;
  const canCirculate = role !== 'Admin' && role !== 'Reader'; // Guests can preview only demo data.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.books) || !Array.isArray(parsed.readers) || !Array.isArray(parsed.loans) || !Array.isArray(parsed.users) || !Array.isArray(parsed.reservations) || !parsed.settings) throw Error();
        setStore(parsed);
      }
    } catch { setNotice('Không đọc được dữ liệu đã lưu. Đang dùng dữ liệu mẫu mới.'); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (editor || confirmation) { lastTrigger.current = document.activeElement as HTMLElement; dialog.current?.showModal(); }
    else { dialog.current?.close(); lastTrigger.current?.focus(); }
  }, [editor, confirmation]);
  useEffect(() => { if (ready) setDue(addDays(today(), s.settings.loanDays)); }, [ready, s.settings.loanDays]);
  function commit(next: Store, message: string) {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStore(next); setNotice(message); return true; }
    catch { setNotice('Không lưu được trên trình duyệt. Kiểm tra dung lượng hoặc quyền lưu trữ rồi thử lại.'); return false; }
  }
  function confirm(message: string, run: () => void) { setConfirmation({ message, run }); }
  const readerName = (id: string) => s.readers.find(r => r.id === id)?.name ?? id;
  const titles = (ids: string[]) => ids.map(id => s.books.find(b => b.id === id)?.title ?? id).join('; ');
  const active = s.loans.filter(l => !l.returned);
  const readerStatus = (r: Reader) => r.locked ? 'Bị khóa' : r.expires < today() ? 'Hết hạn' : r.expires <= addDays(today(), 30) ? 'Sắp hết hạn' : 'Hoạt động';
  const btn = (label: string, run: () => void, danger = false) => <button className={danger ? 'ws-danger-link' : ''} onClick={run}>{label}</button>;
  function deleteRecord(kind: 'books' | 'readers' | 'users', id: string) {
    if (kind === 'books' && (s.loans.some(l => l.books.includes(id)) || s.reservations.some(r => r.book === id))) return setNotice('Sách đã có lịch sử mượn hoặc đặt trước. Không thể xóa để bảo toàn hồ sơ.');
    if (kind === 'readers' && (s.loans.some(l => l.reader === id) || s.reservations.some(r => r.reader === id))) return setNotice('Độc giả đã có dữ liệu mượn hoặc đặt trước. Không thể xóa.');
    if (kind === 'users' && s.users.find(u => u.id === id)?.role === 'Admin' && s.users.filter(u => u.role === 'Admin' && !u.locked).length <= 1) return setNotice('Phải giữ ít nhất một quản trị viên đang hoạt động.');
    confirm(`Xóa bản ghi ${id} khỏi dữ liệu demo?`, () => commit({ ...s, [kind]: s[kind].filter(r => r.id !== id) }, 'Đã xóa bản ghi demo.'));
  }
  function saveEditor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    if (!editor) return;
    if (editor.kind === 'book') {
      const book: BookRecord = { id: editor.id ?? newId('S'), title: text(f, 'title'), author: text(f, 'author'), category: text(f, 'category'), publisher: text(f, 'publisher'), year: number(f, 'year'), price: number(f, 'price'), total: number(f, 'total'), shelf: text(f, 'shelf'), description: text(f, 'description'), cover: text(f, 'cover') };
      if (!book.title || !book.author || !book.category || !book.publisher || !book.shelf) return setNotice('Các trường bắt buộc không được chỉ chứa khoảng trắng.');
      if (book.total < active.filter(l => l.books.includes(book.id)).length) return setNotice('Tổng số bản không được nhỏ hơn số bản đang cho mượn.');
      if (!commit({ ...s, books: editor.id ? s.books.map(b => b.id === editor.id ? book : b) : [...s.books, book] }, 'Đã lưu sách trong bản demo.')) return;
    } else if (editor.kind === 'reader') {
      const old = s.readers.find(r => r.id === editor.id);
      const reader: Reader = { id: editor.id ?? newId('DG'), name: text(f, 'name'), birth: text(f, 'birth'), email: text(f, 'email'), phone: text(f, 'phone'), address: text(f, 'address'), type: text(f, 'type'), issued: old?.issued ?? today(), expires: old?.expires ?? addMonths(today(), s.settings.cardMonths), locked: old?.locked ?? false };
      if (!reader.name || !reader.address) return setNotice('Họ tên và địa chỉ không được chỉ chứa khoảng trắng.');
      if (s.readers.some(r => r.id !== reader.id && r.email.toLowerCase() === reader.email.toLowerCase())) return setNotice('Email đã được dùng cho một độc giả khác.');
      if (!commit({ ...s, readers: old ? s.readers.map(r => r.id === old.id ? reader : r) : [...s.readers, reader] }, 'Đã lưu hồ sơ độc giả demo.')) return;
    } else {
      const old = s.users.find(u => u.id === editor.id);
      const user: Employee = { id: editor.id ?? newId('NV'), name: text(f, 'name'), email: text(f, 'email'), username: text(f, 'username'), position: text(f, 'position'), role: text(f, 'role'), locked: old?.locked ?? false };
      if (!user.name || !user.username || !user.position) return setNotice('Thông tin nhân viên không được chỉ chứa khoảng trắng.');
      if (s.users.some(u => u.id !== user.id && (u.username.toLowerCase() === user.username.toLowerCase() || u.email.toLowerCase() === user.email.toLowerCase()))) return setNotice('Tên đăng nhập hoặc email đã được sử dụng.');
      if (old?.role === 'Admin' && user.role !== 'Admin' && s.users.filter(u => u.role === 'Admin' && !u.locked).length <= 1) return setNotice('Không thể đổi vai trò quản trị viên hoạt động cuối cùng.');
      if (!commit({ ...s, users: old ? s.users.map(u => u.id === old.id ? user : u) : [...s.users, user] }, 'Đã lưu nhân viên demo. Thay đổi này không tạo hoặc sửa tài khoản đăng nhập thật.')) return;
    }
    setEditor(null);
  }
  const bookRows = s.books.filter(b => matches(query, b.id, b.title, b.author) && (category === 'Tất cả thể loại' || b.category === category) && (publisher === 'Tất cả nhà xuất bản' || b.publisher === publisher) && (filter === 'Tất cả' || (filter === 'Còn sách' ? available(s, b.id) > 0 : available(s, b.id) === 0)));
  const readerRows = s.readers.filter(r => matches(query, r.id, r.name, r.phone, r.email) && (filter === 'Tất cả' || readerStatus(r) === filter));
  const loanState = (l: Store['loans'][number]) => l.returned ? 'Đã trả' : l.due < today() ? 'Quá hạn' : 'Đang mượn';
  const loanRows = s.loans.filter(l => matches(query, l.id, readerName(l.reader), titles(l.books)) && (filter === 'Tất cả' || loanState(l) === filter));
  const record = (value: ReactNode) => <span className="library-record">{value}</span>;
  const print = () => window.print();
  const search = <label className="ws-field ws-search">Tìm kiếm<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={page === 'books' ? 'Mã sách, tên sách, tác giả…' : 'Mã hồ sơ, họ tên, thông tin liên quan…'} /></label>;
  const exportLoans = (loans: Store['loans']) => exportCsv('so-muon-tra', [['Mã phiếu', 'Độc giả', 'Sách', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Trạng thái', 'Đã thu'], ...loans.map(l => [l.id, readerName(l.reader), titles(l.books), l.date, l.due, l.returned, loanState(l), l.fine])]);
  const loanTable = (loans: Store['loans'], actions = false) => <Table heads={['Phiếu / Độc giả', 'Sách', 'Ngày mượn', 'Hạn trả', 'Trạng thái', 'Tiền phạt', ...(actions ? ['Thao tác'] : [])]} rows={loans.map(l => [<>{record(l.id)}<strong>{readerName(l.reader)}</strong></>, titles(l.books), record(dateLabel(l.date)), record(dateLabel(l.due)), stamp(loanState(l), loanState(l) === 'Quá hạn'), money(l.returned ? l.fine : overdueDays(l.due) * s.settings.dailyFine * l.books.length), ...(actions ? [<div className="ws-actions"><a href={link(`Staff/Circulation?tab=return&loan=${encodeURIComponent(l.id)}`)}>{l.returned || !canCirculate ? 'Xem phiếu' : 'Trả sách'}</a></div>] : [])])} />;
  let body: ReactNode;

  if (page === 'books') body = <>
    <Metrics items={[["Đầu sách", s.books.length], ["Bản sách", s.books.reduce((n, b) => n + b.total, 0)], ["Bản đang mượn", active.reduce((n, l) => n + l.books.length, 0)], ["Đầu sách hết", s.books.filter(b => available(s, b.id) === 0).length]]} />
    <div className="ws-toolbar">{search}<Select label="Thể loại" value={category} onChange={setCategory} options={['Tất cả thể loại', ...new Set(s.books.map(b => b.category))]} /><Select label="Nhà xuất bản" value={publisher} onChange={setPublisher} options={['Tất cả nhà xuất bản', ...new Set(s.books.map(b => b.publisher))]} /><Select label="Tồn kho" value={filter} onChange={setFilter} options={['Tất cả', 'Còn sách', 'Hết sách']} /></div>
    <div className="ws-section-heading"><p>{bookRows.length} đầu sách trong mục lục</p><div className="ws-actions"><button onClick={() => exportCsv('danh-muc-sach', [['Mã', 'Tên sách', 'Tác giả', 'Thể loại', 'NXB', 'Năm', 'Tổng', 'Còn', 'Giá', 'Kệ'], ...bookRows.map(b => [b.id, b.title, b.author, b.category, b.publisher, b.year, b.total, available(s, b.id), b.price, b.shelf])])}>Xuất CSV</button><button onClick={print}>In danh mục</button><button className="ws-primary" onClick={() => setEditor({ kind: 'book' })}>Thêm sách mới</button></div></div>
    <Table heads={['Mã / Tên sách', 'Tác giả / Thể loại', 'Xuất bản', 'Tồn / Tổng', 'Đơn giá', 'Vị trí', 'Thao tác']} rows={bookRows.map(b => [<>{record(b.id)}<strong className="ws-management-book-title">{b.title}</strong></>, <>{b.author}<small>{b.category}</small></>, <>{b.publisher}<small className="library-record">{b.year}</small></>, <div className="ws-stock-status">{record(`${available(s, b.id)} / ${b.total}`)}{stamp(available(s, b.id) ? 'Còn sách' : 'Hết sách', !available(s, b.id))}</div>, money(b.price), <span className="ws-shelf library-record">{b.shelf}</span>, <div className="ws-actions">{btn('Sửa', () => setEditor({ kind: 'book', id: b.id }))}{btn('Xóa', () => deleteRecord('books', b.id), true)}</div>])} />
  </>;
  else if (page === 'readers') body = <>
    <Metrics items={[["Hồ sơ độc giả", s.readers.length], ["Thẻ còn hiệu lực", s.readers.filter(r => !r.locked && r.expires >= today()).length], ["Sắp hết hạn", s.readers.filter(r => readerStatus(r) === 'Sắp hết hạn').length], ["Thẻ hết hạn / Khóa", s.readers.filter(r => r.locked || r.expires < today()).length]]} />
    <div className="ws-toolbar">{search}<Select label="Trạng thái thẻ" value={filter} onChange={setFilter} options={['Tất cả', 'Hoạt động', 'Sắp hết hạn', 'Hết hạn', 'Bị khóa']} /><button className="ws-primary" onClick={() => setEditor({ kind: 'reader' })}>Đăng ký độc giả mới</button></div>
    <Table heads={['Mã / Độc giả', 'Liên hệ', 'Loại thẻ', 'Hạn sử dụng', 'Trạng thái', 'Thao tác']} rows={readerRows.map(r => [<>{record(r.id)}<strong>{r.name}</strong><small>Sinh ngày {dateLabel(r.birth)}</small></>, <>{r.email}<small>{r.phone}</small></>, r.type, record(dateLabel(r.expires)), stamp(readerStatus(r), r.locked || r.expires < today()), <div className="ws-actions">{btn('Sửa', () => setEditor({ kind: 'reader', id: r.id }))}{btn('Gia hạn', () => confirm(`Gia hạn thẻ ${r.id} thêm ${s.settings.cardMonths} tháng?`, () => commit({ ...s, readers: s.readers.map(item => item.id === r.id ? { ...item, expires: addMonths(item.expires < today() ? today() : item.expires, s.settings.cardMonths) } : item) }, 'Đã gia hạn thẻ demo.')))}{btn(r.locked ? 'Mở khóa' : 'Khóa', () => confirm(`${r.locked ? 'Mở khóa' : 'Khóa'} thẻ ${r.id}?`, () => commit({ ...s, readers: s.readers.map(item => item.id === r.id ? { ...item, locked: !item.locked } : item) }, 'Đã cập nhật trạng thái thẻ demo.')))}{btn('In thẻ', () => { setEditor({ kind: 'reader', id: r.id }); })}{btn('Xóa', () => deleteRecord('readers', r.id), true)}</div>])} />
  </>;
  else if (page === 'circulation') {
    const reader = s.readers.find(r => r.id === readerId);
    const loan = s.loans.find(l => l.id === returnId);
    const penalty = (id: string) => { const price = s.books.find(b => b.id === id)?.price ?? 0; const condition = conditions[id] ?? 'Bình thường'; return Math.round(price * (condition === 'Hư hỏng nhẹ' ? s.settings.lightDamage : condition === 'Hư hỏng nặng' ? s.settings.heavyDamage : condition === 'Mất sách' ? s.settings.lost : 0) / 100); };
    const late = loan ? overdueDays(loan.due) * s.settings.dailyFine * loan.books.length : 0;
    const damage = loan?.books.reduce((n, id) => n + penalty(id), 0) ?? 0;
    if (tab === 'borrow' && canCirculate) body = <form onSubmit={e => { e.preventDefault(); try { const next = borrow(s, readerId, selected, due); if (commit(next, `Đã lập phiếu ${next.loans[next.loans.length - 1].id} trong bản demo.`)) { setSelected([]); setReaderId(''); } } catch (error) { setNotice((error as Error).message); } }}>
      <div className="ws-split"><section className="ws-panel"><h2>Kiểm tra độc giả</h2><label className="ws-field">Mã hoặc tên độc giả<select value={readerId} onChange={e => setReaderId(e.target.value)} required><option value="">Chọn độc giả</option>{s.readers.map(r => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}</select></label>{reader ? <div className="ws-slip"><h3>{reader.name}</h3><p>{record(reader.id)} · {reader.type}</p>{stamp(readerStatus(reader), reader.locked || reader.expires < today())}<p>Đang mượn {active.filter(l => l.reader === reader.id).reduce((n, l) => n + l.books.length, 0)} / {s.settings.maxBooks} cuốn.</p><p>Thẻ có hiệu lực đến {dateLabel(reader.expires)}.</p>{active.some(l => l.reader === reader.id && l.due < today()) && <p className="ws-danger-link">Có sách quá hạn — cần trả sách trước khi mượn tiếp.</p>}</div> : <p className="ws-muted">Chọn độc giả để kiểm tra thẻ và số sách đang giữ.</p>}</section>
      <section className="ws-panel"><h2>Thiết lập phiếu</h2><div className="ws-slip"><p>Ngày mượn <strong>{dateLabel(today())}</strong></p><p>Tối đa {s.settings.maxBooks} cuốn · {s.settings.loanDays} ngày</p></div><label className="ws-field">Hạn trả<input type="date" value={due} onChange={e => setDue(e.target.value)} min={today()} max={addDays(today(), s.settings.loanDays)} required /></label></section></div>
      <section className="ws-panel"><h2>Chọn sách mượn</h2><div className="ws-toolbar">{search}<label className="ws-field">Thêm sách<select value="" onChange={e => { if (e.target.value && !selected.includes(e.target.value)) setSelected([...selected, e.target.value]); }}><option value="">Chọn sách còn trong kho</option>{s.books.filter(b => available(s, b.id) > 0 && !selected.includes(b.id) && matches(query, b.title, b.id, b.author)).map(b => <option key={b.id} value={b.id}>{b.id} — {b.title} ({available(s, b.id)} bản)</option>)}</select></label></div><Table heads={['Mã sách', 'Tên sách', 'Vị trí', 'Thao tác']} rows={selected.map(id => [record(id), titles([id]), record(s.books.find(b => b.id === id)?.shelf), <button type="button" onClick={() => setSelected(selected.filter(b => b !== id))}>Gỡ khỏi phiếu</button>])} empty="Chưa chọn sách. Thêm sách từ danh sách phía trên." /><button className="ws-primary" type="submit" disabled={!readerId || !selected.length}>Xác nhận lập phiếu mượn</button></section>
    </form>;
    else if (tab === 'return' && canCirculate) body = <>
      <div className="ws-toolbar">{search}<label className="ws-field">Phiếu cần xử lý<select value={returnId} onChange={e => { setReturnId(e.target.value); setConditions({}); }}><option value="">Chọn phiếu mượn</option>{s.loans.filter(l => matches(query, l.id, l.reader, readerName(l.reader), titles(l.books))).map(l => <option key={l.id} value={l.id}>{l.id} — {readerName(l.reader)} · {loanState(l)}</option>)}</select></label></div>
      {loan ? <section className="ws-panel"><div className="ws-section-heading"><div><span className="library-record">{loan.id}</span><h2>{readerName(loan.reader)}</h2><p>Mượn ngày {dateLabel(loan.date)} · Hẹn trả {dateLabel(loan.due)}</p></div>{stamp(loanState(loan), loanState(loan) === 'Quá hạn')}</div>
      {loan.returned ? <><p>Đã trả ngày {dateLabel(loan.returned)}. Tiền phạt đã thu: <strong>{money(loan.fine)}</strong>.</p><p>{loan.condition}</p><button onClick={print}>In phiếu trả / Biên lai</button></> : <><Table heads={['Sách', 'Quá hạn', 'Tình trạng khi nhận', 'Bồi thường']} rows={loan.books.map(id => [titles([id]), `${overdueDays(loan.due)} ngày`, <select aria-label={`Tình trạng ${titles([id])}`} value={conditions[id] ?? 'Bình thường'} onChange={e => setConditions({ ...conditions, [id]: e.target.value })}>{['Bình thường', 'Hư hỏng nhẹ', 'Hư hỏng nặng', 'Mất sách'].map(c => <option key={c}>{c}</option>)}</select>, money(penalty(id))])} />
      <div className="ws-billing"><p>Phạt quá hạn <strong>{money(late)}</strong></p><p>Bồi thường hư hỏng / mất <strong>{money(damage)}</strong></p><p className="ws-billing-total">Tổng phải thu <strong>{money(late + damage)}</strong></p><button className="ws-primary" onClick={() => confirm(`Xác nhận trả toàn bộ sách và thu ${money(late + damage)} trong bản demo?`, () => {
        try { commit(returnLoan(s, loan.id, conditions), 'Đã ghi nhận trả sách và thu phạt trong bản demo.'); } catch (error) { setNotice((error as Error).message); }
      })}>Xác nhận trả sách &amp; Thu tiền</button><small>Sách mất hoặc hư hỏng nặng được đưa ra khỏi số bản có thể cho mượn.</small></div></> }</section> : <div className="ws-empty ws-panel"><h2>Chọn phiếu để tiếp nhận sách</h2><p>Tra cứu theo mã phiếu, độc giả hoặc tên sách.</p></div>}
    </>;
    else body = <><Metrics items={[["Phiếu đang mượn", active.length], ["Bản sách quá hạn", active.filter(l => l.due < today()).reduce((n, l) => n + l.books.length, 0)], ["Lượt mượn hôm nay", s.loans.filter(l => l.date === today()).length]]} /><div className="ws-toolbar">{search}<Select label="Trạng thái" value={filter} onChange={setFilter} options={['Tất cả', 'Đang mượn', 'Đã trả', 'Quá hạn']} /><button onClick={() => exportLoans(loanRows)}>Xuất CSV</button><button onClick={print}>In phiếu / Danh sách</button></div>{loanTable(loanRows, canCirculate)}</>;
  }
  else if (page === 'account') {
    const reader = s.readers.find(r => r.id === 'DG001');
    const mine = s.loans.filter(l => l.reader === 'DG001');
    if (!reader) body = <div className="ws-empty">Không tìm thấy hồ sơ mẫu DG001. Hãy thêm lại hồ sơ trong trang quản lý độc giả.</div>;
    else if (tab === 'loans' || tab === 'history') body = <><Metrics items={[["Sách đang giữ", mine.filter(l => !l.returned).reduce((n, l) => n + l.books.length, 0)], ["Sách quá hạn", mine.filter(l => !l.returned && l.due < today()).reduce((n, l) => n + l.books.length, 0)], ["Tiền phạt đã nộp", money(mine.reduce((n, l) => n + l.fine, 0))]]} />{loanTable(mine.filter(l => tab === 'loans' ? !l.returned : Boolean(l.returned)))}</>;
    else if (tab === 'reservations') body = <Table heads={['Mã đặt', 'Sách', 'Trạng thái', 'Thao tác']} rows={s.reservations.filter(r => r.reader === reader.id).map(r => [record(r.id), titles([r.book]), stamp(available(s, r.book) ? 'Đã có sách, đến quầy để nhận' : 'Đang chờ'), btn('Hủy đặt trước', () => confirm('Hủy yêu cầu đặt trước này?', () => commit({ ...s, reservations: s.reservations.filter(item => item.id !== r.id) }, 'Đã hủy đặt trước trong bản demo.')))])} />;
    else body = <div className="ws-split"><section className="ws-library-card"><div className="ws-card-top"><span>Thẻ thư viện</span>{record(reader.id)}</div><div className="ws-card-monogram" aria-hidden="true">TV</div><h2>{reader.name}</h2><p>{reader.type} · Sinh ngày {dateLabel(reader.birth)}</p><dl><div><dt>Ngày cấp</dt><dd>{dateLabel(reader.issued)}</dd></div><div><dt>Ngày hết hạn</dt><dd>{dateLabel(reader.expires)}</dd></div></dl>{stamp(readerStatus(reader), reader.locked || reader.expires < today())}<p className="ws-muted">Thẻ minh họa · Mã thẻ {reader.id}</p><button onClick={print}>In thông tin thẻ</button></section><section className="ws-panel"><h2>Thông tin liên hệ</h2><form onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); commit({ ...s, readers: s.readers.map(r => r.id === reader.id ? { ...r, email: text(f, 'email'), phone: text(f, 'phone'), address: text(f, 'address') } : r) }, 'Đã cập nhật thông tin hồ sơ mẫu.'); }}><Field label="Email" name="email" type="email" value={reader.email} /><Field label="Số điện thoại" name="phone" type="tel" value={reader.phone} /><Field label="Địa chỉ" name="address" value={reader.address} /><button className="ws-primary" type="submit">Lưu thông tin demo</button></form><div className="ws-note"><h3>Mật khẩu tài khoản</h3><p>Liên hệ thủ thư để đặt lại mật khẩu. Bản demo chưa kết nối dịch vụ đổi mật khẩu.</p></div></section></div>;
  }
  else if (page === 'users') body = <><div className="ws-section-heading"><p>Hồ sơ nhân sự và quyền làm việc.</p><button className="ws-primary" onClick={() => setEditor({ kind: 'user' })}>Thêm nhân viên</button></div><div className="ws-toolbar">{search}<Select label="Vai trò" value={filter} onChange={setFilter} options={['Tất cả', 'Admin', 'Staff']} /></div><Table heads={['Mã / Họ tên', 'Tài khoản', 'Chức vụ', 'Vai trò', 'Trạng thái', 'Thao tác']} rows={s.users.filter(u => matches(query, u.id, u.name, u.username) && (filter === 'Tất cả' || u.role === filter)).map(u => [<>{record(u.id)}<strong>{u.name}</strong></>, <>{u.username}<small>{u.email}</small></>, u.position, stamp(u.role), stamp(u.locked ? 'Tạm khóa' : 'Đang kích hoạt', u.locked), <div className="ws-actions">{btn('Sửa / Phân quyền', () => setEditor({ kind: 'user', id: u.id }))}{btn(u.locked ? 'Mở khóa' : 'Khóa', () => { if (!u.locked && u.role === 'Admin' && s.users.filter(item => item.role === 'Admin' && !item.locked).length <= 1) return setNotice('Không thể khóa quản trị viên hoạt động cuối cùng.'); confirm(`Thay đổi trạng thái ${u.username}?`, () => commit({ ...s, users: s.users.map(item => item.id === u.id ? { ...item, locked: !item.locked } : item) }, 'Đã đổi trạng thái nhân viên demo; tài khoản đăng nhập thật không thay đổi.')); })}{btn('Đặt lại mật khẩu', () => setNotice('Chưa kết nối dịch vụ đặt lại mật khẩu. Không có mật khẩu nào được thay đổi.'))}{btn('Xóa', () => deleteRecord('users', u.id), true)}</div>])} /></>;
  else if (page === 'settings') body = <form className="ws-settings" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const settings = { maxBooks: number(f, 'maxBooks'), loanDays: number(f, 'loanDays'), cardMonths: number(f, 'cardMonths'), dailyFine: number(f, 'dailyFine'), lightDamage: number(f, 'lightDamage'), heavyDamage: number(f, 'heavyDamage'), lost: number(f, 'lost') }; if (settings.lightDamage > settings.heavyDamage) return setNotice('Tỷ lệ phạt hư hỏng nặng phải bằng hoặc lớn hơn hư hỏng nhẹ.'); commit({ ...s, settings }, 'Đã lưu cấu hình demo. Hạn trả của phiếu đã lập không thay đổi.'); }} key={JSON.stringify(s.settings)}><div className="ws-split"><section className="ws-panel"><h2>Quy định mượn trả</h2><p className="ws-muted">Áp dụng khi lập phiếu và cấp hoặc gia hạn thẻ mới.</p><Field label="Số sách tối đa / độc giả" name="maxBooks" type="number" min={1} max={100} value={s.settings.maxBooks} /><Field label="Thời hạn mượn (ngày)" name="loanDays" type="number" min={1} max={365} value={s.settings.loanDays} /><Field label="Thời hạn thẻ (tháng)" name="cardMonths" type="number" min={1} max={120} value={s.settings.cardMonths} /></section><section className="ws-panel"><h2>Tiền phạt &amp; Bồi thường</h2><Field label="Quá hạn (đồng / ngày / cuốn)" name="dailyFine" type="number" min={0} max={1000000} value={s.settings.dailyFine} /><Field label="Hư hỏng nhẹ (% giá sách)" name="lightDamage" type="number" min={0} max={200} value={s.settings.lightDamage} /><Field label="Hư hỏng nặng (% giá sách)" name="heavyDamage" type="number" min={0} max={200} value={s.settings.heavyDamage} /><Field label="Mất sách (% giá sách)" name="lost" type="number" min={0} max={300} value={s.settings.lost} /></section></div><div className="ws-actions"><button className="ws-primary" type="submit">Lưu cấu hình demo</button><button type="button" onClick={() => confirm('Khôi phục tham số mặc định của bản demo?', () => commit({ ...s, settings: { ...defaults } }, 'Đã khôi phục cấu hình mặc định.'))}>Khôi phục mặc định</button></div></form>;
  else {
    const valid = from <= to;
    const loans = s.loans.filter(l => l.date >= from && l.date <= to);
    const lateLoans = active.filter(l => l.due < today() && l.due >= from && l.due <= to);
    const receipts = s.loans.filter(l => l.returned && l.returned >= from && l.returned <= to && l.fine > 0);
    const ranked = s.books.map(b => ({ ...b, count: loans.filter(l => l.books.includes(b.id)).length })).sort((a, b) => b.count - a.count).slice(0, 5);
    const rankedReaders = s.readers.map(r => ({ ...r, count: loans.filter(l => l.reader === r.id).reduce((n, l) => n + l.books.length, 0) })).sort((a, b) => b.count - a.count).slice(0, 5);
    const monthly = Array.from({ length: 6 }, (_, i) => { const month = addMonths(today().slice(0, 8) + '01', i - 5).slice(0, 7); return { month, count: loans.filter(l => l.date.startsWith(month)).length }; });
    body = <><div className="ws-toolbar"><Select label="Kỳ báo cáo" value={period} onChange={v => { setPeriod(v); const d = today(); setTo(d); if (v !== 'Tùy chọn') setFrom(v === 'Hôm nay' ? d : v === 'Tháng này' ? d.slice(0, 8) + '01' : v === 'Năm nay' ? d.slice(0, 4) + '-01-01' : addDays(d, -90)); }} options={['90 ngày gần nhất', 'Hôm nay', 'Tháng này', 'Năm nay', 'Tùy chọn']} /><label className="ws-field">Từ ngày<input type="date" value={from} max={to} onChange={e => { setPeriod('Tùy chọn'); setFrom(e.target.value); }} required /></label><label className="ws-field">Đến ngày<input type="date" value={to} min={from} onChange={e => { setPeriod('Tùy chọn'); setTo(e.target.value); }} required /></label><button disabled={!valid} onClick={() => tab === 'fines' ? exportCsv('thu-phat', [['Phiếu', 'Ngày thu', 'Độc giả', 'Số tiền', 'Tình trạng'], ...receipts.map(l => [l.id, l.returned, readerName(l.reader), l.fine, l.condition])]) : exportLoans(tab === 'overdue' ? lateLoans : loans)}>Xuất CSV</button><button onClick={print} disabled={!valid}>In / Lưu PDF</button></div>{!valid ? <p role="alert">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p> : <>
    <Metrics items={[["Lượt mượn trong kỳ", loans.length], ["Độc giả có thẻ hợp lệ · Hiện tại", s.readers.filter(r => !r.locked && r.expires >= today()).length], ["Bản quá hạn · Hiện tại", lateLoans.reduce((n, l) => n + l.books.length, 0)], ["Tiền phạt đã thu trong kỳ", money(receipts.reduce((n, l) => n + l.fine, 0))]]} />
    {tab === 'circulation' ? <><p className="ws-muted">Lọc theo ngày lập phiếu. Trạng thái hiển thị tại thời điểm hiện tại.</p>{loanTable(loans)}</> : tab === 'overdue' ? <><p className="ws-muted">Phiếu chưa trả có hạn trả trong kỳ đã chọn. Tiền phạt dự kiến tính đến {dateLabel(today())}.</p>{loanTable(lateLoans)}</> : tab === 'fines' ? <Table heads={['Phiếu / Độc giả', 'Ngày thu', 'Lý do', 'Đã thu']} rows={receipts.map(l => [<>{record(l.id)}<strong>{readerName(l.reader)}</strong></>, record(dateLabel(l.returned!)), l.condition ?? 'Phạt quá hạn', money(l.fine)])} /> : <>
    <div className="ws-split"><section className="ws-panel"><h2>Nhịp mượn sách</h2><p className="ws-muted">Sáu tháng gần nhất, trong kỳ báo cáo đã chọn.</p><div className="ws-chart" role="img" aria-label={monthly.map(m => `${m.month}: ${m.count} lượt`).join(', ')}>{monthly.map(m => <div key={m.month}><span className="library-record">{m.month}</span><div className="ws-track"><span style={{ width: `${m.count / Math.max(1, ...monthly.map(item => item.count)) * 100}%` }} /></div><b>{m.count}</b></div>)}</div></section><section className="ws-panel"><h2>Cơ cấu kho sách</h2><p className="ws-muted">Theo tổng số bản hiện tại, không phụ thuộc kỳ báo cáo.</p>{[...new Set(s.books.map(b => b.category))].map(c => <div className="ws-distribution" key={c}><span>{c}</span><strong className="library-record">{s.books.filter(b => b.category === c).reduce((n, b) => n + b.total, 0)} bản</strong></div>)}</section></div>
    <div className="ws-split"><section className="ws-panel"><h2>Sách được mượn nhiều</h2><Table heads={['Tên sách', 'Lượt mượn']} rows={ranked.filter(b => b.count).map(b => [<span className="ws-book-title">{b.title}</span>, record(b.count)])} /></section><section className="ws-panel"><h2>Độc giả tích cực</h2><Table heads={['Độc giả', 'Số bản đã mượn']} rows={rankedReaders.filter(r => r.count).map(r => [r.name, record(r.count)])} /></section></div><section className="ws-panel"><h2>Cần nhắc trả sách</h2>{loanTable([...lateLoans].sort((a, b) => a.due.localeCompare(b.due)))}</section>
    </>}</>}</>;
  }
  const book = s.books.find(b => b.id === editor?.id);
  const reader = s.readers.find(r => r.id === editor?.id);
  const user = s.users.find(u => u.id === editor?.id);
  if (page === 'readers') return <MembersPage />;
  return <div className="ws-root">
    <div className="ws-demo-note"><span className="library-record">Bản thực hành</span><span>Dữ liệu minh họa lưu trên trình duyệt này, chưa kết nối cơ sở dữ liệu.{page === 'account' ? ' Đang xem hồ sơ mẫu Nguyễn Minh Anh (DG001).' : ''}</span></div>
    <div role="status" aria-live="polite" className={notice ? 'ws-notice' : 'ws-status-empty'}>{notice}</div>
    {ready ? body : <p role="status">Đang mở sổ dữ liệu…</p>}
    <dialog className="ws-dialog" ref={dialog} onCancel={() => { setEditor(null); setConfirmation(null); }} aria-labelledby="ws-dialog-title">
      {confirmation ? <><h2 id="ws-dialog-title">Xác nhận thao tác</h2><p>{confirmation.message}</p><div className="ws-actions"><button autoFocus onClick={() => setConfirmation(null)}>Hủy bỏ</button><button className="ws-primary" onClick={() => { confirmation.run(); setConfirmation(null); }}>Xác nhận</button></div></> : editor ? <form onSubmit={saveEditor} key={`${editor.kind}-${editor.id}`}>
      <header className="ws-section-heading"><h2 id="ws-dialog-title">{editor.id ? 'Cập nhật' : 'Thêm'} {editor.kind === 'book' ? 'sách' : editor.kind === 'reader' ? 'độc giả' : 'nhân viên'}</h2><button type="button" onClick={() => setEditor(null)}>Đóng</button></header>
      <p className="library-record">{editor.id ?? 'Mã được cấp tự động khi lưu'}</p>
      <p className="ws-muted" role="status">{notice}</p>
      {editor.kind === 'book' ? <div className="ws-form-grid"><Field label="Tên sách" name="title" value={book?.title} /><Field label="Tác giả" name="author" value={book?.author} /><Field label="Thể loại" name="category" value={book?.category} /><Field label="Nhà xuất bản" name="publisher" value={book?.publisher} /><Field label="Năm xuất bản" name="year" type="number" value={book?.year ?? new Date().getFullYear()} min={1000} max={new Date().getFullYear() + 1} /><Field label="Tổng số bản" name="total" type="number" min={0} max={100000} value={book?.total ?? 1} /><Field label="Đơn giá (đồng)" name="price" type="number" min={0} max={100000000} value={book?.price ?? 0} /><Field label="Kệ / Ngăn / Tầng" name="shelf" value={book?.shelf} /><Field label="Đường dẫn ảnh bìa (tùy chọn)" name="cover" type="url" required={false} value={book?.cover} /><label className="ws-field">Mô tả<textarea name="description" defaultValue={book?.description} rows={3} /></label></div> : editor.kind === 'reader' ? <><div className="ws-form-grid"><Field label="Họ và tên" name="name" value={reader?.name} /><Field label="Ngày sinh" name="birth" type="date" max={today()} value={reader?.birth} /><Field label="Email" name="email" type="email" value={reader?.email} /><Field label="Số điện thoại" name="phone" type="tel" value={reader?.phone} /><Field label="Địa chỉ" name="address" value={reader?.address} /><label className="ws-field">Loại thẻ<select name="type" defaultValue={reader?.type ?? 'Sinh viên'}>{['Sinh viên', 'Giảng viên', 'Độc giả ngoài'].map(t => <option key={t}>{t}</option>)}</select></label></div>{reader && <div className="ws-slip ws-print-card"><h3>{reader.name}</h3><p className="library-record">{reader.id}</p><p>{reader.type} · Có hiệu lực đến {dateLabel(reader.expires)}</p><button type="button" onClick={print}>In thẻ minh họa</button></div>}</> : <><div className="ws-form-grid"><Field label="Họ và tên" name="name" value={user?.name} /><Field label="Email" name="email" type="email" value={user?.email} /><Field label="Tên đăng nhập" name="username" value={user?.username} /><Field label="Chức vụ" name="position" value={user?.position} /><label className="ws-field">Vai trò<select name="role" defaultValue={user?.role ?? 'Staff'}><option value="Staff">Nhân viên</option><option value="Admin">Quản trị viên</option></select></label></div><p className="ws-muted">Chỉ quản lý hồ sơ mẫu. Cấp tài khoản và mật khẩu thật cần kết nối hệ thống xác thực.</p></>}
      <div className="ws-actions"><button type="button" onClick={() => setEditor(null)}>Hủy bỏ</button><button className="ws-primary" type="submit">Lưu hồ sơ demo</button></div>
      </form> : null}
    </dialog>
  </div>;
}

