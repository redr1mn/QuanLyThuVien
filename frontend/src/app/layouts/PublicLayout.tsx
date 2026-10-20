import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return <main className="min-h-screen bg-[#F4F1EA] text-[#141413]">
    <header className="border-b border-[#D2CBB8] px-6 py-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="font-serif text-2xl">Thư viện</Link>
        <div className="flex gap-4"><Link to="/login">Đăng nhập</Link><Link to="/register">Đăng ký</Link></div>
      </nav>
    </header>
    <div className="mx-auto max-w-6xl px-6 py-10"><Outlet /></div>
  </main>;
}
