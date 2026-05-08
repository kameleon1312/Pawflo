import { Stack } from 'expo-router';
import { Colors } from '@pawflo/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.ink },
        animation: 'slide_from_right',
      }}
    />
  );
}
