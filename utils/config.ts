import type { UserRole } from './types.ts';

interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export const APP_CONFIG = Object.freeze({
  name: 'Quầy Bia',
  currency: 'VND',
  locale: 'vi-VN',
  apiBaseUrl: '',
  storagePrefix: 'quanlyquaybia',
  demoAccounts: [
    { email: 'lan@biahoi.vn', password: '123456', role: 'staff', name: 'Nguyễn Thị Lan' },
    { email: 'minh@biahoi.vn', password: '123456', role: 'staff', name: 'Trần Văn Minh' },
    { email: 'hung@biahoi.vn', password: '123456', role: 'manager', name: 'Lê Văn Hùng' },
    { email: 'hoa@biahoi.vn', password: '123456', role: 'owner', name: 'Phạm Thị Hoa' }
  ] satisfies DemoAccount[]
});