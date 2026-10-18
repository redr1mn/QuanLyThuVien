// Isolated UI demo data. Never use this browser store as authorization or a production database.
export type BookRecord = { id: string; title: string; author: string; category: string; publisher: string; year: number; price: number; total: number; shelf: string; description: string; cover: string };
export type Reader = { id: string; name: string; birth: string; email: string; phone: string; address: string; type: string; expires: string; issued: string; locked: boolean };
export type Loan = { id: string; reader: string; books: string[]; date: string; due: string; returned?: string; fine: number; condition?: string };
export type Employee = { id: string; name: string; email: string; username: string; position: string; role: string; locked: boolean };
export type Settings = { maxBooks: number; loanDays: number; cardMonths: number; dailyFine: number; lightDamage: number; heavyDamage: number; lost: number };
export type Store = { books: BookRecord[]; readers: Reader[]; loans: Loan[]; users: Employee[]; settings: Settings; reservations: { id: string; reader: string; book: string }[] };
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function addDays(date: string, days: number) { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
export function addMonths(date: string, months: number) { const d = new Date(`${date}T00:00:00Z`); const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + months); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); return d.toISOString().slice(0, 10); }
export const overdueDays = (due: string, date = today()) => Math.max(0, Math.round((Date.parse(date) - Date.parse(due)) / 86400000));
export const available = (s: Store, id: string) => Math.max(0, (s.books.find(b => b.id === id)?.total ?? 0) - s.loans.filter(l => !l.returned && l.books.includes(id)).length);
export const defaults: Settings = { maxBooks: 5, loanDays: 14, cardMonths: 12, dailyFine: 2000, lightDamage: 20, heavyDamage: 50, lost: 100 };
export const money = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
export const dateLabel = (s: string) => s ? s.split('-').reverse().join('/') : '—';
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
export function seed(): Store {
  const d = today();
  return {
    settings: { ...defaults },
    books: [
      ['S001', 'Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Văn học', 'Kim Đồng', 2023, 85000, 8, 'A.01.02'],
      ['S002', 'Lập trình C# căn bản', 'Phạm Văn Ất', 'Công nghệ thông tin', 'Bách Khoa Hà Nội', 2024, 165000, 5, 'B.02.01'],
      ['S003', 'Tư duy nhanh và chậm', 'Daniel Kahneman', 'Tâm lý học', 'Thế Giới', 2022, 269000, 4, 'C.03.04'],
      ['S004', 'Nhà giả kim', 'Paulo Coelho', 'Văn học', 'Văn Học', 2023, 79000, 1, 'A.02.03'],
      ['S005', 'Kinh tế học vi mô', 'N. Gregory Mankiw', 'Kinh tế', 'Kinh Tế TP.HCM', 2024, 198000, 6, 'D.01.01'],
      ['S006', 'Những ngày thơ ấu', 'Nguyên Hồng', 'Văn học', 'Văn Học', 2021, 65000, 3, 'A.01.04'],
    ].map(row => ({ id: String(row[0]), title: String(row[1]), author: String(row[2]), category: String(row[3]), publisher: String(row[4]), year: Number(row[5]), price: Number(row[6]), total: Number(row[7]), shelf: String(row[8]), description: '', cover: '' })),
    readers: [
      { id: 'DG001', name: 'Nguyễn Minh Anh', birth: '2004-05-18', email: 'minhanh@example.com', phone: '0901234567', address: 'Cầu Giấy, Hà Nội', type: 'Sinh viên', issued: addDays(d, -180), expires: addDays(d, 185), locked: false },
      { id: 'DG002', name: 'Trần Quốc Bảo', birth: '2003-09-22', email: 'quocbao@example.com', phone: '0912345678', address: 'Đống Đa, Hà Nội', type: 'Sinh viên', issued: addDays(d, -355), expires: addDays(d, 10), locked: false },
      { id: 'DG003', name: 'Lê Thu Hà', birth: '1988-01-12', email: 'thuha@example.com', phone: '0987654321', address: 'Hai Bà Trưng, Hà Nội', type: 'Giảng viên', issued: addDays(d, -400), expires: addDays(d, -35), locked: false },
    ],
    loans: [
      { id: 'PM001', reader: 'DG001', books: ['S001', 'S002'], date: addDays(d, -8), due: addDays(d, 6), fine: 0 },
      { id: 'PM002', reader: 'DG002', books: ['S004'], date: addDays(d, -20), due: addDays(d, -6), fine: 0 },
      { id: 'PM003', reader: 'DG001', books: ['S003'], date: addDays(d, -42), due: addDays(d, -28), returned: addDays(d, -27), fine: 2000, condition: 'Bình thường' },
      { id: 'PM004', reader: 'DG002', books: ['S005'], date: addDays(d, -60), due: addDays(d, -46), returned: addDays(d, -48), fine: 0, condition: 'Bình thường' },
    ],
    users: [
      { id: 'NV001', name: 'Lê Hoàng Nam', email: 'hoangnam@example.com', username: 'admin', position: 'Quản trị viên', role: 'Admin', locked: false },
      { id: 'NV002', name: 'Trần Thu Hà', email: 'thuhalib@example.com', username: 'staff', position: 'Thủ thư', role: 'Staff', locked: false },
    ],
    reservations: [{ id: 'DC001', reader: 'DG001', book: 'S004' }],
  };
}
export function borrow(s: Store, readerId: string, books: string[], due: string): Store {
  const reader = s.readers.find(r => r.id === readerId);
  if (!reader || reader.locked || reader.expires < today()) throw Error('Thẻ độc giả không hợp lệ, đã hết hạn hoặc đang bị khóa.');
  const current = s.loans.filter(l => l.reader === readerId && !l.returned);
  if (current.some(l => l.due < today())) throw Error('Độc giả có sách quá hạn. Hãy xử lý trả sách trước.');
  if (!books.length || new Set(books).size !== books.length || current.reduce((n, l) => n + l.books.length, 0) + books.length > s.settings.maxBooks) throw Error(`Chọn sách, không trùng mã; giới hạn ${s.settings.maxBooks} cuốn mỗi độc giả.`);
  if (books.some(id => available(s, id) < 1)) throw Error('Một trong các sách đã hết. Kiểm tra lại tồn kho.');
  if (due < today() || due > addDays(today(), s.settings.loanDays)) throw Error('Hạn trả phải nằm trong thời hạn mượn cho phép.');
  return { ...s, loans: [...s.loans, { id: newId('PM'), reader: readerId, books, date: today(), due, fine: 0 }] };
}

export function returnLoan(s: Store, id: string, conditions: Record<string, string>): Store {
  const loan = s.loans.find(l => l.id === id);
  if (!loan || loan.returned) throw Error('Phiếu không tồn tại hoặc đã hoàn tất trả sách.');
  const fine = overdueDays(loan.due) * s.settings.dailyFine * loan.books.length + loan.books.reduce((n, bookId) => {
    const price = s.books.find(b => b.id === bookId)?.price ?? 0;
    const condition = conditions[bookId] ?? 'Bình thường';
    const rate = condition === 'Hư hỏng nhẹ' ? s.settings.lightDamage : condition === 'Hư hỏng nặng' ? s.settings.heavyDamage : condition === 'Mất sách' ? s.settings.lost : 0;
    return n + Math.round(price * rate / 100);
  }, 0);
  const removed = loan.books.filter(bookId => ['Mất sách', 'Hư hỏng nặng'].includes(conditions[bookId] ?? ''));
  return { ...s, books: s.books.map(b => removed.includes(b.id) ? { ...b, total: Math.max(0, b.total - 1) } : b), loans: s.loans.map(l => l.id === id ? { ...l, returned: today(), fine, condition: loan.books.map(bookId => `${bookId}: ${conditions[bookId] ?? 'Bình thường'}`).join('; ') } : l) };
}
