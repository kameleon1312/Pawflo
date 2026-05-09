import { createApiClient } from '@pawflo/api-client';
import { tokenStorage } from './secureStorage';

export { ApiError } from '@pawflo/api-client';

// Set EXPO_PUBLIC_API_URL in .env.local to your laptop's LAN IP when testing on device.
// e.g. EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';

// Registered by _layout.tsx — called when refresh fails so the app can clear auth state
let _onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(fn: () => void) {
  _onAuthFailure = fn;
}

export const api = createApiClient({
  baseUrl: API_URL,
  getAccessToken: () => tokenStorage.getAccessToken(),
  getRefreshToken: () => tokenStorage.getRefreshToken(),
  saveTokens: (access, refresh) => tokenStorage.setTokens(access, refresh),
  clearTokens: () => tokenStorage.clearTokens(),
  onAuthFailure: () => _onAuthFailure?.(),
});
