import { AuthFrame } from '../../app/layouts/AuthFrame';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerInputSchema } from '../../features/auth/schemas/auth';
import { useAuthStore } from '../../features/auth/store/auth-store';
import { PasswordField } from '../../shared/components/PasswordField';

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
    if (cardNumber) navigate('/login', { replace: true, state: { cardNumber } });
  }

  const update = (field: keyof typeof form, value: string) => setForm({ ...form, [field]: value });

  return <AuthFrame><section aria-labelledby="register-title">
    <div className="auth-intro"><span className="eyebrow">Thẻ độc giả</span><h1 id="register-title">Mở tài khoản thư viện</h1><p>Điền thông tin cơ bản. Hệ thống sẽ tạo thẻ Reader tự động sau khi đăng ký.</p></div>
    <div className="legacy-auth-form-card">
      {(validationError || error) && <p className="notice notice-error" role="alert">{validationError ?? error}</p>}
      <form className="auth-form auth-form-grid" onSubmit={submit}>
        <div className="form-field"><label htmlFor="register-name">Họ và tên</label><input id="register-name" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} autoComplete="name" /></div>
        <div className="form-field"><label htmlFor="register-email">Email</label><input id="register-email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" /></div>
        <div className="form-field"><label htmlFor="register-username">Tên đăng nhập</label><input id="register-username" value={form.username} onChange={(event) => update('username', event.target.value)} autoComplete="username" /></div>
        <div className="form-field"><label htmlFor="register-phone">Số điện thoại <span>(tuỳ chọn)</span></label><input id="register-phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" /></div>
        <PasswordField label="Mật khẩu" value={form.password} onChange={value => update('password', value)} autoComplete="new-password" />
        <PasswordField label="Xác nhận mật khẩu" value={form.confirmPassword} onChange={value => update('confirmPassword', value)} autoComplete="new-password" />
        <div className="form-field auth-form-full"><label htmlFor="register-address">Địa chỉ <span>(tuỳ chọn)</span></label><input id="register-address" value={form.address} onChange={(event) => update('address', event.target.value)} autoComplete="street-address" /></div>
        <button className="primary-button auth-form-full" disabled={isLoading}>{isLoading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản Reader'}</button>
      </form>
    </div>
    <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
  </section></AuthFrame>;
}
