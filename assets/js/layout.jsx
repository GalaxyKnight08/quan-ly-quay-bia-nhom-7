import { useState } from 'react';
import { authService } from '../services/auth-service.js';
import { roleLabel } from '../utils/permissions.js';
import { formatDate, initials } from '../utils/helper.js';
import { Icon } from './icons.jsx';

const links = [
  { view: 'overview', label: 'Tổng quan', icon: 'grid' },
  { view: 'orders', label: 'Đơn hàng', icon: 'receipt' },
  { view: 'inventory', label: 'Kho hàng', icon: 'box' },
  { view: 'reports', label: 'Báo cáo', icon: 'chart', managerOnly: true },
  { view: 'staff', label: 'Nhân viên', icon: 'users', managerOnly: true }
];

export function DashboardLayout({ user, orderCount, lowStockCount, onNavigate, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const signOut = () => {
    authService.logout();
    window.location.replace('./index.html');
  };

  return <div className="app-shell">
    <Sidebar user={user} orderCount={orderCount} lowStockCount={lowStockCount} onNavigate={onNavigate} onSignOut={signOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <div className="main-column"><header className="topbar"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="icon-button mobile-menu" type="button" aria-label="Mở menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}><Icon name="menu" /></button><div className="breadcrumb"><span>Quầy Bia</span><span>/</span><strong>Tổng quan</strong></div></div><div className="topbar-actions"><span className="today-label">{formatDate()}</span><button className="icon-button" type="button" aria-label="Thông báo" title="Thông báo"><Icon name="bell" /></button></div></header>{children}</div>
  </div>;
}

function Sidebar({ user, orderCount, lowStockCount, onNavigate, onSignOut, mobileOpen, setMobileOpen }) {
  return <aside className={`sidebar${mobileOpen ? ' is-open' : ''}`} aria-label="Điều hướng chính">
    <a className="brand-mark" href="./dashboard.html"><span className="brand-symbol"><Icon name="beer" /></span><span>quầy bia<span style={{ color: 'var(--green)' }}>.</span></span></a>
    <div className="workspace-label">Không gian làm việc</div>
    <nav className="nav-list">{links.filter((link) => !link.managerOnly || user.role === 'manager').map((link) => <a className="nav-link" href={`#${link.view}`} key={link.view} aria-current={link.view === 'overview' ? 'page' : undefined} onClick={(event) => { event.preventDefault(); setMobileOpen(false); onNavigate(link.view); }}><Icon name={link.icon} />{link.label}{link.view === 'orders' && <span className="nav-count">{orderCount}</span>}{link.view === 'inventory' && <span className="nav-count">{lowStockCount}</span>}</a>)}</nav>
    <div className="sidebar-bottom"><div className="shift-card"><div className="shift-label">Ca hiện tại <span className="shift-status">Đang mở</span></div><div className="shift-value">Ca chiều · 14:00</div></div><div className="profile"><span className="avatar">{initials(user.name)}</span><div className="profile-copy"><div className="profile-name">{user.name}</div><div className="profile-role">{roleLabel(user.role)}</div></div><button className="logout-button" type="button" onClick={onSignOut} aria-label="Đăng xuất" title="Đăng xuất"><Icon name="logout" /></button></div></div>
  </aside>;
}