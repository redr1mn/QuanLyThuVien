import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerInputSchema } from '../../features/auth/schemas/auth';
import { useAuthStore } from '../../features/auth/store/auth-store';

const initialForm = { username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: '', address: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = registerInputSchema.safeParse(form);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Thông tin đăng ký không hợp lệ.');
      return;
    }
    setValidationError(null);
    const cardNumber = await register(parsed.data);
    if (cardNumber) navigate('/login?registered=1', { replace: true });
  }

  const update = (field: keyof typeof form, value: string) => setForm({ ...form, [field]: value });

  return <section className="mx-auto max-w-2xl" aria-labelledby="register-title">
    <h1 id="register-title" className="font-serif text-4xl">Đăng ký tài khoản Reader</h1>
    <p className="mt-3 text-[#5C5954]">Tài khoản mới sẽ được liên kết với một thẻ độc giả.</p>
    {(validationError || error) && <p className="mt-5 border-l-2 border-[#8C2D19] bg-[#E8E3D8] p-3 text-[#8C2D19]" role="alert">{validationError ?? error}</p>}
    <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-2">Họ và tên<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} autoComplete="name" /></label>
      <label className="grid gap-2">Email<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" /></label>
      <label className="grid gap-2">Tên đăng nhập<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" value={form.username} onChange={(event) => update('username', event.target.value)} autoComplete="username" /></label>
      <label className="grid gap-2">Số điện thoại<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" /></label>
      <label className="grid gap-2">Mật khẩu<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete="new-password" /></label>
      <label className="grid gap-2">Xác nhận mật khẩu<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} autoComplete="new-password" /></label>
      <label className="grid gap-2 md:col-span-2">Địa chỉ<input className="min-h-12 border border-[#D2CBB8] bg-[#E8E3D8] px-3" value={form.address} onChange={(event) => update('address', event.target.value)} autoComplete="street-address" /></label>
      <button className="min-h-12 bg-[#141413] px-6 text-[#F4F1EA] disabled:opacity-50 md:col-span-2" disabled={isLoading}>{isLoading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</button>
    </form>
    <p className="mt-6 text-[#5C5954]">Đã có tài khoản? <Link className="text-[#8C2D19] underline" to="/login">Đăng nhập</Link></p>
  </section>;
}
