import type {
  Allergy,
  AuthUser,
  CandidateDog,
  Dog,
  MatchSummary,
  Medication,
  Vaccination,
  VetVisit,
  WeightEntry,
} from '@pawflo/types';
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

// Registered by _layout.tsx — called when refresh fails so the app can clear auth state
let _onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(fn: () => void) {
  _onAuthFailure = fn;
}

// Serialises concurrent 401s into a single refresh call
let _refreshPromise: Promise<void> | null = null;

async function fetchWithAuth(path: string, options: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

// Multipart upload — does NOT inject Content-Type so fetch sets it with the boundary
async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const token = await tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData });

  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => ({ error: 'Nieznany błąd serwera.' }));
  if (!res.ok) {
    const msg = (body as Record<string, string>)['error'] ?? 'Nieznany błąd serwera.';
    throw new ApiError(res.status, msg);
  }
  return body as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStorage.getAccessToken();
  let res = await fetchWithAuth(path, options, token);

  if (res.status === 401) {
    // Avoid parallel refresh calls — all 401s share the same promise
    if (!_refreshPromise) {
      _refreshPromise = (async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('no_refresh_token');

        const refreshRes = await fetchWithAuth(
          '/api/auth/refresh',
          { method: 'POST', body: JSON.stringify({ refreshToken }) },
          null,
        );
        if (!refreshRes.ok) throw new Error('refresh_failed');

        const data = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
        await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      })().finally(() => { _refreshPromise = null; });
    }

    try {
      await _refreshPromise;
      const newToken = await tokenStorage.getAccessToken();
      res = await fetchWithAuth(path, options, newToken);
    } catch {
      await tokenStorage.clearTokens();
      _onAuthFailure?.();
      throw new ApiError(401, 'Sesja wygasła. Zaloguj się ponownie.');
    }
  }

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
      request<{ accessToken: string; refreshToken: string; user: AuthUser; hasDog: boolean }>(
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

    forgotPassword: (email: string) =>
      request<{ ok: boolean }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  users: {
    me: () =>
      request<{ user: AuthUser; hasDog: boolean }>('/api/users/me'),

    update: (data: { firstName?: string; lastName?: string }) =>
      request<{ user: AuthUser }>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deleteAccount: (password: string) =>
      request<void>('/api/users/me', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      }),

    exportData: () =>
      request<Record<string, unknown>>('/api/users/me/export'),
  },

  dogs: {
    list: () =>
      request<{ dogs: Dog[] }>('/api/dogs'),

    get: (id: string) =>
      request<{ dog: Dog }>(`/api/dogs/${id}`),

    create: (data: {
      name: string;
      breed?: string | null;
      sex: string;
      size: string;
      birthDate?: string | null;
      bio?: string | null;
      traits?: string[];
      activityLevel?: string;
      weight?: number | null;
    }) =>
      request<{ dog: Dog }>('/api/dogs', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<{
      name: string;
      breed: string | null;
      sex: string;
      size: string;
      birthDate: string | null;
      bio: string | null;
      traits: string[];
      activityLevel: string;
      weight: number | null;
    }>) =>
      request<{ dog: Dog }>(`/api/dogs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    remove: (id: string) =>
      request<void>(`/api/dogs/${id}`, { method: 'DELETE' }),

    uploadPhoto: (dogId: string, uri: string, mimeType: string, fileName: string) => {
      const form = new FormData();
      form.append('file', { uri, type: mimeType, name: fileName } as unknown as Blob);
      return uploadRequest<{ photo: { id: string; url: string; order: number } }>(
        `/api/dogs/${dogId}/photos/upload`,
        form,
      );
    },

    addPhoto: (dogId: string, url: string, order = 0) =>
      request<{ photo: { id: string; url: string; order: number } }>(
        `/api/dogs/${dogId}/photos`,
        { method: 'POST', body: JSON.stringify({ url, order }) },
      ),

    removePhoto: (dogId: string, photoId: string) =>
      request<void>(`/api/dogs/${dogId}/photos/${photoId}`, { method: 'DELETE' }),
  },

  swipes: {
    candidates: () =>
      request<{ candidates: CandidateDog[] }>('/api/swipes/candidates'),

    create: (swipeeId: string, direction: 'LIKE' | 'PASS') =>
      request<{ matched: boolean; matchId?: string }>('/api/swipes', {
        method: 'POST',
        body: JSON.stringify({ swipeeId, direction }),
      }),
  },

  matches: {
    list: () =>
      request<{ matches: MatchSummary[] }>('/api/matches'),

    unmatch: (matchId: string) =>
      request<void>(`/api/matches/${matchId}`, { method: 'DELETE' }),
  },

  chat: {
    messages: (matchId: string) =>
      request<{ messages: import('@pawflo/types').Message[] }>(
        `/api/matches/${matchId}/messages`,
      ),

    send: (matchId: string, text: string) =>
      request<{ message: import('@pawflo/types').Message }>(
        `/api/matches/${matchId}/messages`,
        { method: 'POST', body: JSON.stringify({ text }) },
      ),
  },

  health: {
    // Vaccinations
    vaccinations: () =>
      request<{ vaccinations: Vaccination[] }>('/api/health/vaccinations'),
    addVaccination: (data: { name: string; date: string; validUntil?: string | null; vetId?: string | null }) =>
      request<{ vaccination: Vaccination }>('/api/health/vaccinations', {
        method: 'POST', body: JSON.stringify(data),
      }),
    deleteVaccination: (id: string) =>
      request<void>(`/api/health/vaccinations/${id}`, { method: 'DELETE' }),

    // Vet visits
    visits: () =>
      request<{ visits: VetVisit[] }>('/api/health/visits'),
    addVisit: (data: { date: string; notes?: string | null; vetId?: string | null }) =>
      request<{ visit: VetVisit }>('/api/health/visits', {
        method: 'POST', body: JSON.stringify(data),
      }),
    deleteVisit: (id: string) =>
      request<void>(`/api/health/visits/${id}`, { method: 'DELETE' }),

    // Weight
    weight: () =>
      request<{ entries: WeightEntry[] }>('/api/health/weight'),
    addWeight: (data: { weightKg: number; date: string }) =>
      request<{ entry: WeightEntry }>('/api/health/weight', {
        method: 'POST', body: JSON.stringify(data),
      }),
    deleteWeight: (id: string) =>
      request<void>(`/api/health/weight/${id}`, { method: 'DELETE' }),

    // Medications
    medications: () =>
      request<{ medications: Medication[] }>('/api/health/medications'),
    addMedication: (data: {
      name: string; startDate: string; endDate?: string | null;
      dosage: string; frequency: string;
    }) =>
      request<{ medication: Medication }>('/api/health/medications', {
        method: 'POST', body: JSON.stringify(data),
      }),
    deleteMedication: (id: string) =>
      request<void>(`/api/health/medications/${id}`, { method: 'DELETE' }),

    // Allergies
    allergies: () =>
      request<{ allergies: Allergy[] }>('/api/health/allergies'),
    addAllergy: (data: { name: string; severity: string; notes?: string | null }) =>
      request<{ allergy: Allergy }>('/api/health/allergies', {
        method: 'POST', body: JSON.stringify(data),
      }),
    deleteAllergy: (id: string) =>
      request<void>(`/api/health/allergies/${id}`, { method: 'DELETE' }),
  },
};
