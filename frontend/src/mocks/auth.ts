import { APP_CONFIG } from '../utils/config.ts';
import { cacheService } from './cache-service.ts';
import type { User } from '../utils/types.ts';

const SESSION_KEY = 'session';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const account = APP_CONFIG.demoAccounts.find((item) => item.email === email.trim().toLocaleLowerCase('vi')
      && item.password === password);
    if (!account) throw new Error('Email hoặc mật khẩu không đúng');
    const user = { name: account.name, email: account.email, role: account.role };
    cacheService.set(SESSION_KEY, user);
    return user;
  },
  currentUser(): User | null {
    return cacheService.get<User>(SESSION_KEY);
  },
  logout() {
    cacheService.remove(SESSION_KEY);
  }
};