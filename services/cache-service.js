import { APP_CONFIG } from '../utils/config.js';

const keyFor = (key) => `${APP_CONFIG.storagePrefix}:${key}`;

export const cacheService = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(keyFor(key));
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(keyFor(key), JSON.stringify(value));
    return value;
  },
  remove(key) {
    localStorage.removeItem(keyFor(key));
  }
};