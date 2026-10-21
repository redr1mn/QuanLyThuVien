import { AuthFrame } from '../../app/layouts/AuthFrame';
import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginInputSchema } from '../../features/auth/schemas/auth';
import { useAuthStore } from '../../features/auth/store/auth-store';
import { PasswordField } from '../../shared/components/PasswordField';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();
  const registeredCardNumber = (location.state as { cardNumber?: string } | null)?.cardNumber;
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

  return <AuthFrame><section aria-labelledby="login-title">
    <div className="auth-intro"><span className="eyebrow">Không gian đọc</span><h1 id="login-title">Đăng nhập</h1><p>Sử dụng tài khoản thư viện để tiếp tục.</p></div>
    <div className="legacy-auth-form-card">
      {registeredCardNumber && <p className="notice notice-success" role="status">Đăng ký thành công. Số thẻ của bạn là <strong>{registeredCardNumber}</strong>. Hãy đăng nhập để bắt đầu.</p>}
      {(validationError || error) && <p className="notice notice-error" role="alert">{validationError ?? error}</p>}
      <form className="auth-form" onSubmit={submit}>
        <div className="form-field"><label htmlFor="login-username">Tên đăng nhập hoặc email</label><input id="login-username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" /></div>
        <PasswordField label="Mật khẩu" value={form.password} onChange={value => setForm({ ...form, password: value })} autoComplete="current-password" />
        <label className="checkbox-field"><input type="checkbox" checked={form.rememberMe} onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })} /> Ghi nhớ đăng nhập</label>
        <button className="primary-button" disabled={isLoading}>{isLoading ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
    </div>
    <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký tài khoản Reader</Link></p>
  </section></AuthFrame>;
}
