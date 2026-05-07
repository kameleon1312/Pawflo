import { Stack } from 'expo-router';
import { Colors } from '@pawflow/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.ink },
        animation: 'fade',
      }}
    />
  );
}
