import { Stack } from 'expo-router';
import { Colors } from '@pawflo/theme';

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
