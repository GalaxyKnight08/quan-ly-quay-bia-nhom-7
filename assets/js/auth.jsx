import { useRef, useState } from 'react';
import { authService } from '../../services/auth-service.js';
import { validateLogin } from '../../utils/validator.js';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInput = useRef(null);
  const passwordInput = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const errors = validateLogin({ email: normalizedEmail, password: normalizedPassword });
    if (Object.keys(errors).length) {
      setError(errors.email || errors.password);
      (errors.email ? emailInput : passwordInput).current?.focus();
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const user = await authService.login(normalizedEmail, normalizedPassword);
      setSuccess(`Xin chào ${user.name}`);
      window.setTimeout(() => window.location.assign('./dashboard.html'), 1200);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <>
    <main className="login-art">
      <a className="brand-mark login-brand" href="./index.html" aria-label="Quầy Bia, trang chủ"><span className="brand-symbol"><i className="icon fa-solid fa-beer-mug-empty" aria-hidden="true" /></span><span>quầy bia<span style={{ color: 'var(--lime)' }}>.</span></span></a>
      <div className="login-art-copy"><span className="eyebrow">Không gian vận hành</span><h1>Quản lý quán bia, gọn trong một màn hình.</h1><p>Sơ đồ bàn, gọi món và theo dõi hoạt động quầy theo thời gian thực.</p><div className="login-stat"><span className="live-dot" />Sẵn sàng cho ca làm việc</div></div>
      <div className="login-art-foot">Quầy Bia · Nền tảng quản lý bán hàng</div>
    </main>
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-form-wrap"><span className="eyebrow">Chào mừng trở lại</span><h2 id="login-title">Đăng nhập</h2><p className="login-intro">Sử dụng tài khoản được cấp để tiếp tục.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field"><label htmlFor="email">Email</label><input ref={emailInput} id="email" name="email" type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="ten@quaybia.vn" required /></div>
          <div className="field"><label htmlFor="password">Mật khẩu</label><div className="password-wrap"><input ref={passwordInput} id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Nhập mật khẩu" required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((value) => !value)}><i className="icon fa-solid fa-eye" aria-hidden="true" /></button></div></div>
          <p className="form-error" role="alert" aria-live="polite">{error}</p>
          {success && <p className="form-success" role="status">{success}</p>}
          <button className="submit-button" type="submit" disabled={isSubmitting || Boolean(success)}>{isSubmitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />Đang đăng nhập...</> : success ? 'Đăng nhập thành công' : <>Vào hệ thống <i className="icon fa-solid fa-arrow-right" aria-hidden="true" /></>}</button>
        </form>
        <p className="demo-note"><strong>Tài khoản dùng thử</strong><br />Nhân viên: nhanvien@quaybia.vn<br />Quản lý ca: quanly@quaybia.vn<br />Chủ quán: hoa@biahoi.vn<br />Mật khẩu: 123456</p>
      </div>
    </section>
  </>;
}