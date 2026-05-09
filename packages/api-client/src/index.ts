import type {
  Allergy,
  AuthUser,
  CandidateDog,
  Dog,
  MatchSummary,
  Medication,
  Message,
  Place,
  PlaceType,
  Vaccination,
  VetVisit,
  WeightEntry,
} from '@pawflo/types';

// ── Error ─────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  saveTokens: (access: string, refresh: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  onAuthFailure?: () => void;
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, getAccessToken, getRefreshToken, saveTokens, clearTokens } = config;

  // Serialises concurrent 401s into a single refresh call
  let _refreshPromise: Promise<void> | null = null;

  async function fetchWithAuth(
    path: string,
    options: RequestInit,
    token: string | null,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${baseUrl}${path}`, { ...options, headers });
  }

  async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // FormData is valid as fetch body in both browser and RN environments;
    // `any` bypasses the BodyInit / BodyInit_ name mismatch between DOM and RN typings.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await fetch(`${baseUrl}${path}`, { method: 'POST', headers, body: formData as any });

    if (res.status === 204) return undefined as T;
    const body: unknown = await res.json().catch(() => ({ error: 'Nieznany błąd serwera.' }));
    if (!res.ok) {
      const msg = (body as Record<string, string>)['error'] ?? 'Nieznany błąd serwera.';
      throw new ApiError(res.status, msg);
    }
    return body as T;
  }

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getAccessToken();
    let res = await fetchWithAuth(path, options, token);

    if (res.status === 401) {
      if (!_refreshPromise) {
        _refreshPromise = (async () => {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) throw new Error('no_refresh_token');

          const refreshRes = await fetchWithAuth(
            '/api/auth/refresh',
            { method: 'POST', body: JSON.stringify({ refreshToken }) },
            null,
          );
          if (!refreshRes.ok) throw new Error('refresh_failed');

          const data = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
          await saveTokens(data.accessToken, data.refreshToken);
        })().finally(() => {
          _refreshPromise = null;
        });
      }

      try {
        await _refreshPromise;
        const newToken = await getAccessToken();
        res = await fetchWithAuth(path, options, newToken);
      } catch {
        await clearTokens();
        config.onAuthFailure?.();
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

  // ── Routes ─────────────────────────────────────────────────────────────────

  return {
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

      updatePushToken: (token: string) =>
        request<void>('/api/users/push-token', {
          method: 'POST',
          body: JSON.stringify({ token }),
        }),
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

      update: (
        id: string,
        data: Partial<{
          name: string;
          breed: string | null;
          sex: string;
          size: string;
          birthDate: string | null;
          bio: string | null;
          traits: string[];
          activityLevel: string;
          weight: number | null;
        }>,
      ) =>
        request<{ dog: Dog }>(`/api/dogs/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),

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
        request<{ messages: Message[] }>(`/api/matches/${matchId}/messages`),

      send: (matchId: string, text: string) =>
        request<{ message: Message }>(`/api/matches/${matchId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text }),
        }),
    },

    places: {
      list: (params: { lat: number; lng: number; radius?: number; type?: PlaceType }) => {
        const qs = new URLSearchParams({
          lat: String(params.lat),
          lng: String(params.lng),
          ...(params.radius !== undefined && { radius: String(params.radius) }),
          ...(params.type && { type: params.type }),
        });
        return request<{ places: (Place & { distanceKm: number })[] }>(`/api/places?${qs}`);
      },
    },

    health: {
      vaccinations: () =>
        request<{ vaccinations: Vaccination[] }>('/api/health/vaccinations'),
      addVaccination: (data: {
        name: string;
        date: string;
        validUntil?: string | null;
        vetId?: string | null;
      }) =>
        request<{ vaccination: Vaccination }>('/api/health/vaccinations', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      deleteVaccination: (id: string) =>
        request<void>(`/api/health/vaccinations/${id}`, { method: 'DELETE' }),

      visits: () =>
        request<{ visits: VetVisit[] }>('/api/health/visits'),
      addVisit: (data: { date: string; notes?: string | null; vetId?: string | null }) =>
        request<{ visit: VetVisit }>('/api/health/visits', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      deleteVisit: (id: string) =>
        request<void>(`/api/health/visits/${id}`, { method: 'DELETE' }),

      weight: () =>
        request<{ entries: WeightEntry[] }>('/api/health/weight'),
      addWeight: (data: { weightKg: number; date: string }) =>
        request<{ entry: WeightEntry }>('/api/health/weight', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      deleteWeight: (id: string) =>
        request<void>(`/api/health/weight/${id}`, { method: 'DELETE' }),

      medications: () =>
        request<{ medications: Medication[] }>('/api/health/medications'),
      addMedication: (data: {
        name: string;
        startDate: string;
        endDate?: string | null;
        dosage: string;
        frequency: string;
      }) =>
        request<{ medication: Medication }>('/api/health/medications', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      deleteMedication: (id: string) =>
        request<void>(`/api/health/medications/${id}`, { method: 'DELETE' }),

      allergies: () =>
        request<{ allergies: Allergy[] }>('/api/health/allergies'),
      addAllergy: (data: { name: string; severity: string; notes?: string | null }) =>
        request<{ allergy: Allergy }>('/api/health/allergies', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      deleteAllergy: (id: string) =>
        request<void>(`/api/health/allergies/${id}`, { method: 'DELETE' }),
    },
  };
}
