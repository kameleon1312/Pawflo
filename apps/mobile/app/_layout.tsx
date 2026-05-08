import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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
import { api } from '@/lib/apiClient';
import { tokenStorage } from '@/lib/secureStorage';
import { useAuthStore } from '@/stores/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
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

function RootLayoutInner() {
  useProtectedRoute();

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

        const { user, hasDog } = await api.users.me();
        setUser(user, hasDog);
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
