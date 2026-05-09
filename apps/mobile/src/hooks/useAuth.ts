import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '@/lib/apiClient';
import { tokenStorage, biometricStorage } from '@/lib/secureStorage';
import { registerForPushNotifications } from '@/lib/pushNotifications';
import { disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: async ({ accessToken, refreshToken, user, hasDog }) => {
      await tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user, hasDog);
      // Register push token immediately after login — fire-and-forget
      if (Platform.OS !== 'web') {
        registerForPushNotifications().then((token) => {
          if (token) void api.users.updatePushToken(token);
        });
      }
      router.replace((hasDog ? '/(tabs)' : '/(onboarding)/step-1-dog') as Href);
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: api.auth.register,
    onSuccess: () => {
      // Always redirects to login — API returns 201 even for duplicate emails (anti-enumeration).
      // We pass a query param so login screen can show a success banner.
      router.replace('/(auth)/login?registered=1');
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: () => api.users.exportData(),
  });
}

export function useDeleteAccount() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: (password: string) => api.users.deleteAccount(password),
    onSuccess: async () => {
      await tokenStorage.clearTokens();
      clearAuth();
      router.replace('/(auth)/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) await api.auth.logout(refreshToken);
    },
    onSettled: async () => {
      disconnectSocket();
      await tokenStorage.clearTokens();
      clearAuth();
      router.replace('/(auth)/login');
    },
  });
}

export function useBiometricSetup() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    async function check() {
      const [hw, enrolled, enabled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        biometricStorage.isEnabled(),
      ]);
      setIsAvailable(hw && enrolled);
      setIsEnabled(enabled);
    }
    check();
  }, []);

  const toggle = useCallback(async () => {
    const next = !isEnabled;
    if (next) {
      // Require biometric confirmation before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Potwierdź, aby włączyć logowanie biometryczne',
        cancelLabel: 'Anuluj',
      });
      if (!result.success) return;
    }
    await biometricStorage.setEnabled(next);
    setIsEnabled(next);
  }, [isEnabled]);

  return { isAvailable, isEnabled, toggle };
}
