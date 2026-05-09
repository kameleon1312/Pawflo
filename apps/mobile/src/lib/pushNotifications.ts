import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are presented when the app is in the foreground.
// Called once at app startup (in _layout.tsx) before any notification arrives.
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // Request permission (iOS shows a dialog; Android 13+ also requires it)
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  // Android needs a notification channel before the app can receive pushes
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PawFlo',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F08A8A',
    });
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    return token;
  } catch {
    // Simulators and some Android emulators don't support push tokens
    return null;
  }
}

export type NotificationData = {
  type: 'MATCH' | 'MESSAGE';
  matchId?: string;
};
