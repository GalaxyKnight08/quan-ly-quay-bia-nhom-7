import { APP_CONFIG } from '../utils/config.js';
import { cacheService } from './cache-service.js';

const SESSION_KEY = 'session';

export const authService = {
  async login(phone, password, selectedRole) {
    const account = APP_CONFIG.demoAccounts.find((item) => item.phone === phone.trim()
      && item.password === password && item.role === selectedRole);
    if (!account) throw new Error('Thông tin đăng nhập không chính xác.');
    const user = { name: account.name, phone: account.phone, role: account.role };
    cacheService.set(SESSION_KEY, user);
    return user;
  },
  currentUser() {
    return cacheService.get(SESSION_KEY);
  },
  logout() {
    cacheService.remove(SESSION_KEY);
  }
};