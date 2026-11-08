const ROLE_PERMISSIONS = Object.freeze({
  staff: ['dashboard:view', 'orders:view', 'orders:create', 'inventory:view'],
  manager: ['dashboard:view', 'orders:view', 'orders:create', 'inventory:view', 'inventory:manage', 'reports:view', 'staff:manage']
});

export const can = (user, permission) => Boolean(user && ROLE_PERMISSIONS[user.role]?.includes(permission));

export const roleLabel = (role) => ({ staff: 'Nhân viên', manager: 'Quản lý' }[role] || 'Người dùng');