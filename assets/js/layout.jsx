import { useState } from 'react';
import { authService } from '../../services/auth-service.js';
import { roleLabel } from '../../utils/permissions.js';
import { formatDate, initials } from '../../utils/helper.js';

const links = [
  { view: 'tables', label: 'Sơ đồ bàn', icon: 'fa-table-cells-large' },
  { view: 'reports', label: 'Tổng quan hôm nay', icon: 'fa-chart-line', managerOnly: true }
];

export function DashboardLayout({ user, occupiedCount, activeView, onNavigate, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = links.find((link) => link.view === activeView)?.label || 'Sơ đồ bàn';
  const signOut = () => {
    authService.logout();
    window.location.replace('./index.html');
  };

  return <div className="app-shell">
    <Sidebar user={user} occupiedCount={occupiedCount} onNavigate={onNavigate} onSignOut={signOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <div className="main-column"><header className="topbar"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="icon-button mobile-menu" type="button" aria-label="Mở menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}><i className="icon fa-solid fa-bars" aria-hidden="true" /></button><div className="breadcrumb"><span>Quầy Bia</span><span>/</span><strong>{activeLabel}</strong></div></div><div className="topbar-actions"><span className="today-label">{formatDate()}</span><button className="icon-button" type="button" aria-label="Thông báo" title="Thông báo"><i className="icon fa-solid fa-bell" aria-hidden="true" /></button></div></header>{children}</div>
  </div>;
}

function Sidebar({ user, occupiedCount, onNavigate, onSignOut, mobileOpen, setMobileOpen }) {
  return <aside className={`sidebar${mobileOpen ? ' is-open' : ''}`} aria-label="Điều hướng chính">
    <a className="brand-mark" href="./dashboard.html"><span className="brand-symbol"><i className="icon fa-solid fa-beer-mug-empty" aria-hidden="true" /></span><span>quầy bia<span style={{ color: 'var(--green)' }}>.</span></span></a>
    <div className="workspace-label">Không gian làm việc</div>
    <nav className="nav-list">{links.filter((link) => !link.managerOnly || user.role === 'manager').map((link) => <a className="nav-link" href={`#${link.view}`} key={link.view} aria-current={link.view === activeView ? 'page' : undefined} onClick={(event) => { event.preventDefault(); setMobileOpen(false); onNavigate(link.view); }}><i className={`icon fa-solid ${link.icon}`} aria-hidden="true" />{link.label}{link.view === 'tables' && <span className="nav-count">{occupiedCount}</span>}</a>)}</nav>
    <div className="sidebar-bottom"><div className="shift-card"><div className="shift-label">Ca hiện tại <span className="shift-status">Đang mở</span></div><div className="shift-value">Ca chiều · 14:00</div></div><div className="profile"><span className="avatar">{initials(user.name)}</span><div className="profile-copy"><div className="profile-name">{user.name}</div><div className="profile-role">{roleLabel(user.role)}</div></div><button className="logout-button" type="button" onClick={onSignOut} aria-label="Đăng xuất" title="Đăng xuất"><i className="icon fa-solid fa-right-from-bracket" aria-hidden="true" /></button></div></div>
  </aside>;
}