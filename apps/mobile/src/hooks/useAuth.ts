import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '@/lib/apiClient';
import { tokenStorage } from '@/lib/secureStorage';
import { useAuthStore } from '@/stores/authStore';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: async ({ accessToken, refreshToken, user }) => {
      await tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user);
      router.replace('/(tabs)');
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

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) await api.auth.logout(refreshToken);
    },
    onSettled: async () => {
      await tokenStorage.clearTokens();
      clearAuth();
      router.replace('/(auth)/login');
    },
  });
}
