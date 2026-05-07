import { Tabs } from 'expo-router';
import { Colors, FontSize, Fonts } from '@pawflow/theme';
import { strings } from '@/i18n/strings.pl';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.coral,
        tabBarInactiveTintColor: Colors.textFaint,
        tabBarStyle: {
          backgroundColor: Colors.ink,
          borderTopColor: Colors.warmLine,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.sans,
          fontSize: FontSize.micro,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: strings.tabs.home }} />
      <Tabs.Screen name="machdog" options={{ title: strings.tabs.machdog }} />
      <Tabs.Screen name="pawpanel" options={{ title: strings.tabs.pawpanel }} />
      <Tabs.Screen name="pawmap" options={{ title: strings.tabs.pawmap }} />
      <Tabs.Screen name="profile" options={{ title: strings.tabs.profile }} />
    </Tabs>
  );
}
