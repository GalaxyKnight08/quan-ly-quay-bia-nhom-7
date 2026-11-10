import type { User, UserRole } from './types.ts';

type Permission = 'dashboard:view' | 'orders:view' | 'orders:create' | 'inventory:view' | 'inventory:manage' | 'reports:view' | 'staff:manage';

const ROLE_PERMISSIONS = Object.freeze({
  staff: ['dashboard:view', 'orders:view', 'orders:create', 'inventory:view'],
  manager: ['dashboard:view', 'orders:view', 'orders:create', 'inventory:view', 'inventory:manage', 'reports:view', 'staff:manage'],
  owner: ['dashboard:view', 'orders:view', 'orders:create', 'inventory:view', 'inventory:manage', 'reports:view', 'staff:manage']
});

export const can = (user: User | null, permission: Permission) => Boolean(user && ROLE_PERMISSIONS[user.role]?.includes(permission));

export const roleLabel = (role: UserRole) => ({ staff: 'Nhân viên quầy', manager: 'Quản lý ca', owner: 'Chủ quán' }[role] || 'Người dùng');