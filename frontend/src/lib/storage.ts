import { APP_CONFIG } from '../utils/config.ts';

const keyFor = (key: string) => `${APP_CONFIG.storagePrefix}:${key}`;

export const cacheService = {
  get<T>(key: string, fallback: T | null = null): T | null {
    try {
      const value = localStorage.getItem(keyFor(key));
      return value === null ? fallback : JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): T {
    localStorage.setItem(keyFor(key), JSON.stringify(value));
    return value;
  },
  remove(key: string) {
    localStorage.removeItem(keyFor(key));
  }
};