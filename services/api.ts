import { APP_CONFIG } from '../utils/config.ts';

export async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T | null> {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!response.ok) throw new Error(`Yêu cầu thất bại (${response.status}).`);
  if (response.status === 204) return null;
  return response.json() as Promise<T>;
}