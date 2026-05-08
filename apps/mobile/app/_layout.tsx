import { useEffect } from 'react';
import { Stack } from 'expo-router';
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

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

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

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={Colors.ink} />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
