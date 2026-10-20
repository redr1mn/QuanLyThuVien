import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginInputSchema } from '../../features/auth/schemas/auth';
import { useAuthStore } from '../../features/auth/store/auth-store';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '', rememberMe: false });
  const [validationError, setValidationError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginInputSchema.safeParse(form);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Thông tin đăng nhập không hợp lệ.');
      return;
    }
    setValidationError(null);
    if (await login(parsed.data)) {
      const returnTo = new URLSearchParams(location.search).get('returnUrl');
      navigate(returnTo?.startsWith('/') ? returnTo : '/', { replace: true });
    }
  }

  return <section className="mx-auto max-w-md" aria-labelledby="login-title">
    <h1 id="login-title" className="font-serif text-4xl">Đăng nhập</h1>
    <p className="mt-3 text-[#5C5954]">Sử dụng tài khoản thư viện để tiếp tục.</p>
    {(validationError || error) && <p className="mt-5 border-l-2 border-[#8C2D19] bg-[#E8E3D8] p-3 text-[#8C2D19]" role="alert">{validationError ?? error}</p>}
    <form className="mt-8 grid gap-5" onSubmit={submit}>
      <label className="grid gap-2">Tên đăng nhập hoặc email<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" /></label>
      <label className="grid gap-2">Mật khẩu<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" /></label>
      <label className="flex items-center gap-3"><input type="checkbox" checked={form.rememberMe} onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })} /> Ghi nhớ đăng nhập</label>
      <button className="min-h-12 bg-[#141413] px-6 text-[#F4F1EA] disabled:opacity-50" disabled={isLoading}>{isLoading ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
    </form>
    <p className="mt-6 text-[#5C5954]">Chưa có tài khoản? <Link className="text-[#8C2D19] underline" to="/register">Đăng ký tài khoản Reader</Link></p>
  </section>;
}
