import { Link, Outlet } from 'react-router-dom';

export default function AuthenticatedLayout() {
  return <main className="min-h-screen bg-[#F4F1EA] text-[#141413]">
    <header className="border-b border-[#D2CBB8] px-6 py-5">
      <nav className="mx-auto flex max-w-6xl items-center gap-6">
        <Link to="/" className="font-serif text-2xl">Thư viện</Link>
        <Link to="/reader/account">Tài khoản độc giả</Link>
        <Link to="/staff/readers">Nghiệp vụ</Link>
        <Link to="/admin/reports">Báo cáo</Link>
      </nav>
    </header>
    <div className="mx-auto max-w-6xl px-6 py-10"><Outlet /></div>
  </main>;
}
