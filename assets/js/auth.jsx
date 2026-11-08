import { useState } from 'react';
import { authService } from '../services/auth-service.js';
import { validateLogin } from '../utils/validator.js';
import { Icon, IconSprite } from './icons.jsx';

export function AuthPage() {
  const [role, setRole] = useState('staff');
  const [email, setEmail] = useState('staff@quaybia.vn');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setEmail(nextRole === 'manager' ? 'manager@quaybia.vn' : 'staff@quaybia.vn');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateLogin({ email, password });
    if (Object.keys(errors).length) {
      setError(errors.email || errors.password);
      return;
    }
    try {
      await authService.login(email, password, role);
      window.location.assign('./dashboard.html');
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return <>
    <IconSprite />
    <main className="login-art">
      <a className="brand-mark login-brand" href="./index.html" aria-label="Quầy Bia, trang chủ"><span className="brand-symbol"><Icon name="beer" /></span><span>quầy bia<span style={{ color: 'var(--lime)' }}>.</span></span></a>
      <div className="login-art-copy"><span className="eyebrow">Không gian vận hành</span><h1>Ca bán hàng, trong tầm tay.</h1><p>Đơn hàng, tồn kho và nhịp vận hành quầy được gói gọn trong một màn hình.</p><div className="login-stat"><span className="live-dot" /> Hệ thống đang hoạt động</div></div>
      <div className="login-art-foot">Quầy Bia · Nền tảng quản lý bán hàng</div>
    </main>
    <section className="login-panel" aria-labelledby="login-title">
      <div className="login-form-wrap"><span className="eyebrow">Chào mừng trở lại</span><h2 id="login-title">Đăng nhập</h2><p className="login-intro">Chọn vai trò và nhập thông tin tài khoản.</p>
        <div className="role-switch" role="group" aria-label="Chọn vai trò">
          <button className="role-option" type="button" data-role="staff" aria-pressed={role === 'staff'} onClick={() => selectRole('staff')}><Icon name="user" /> Nhân viên</button>
          <button className="role-option" type="button" data-role="manager" aria-pressed={role === 'manager'} onClick={() => selectRole('manager')}><Icon name="shield" /> Quản lý</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="ten@quaybia.vn" required /></div>
          <div className="field"><label htmlFor="password">Mật khẩu</label><div className="password-wrap"><input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Nhập mật khẩu" required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((value) => !value)}><Icon name="eye" /></button></div></div>
          <p className="form-error" role="alert" aria-live="polite">{error}</p>
          <button className="submit-button" type="submit">Vào hệ thống <Icon name="arrow" /></button>
        </form>
        <p className="demo-note"><strong>Tài khoản dùng thử</strong><br />Nhân viên: staff@quaybia.vn · Quản lý: manager@quaybia.vn<br />Mật khẩu: 123456</p>
      </div>
    </section>
  </>;
}