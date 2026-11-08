import { useRef, useState } from 'react';
import { authService } from '../../services/auth-service.js';
import { validateLogin } from '../../utils/validator.js';

export function AuthPage() {
  const [role, setRole] = useState('staff');
  const [phone, setPhone] = useState('0900000001');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneInput = useRef(null);
  const passwordInput = useRef(null);

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setPhone(nextRole === 'manager' ? '0900000002' : '0900000001');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const normalizedPhone = phone.trim();
    const normalizedPassword = password.trim();
    const errors = validateLogin({ phone: normalizedPhone, password: normalizedPassword });
    if (Object.keys(errors).length) {
      setError(errors.phone || errors.password);
      (errors.phone ? phoneInput : passwordInput).current?.focus();
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const user = await authService.login(normalizedPhone, normalizedPassword, role);
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
      <div className="login-art-copy"><span className="eyebrow">Không gian vận hành</span><h1>Ca bán hàng, trong tầm tay.</h1><p>Đơn hàng, tồn kho và nhịp vận hành quầy được gói gọn trong một màn hình.</p><div className="login-stat"><span className="live-dot" /> Hệ thống đang hoạt động</div></div>
      <div className="login-art-foot">Quầy Bia · Nền tảng quản lý bán hàng</div>
    </main>
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-form-wrap"><span className="eyebrow">Chào mừng trở lại</span><h2 id="login-title">Đăng nhập</h2><p className="login-intro">Chọn vai trò và nhập thông tin tài khoản.</p>
        <div className="role-switch" role="group" aria-label="Chọn vai trò">
          <button className="role-option" type="button" data-role="staff" aria-pressed={role === 'staff'} onClick={() => selectRole('staff')}><i className="icon fa-solid fa-user" aria-hidden="true" /> Nhân viên</button>
          <button className="role-option" type="button" data-role="manager" aria-pressed={role === 'manager'} onClick={() => selectRole('manager')}><i className="icon fa-solid fa-shield-halved" aria-hidden="true" /> Quản lý</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field"><label htmlFor="phone">Số điện thoại</label><input ref={phoneInput} id="phone" name="phone" type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="username" placeholder="Nhập số điện thoại" required /></div>
          <div className="field"><label htmlFor="password">Mật khẩu</label><div className="password-wrap"><input ref={passwordInput} id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Nhập mật khẩu" required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((value) => !value)}><i className="icon fa-solid fa-eye" aria-hidden="true" /></button></div></div>
          <p className="form-error" role="alert" aria-live="polite">{error}</p>
          {success && <p className="form-success" role="status">{success}</p>}
          <button className="submit-button" type="submit" disabled={isSubmitting || Boolean(success)}>{isSubmitting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />Đang đăng nhập...</> : success ? 'Đăng nhập thành công' : <>Vào hệ thống <i className="icon fa-solid fa-arrow-right" aria-hidden="true" /></>}</button>
        </form>
        <p className="demo-note"><strong>Tài khoản dùng thử</strong><br />Nhân viên: 0900000001 · Quản lý: 0900000002<br />Mật khẩu: 123456</p>
      </div>
    </section>
  </>;
}