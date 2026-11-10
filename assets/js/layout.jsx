import { useState } from 'react';
import { authService } from '../../services/auth-service.js';
import { roleLabel } from '../../utils/permissions.js';
import { formatDate, initials } from '../../utils/helper.js';

const links = [
  { view: 'tables', label: 'Sơ đồ bàn', icon: 'fa-table-cells-large', group: 'Quầy' },
  { view: 'shifts', label: 'Mở / đóng ca', icon: 'fa-clock', group: 'Quầy' },
  { view: 'taps', label: 'Vòi & keg', icon: 'fa-beer-mug-empty', group: 'Quầy' },
  { view: 'reports', label: 'Tổng quan hôm nay', icon: 'fa-chart-line', managerOnly: true, group: 'Báo cáo' },
  { view: 'kegLoss', label: 'Hao hụt keg', icon: 'fa-chart-column', managerOnly: true, group: 'Báo cáo' },
  { view: 'voids', label: 'Nhật ký hủy / giảm', icon: 'fa-receipt', managerOnly: true, group: 'Báo cáo' },
  { view: 'topItems', label: 'Món bán chạy', icon: 'fa-ranking-star', managerOnly: true, group: 'Báo cáo' },
  { view: 'menu', label: 'Thực đơn & bếp', icon: 'fa-utensils', managerOnly: true, group: 'Quản trị' },
  { view: 'areas', label: 'Khu & bàn', icon: 'fa-chair', managerOnly: true, group: 'Quản trị' },
  { view: 'staff', label: 'Nhân viên', icon: 'fa-users', managerOnly: true, group: 'Quản trị' },
  { view: 'kegs', label: 'Nhập kho keg', icon: 'fa-boxes-stacked', managerOnly: true, group: 'Quản trị' },
  { view: 'happyHours', label: 'Giá giờ vàng', icon: 'fa-tags', managerOnly: true, group: 'Quản trị' }
];

export function DashboardLayout({ user, occupiedCount, shiftOpen, activeView, onNavigate, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLink = links.find((link) => link.view === activeView);
  const activeLabel = activeLink?.label || 'Sơ đồ bàn';
  const signOut = () => {
    authService.logout();
    window.location.replace('./index.html');
  };

  return <div className="app-shell">
    <Sidebar user={user} occupiedCount={occupiedCount} shiftOpen={shiftOpen} onNavigate={onNavigate} onSignOut={signOut} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <div className="main-column"><header className="topbar"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="icon-button mobile-menu" type="button" aria-label="Mở menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}><i className="icon fa-solid fa-bars" aria-hidden="true" /></button><div className="breadcrumb"><span>Quầy Bia</span><span>/</span><strong>{activeLabel}</strong></div></div><div className="topbar-actions"><span className="today-label">{formatDate()}</span><button className="icon-button" type="button" aria-label="Thông báo" title="Thông báo"><i className="icon fa-solid fa-bell" aria-hidden="true" /></button></div></header>{children}</div>
  </div>;
}

function Sidebar({ user, occupiedCount, shiftOpen, onNavigate, onSignOut, mobileOpen, setMobileOpen }) {
  return <aside className={`sidebar${mobileOpen ? ' is-open' : ''}`} aria-label="Điều hướng chính">
    <a className="brand-mark" href="./dashboard.html"><span className="brand-symbol"><i className="icon fa-solid fa-beer-mug-empty" aria-hidden="true" /></span><span>quầy bia<span style={{ color: 'var(--green)' }}>.</span></span></a>
    <div className="workspace-label">Không gian làm việc</div>
    <nav className="nav-list">{['Quầy', 'Báo cáo', 'Quản trị'].map((group) => {
      const visibleLinks = links.filter((link) => link.group === group && (!link.managerOnly || ['manager', 'owner'].includes(user.role)));
      if (!visibleLinks.length) return null;
      return <div className="nav-group" key={group}><div className="nav-group-title">{group}</div>{visibleLinks.map((link) => <a className="nav-link" href={`#${link.view}`} key={link.view} aria-current={link.view === activeView ? 'page' : undefined} onClick={(event) => { event.preventDefault(); setMobileOpen(false); onNavigate(link.view); }}><i className={`icon fa-solid ${link.icon}`} aria-hidden="true" />{link.label}{link.view === 'tables' && <span className="nav-count">{occupiedCount}</span>}</a>)}</div>;
    })}</nav>
    <div className="sidebar-bottom"><div className="shift-card"><div className="shift-label">Ca hiện tại <span className={`shift-status${shiftOpen ? '' : ' is-closed'}`}>{shiftOpen ? 'Đang mở' : 'Chưa mở'}</span></div><div className="shift-value">{shiftOpen ? 'Ca chiều · 14:00' : 'Chưa mở ca'}</div></div><div className="profile"><span className="avatar">{initials(user.name)}</span><div className="profile-copy"><div className="profile-name">{user.name}</div><div className="profile-role">{roleLabel(user.role)}</div></div><button className="logout-button" type="button" onClick={onSignOut} aria-label="Đăng xuất" title="Đăng xuất"><i className="icon fa-solid fa-right-from-bracket" aria-hidden="true" /></button></div></div>
  </aside>;
}