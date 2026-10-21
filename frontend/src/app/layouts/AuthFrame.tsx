import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

// React port of the introductory panel in Views/Account/Login.cshtml.
export function AuthFrame({ children }: { children: ReactNode }) {
  return <div className="library-auth"><aside className="library-auth-intro" aria-labelledby="auth-intro-title"><Link className="library-auth-back" to="/">Về mục lục sách</Link><div><svg className="library-auth-art" viewBox="0 0 240 160" fill="none" aria-hidden="true"><path d="M30 136h180M43 34h28v101H43zM80 18h22v117H80zM111 43h27v92h-27zM151 31l22-5 25 105-22 5z" stroke="currentColor" strokeWidth="1.5" /><path d="M48 49h18M48 116h18M85 34h12M85 116h12M116 58h17M116 116h17M155 48l22-5M171 117l22-5" stroke="currentColor" /></svg><h2 id="auth-intro-title">Một chỗ cho<br /><em>những trang đang đọc.</em></h2><p>Theo dõi sách đang mượn, xem hạn trả và giữ thông tin thẻ thư viện trong cùng một tài khoản.</p></div><p className="library-auth-help">Chưa có tài khoản hoặc quên mật khẩu? Liên hệ thủ thư tại quầy để được hướng dẫn cấp thẻ hoặc đặt lại mật khẩu.</p></aside><section className="library-auth-panel"><div className="library-auth-form-wrap">{children}</div></section></div>;
}
