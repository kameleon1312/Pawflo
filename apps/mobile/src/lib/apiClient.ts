import type { AuthUser } from '@pawflo/types';
import { tokenStorage } from './secureStorage';

// Set EXPO_PUBLIC_API_URL in .env.local to your laptop's LAN IP when testing on device.
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = await tokenStorage.getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body: unknown = await res.json().catch(() => ({ error: 'Nieznany błąd serwera.' }));

  if (!res.ok) {
    const msg = (body as Record<string, string>)['error'] ?? 'Nieznany błąd serwera.';
    throw new ApiError(res.status, msg);
  }

  return body as T;
}

export const api = {
  auth: {
    register: (data: {
      email: string;
      password: string;
      acceptTerms: true;
      acceptPrivacy: true;
    }) =>
      request<{ ok: boolean }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string; refreshToken: string; user: AuthUser }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify(data) },
      ),

    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    logout: (refreshToken: string) =>
      request<void>('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
  },
};
