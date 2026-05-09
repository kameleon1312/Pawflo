import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import { useFonts } from 'expo-font';
import {
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from '@expo-google-fonts/fraunces';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '@pawflo/theme';
import { api, ApiError, registerAuthFailureHandler } from '@/lib/apiClient';
import { tokenStorage, biometricStorage } from '@/lib/secureStorage';
import { configureNotificationHandler, registerForPushNotifications } from '@/lib/pushNotifications';
import type { NotificationData } from '@/lib/pushNotifications';
import { useAuthStore } from '@/stores/authStore';

// Set foreground notification presentation before any component mounts
if (Platform.OS !== 'web') {
  configureNotificationHandler();
}

SplashScreen.preventAutoHideAsync();

// When refresh token is also expired, clear Zustand state so the route guard redirects to login
registerAuthFailureHandler(() => {
  useAuthStore.getState().clearAuth();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Never retry 401 — token refresh is handled inside apiClient
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5,
    },
  },
});

function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasDog, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isAuthenticated) {
      if (!inAuth) router.replace('/(auth)/login' as Href);
      return;
    }

    if (!hasDog) {
      if (!inOnboarding) router.replace('/(onboarding)/step-1-dog' as Href);
      return;
    }

    if (inAuth || inOnboarding) {
      router.replace('/(tabs)' as Href);
    }
  }, [isAuthenticated, hasDog, isLoading, segments]);
}

function useNotificationTapHandler() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  // Hook must be called unconditionally — platform check goes inside the effects
  const lastResponse = Notifications.useLastNotificationResponse();

  function navigateFromNotification(data: NotificationData) {
    if (data.type === 'MESSAGE' && data.matchId) {
      router.push(`/(tabs)/matches/${data.matchId}` as Href);
    } else if (data.type === 'MATCH' || data.type === 'MESSAGE') {
      router.push('/(tabs)/matches' as Href);
    }
  }

  // Notifications tapped while app is in foreground or background
  useEffect(() => {
    if (Platform.OS === 'web') return;

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      navigateFromNotification(data);
    });

    return () => responseListener.current?.remove();
  }, []);

  // Notification tapped when app was killed — captured on startup via lastResponse
  useEffect(() => {
    if (!lastResponse || Platform.OS === 'web') return;
    const data = lastResponse.notification.request.content.data as NotificationData;
    navigateFromNotification(data);
  }, [lastResponse]);
}

function RootLayoutInner() {
  useProtectedRoute();
  useNotificationTapHandler();

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.ink} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Keys must match Fonts.serif / Fonts.sans from @pawflo/theme
    'Fraunces': Fraunces_500Medium,
    'Fraunces-Italic': Fraunces_500Medium_Italic,
    'Fraunces-Bold': Fraunces_700Bold,
    'Fraunces-BoldItalic': Fraunces_700Bold_Italic,
    'Cabinet Grotesk': require('../assets/fonts/CabinetGrotesk-Regular.otf'),
    'Cabinet Grotesk-Medium': require('../assets/fonts/CabinetGrotesk-Medium.otf'),
    'Cabinet Grotesk-Bold': require('../assets/fonts/CabinetGrotesk-Bold.otf'),
    'Cabinet Grotesk-Extrabold': require('../assets/fonts/CabinetGrotesk-Extrabold.otf'),
  });

  const { setUser, setLoading } = useAuthStore();

  // Restore session on startup: read stored token → call /api/users/me → update store.
  // Splash screen is held until both fonts and session restore complete.
  useEffect(() => {
    if (!fontsLoaded) return;

    async function restoreSession() {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        if (!accessToken) return;

        // Biometric gate — if enabled, user must authenticate before session is restored
        const biometricEnabled = await biometricStorage.isEnabled();
        if (biometricEnabled && Platform.OS !== 'web') {
          const [hw, enrolled] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
          ]);
          if (hw && enrolled) {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Zaloguj się do PawFlo',
              cancelLabel: 'Użyj hasła',
              fallbackLabel: 'Użyj hasła',
            });
            if (!result.success) {
              await tokenStorage.clearTokens();
              return;
            }
          }
        }

        const { user, hasDog } = await api.users.me();
        setUser(user, hasDog);

        // Register for push notifications and send token to backend (fire-and-forget)
        if (Platform.OS !== 'web') {
          registerForPushNotifications().then((token) => {
            if (token) void api.users.updatePushToken(token);
          });
        }
      } catch {
        // 401 or network error — user stays unauthenticated, guard redirects to login
        await tokenStorage.clearTokens();
      } finally {
        setLoading(false);
        SplashScreen.hideAsync();
      }
    }

    restoreSession();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutInner />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
