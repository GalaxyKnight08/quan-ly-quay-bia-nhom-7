import { APP_CONFIG } from './config.js';

export const formatMoney = (value) => new Intl.NumberFormat(APP_CONFIG.locale, {
  style: 'currency', currency: APP_CONFIG.currency, maximumFractionDigits: 0
}).format(value);

export const formatTime = (value) => new Intl.DateTimeFormat(APP_CONFIG.locale, {
  hour: '2-digit', minute: '2-digit'
}).format(new Date(value));

export const formatDate = (value = new Date()) => new Intl.DateTimeFormat(APP_CONFIG.locale, {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
}).format(value);

export const initials = (name = '') => name.trim().split(/\s+/).slice(-2).map((part) => part[0] || '').join('').toUpperCase();

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));