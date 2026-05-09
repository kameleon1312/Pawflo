import { Tabs } from 'expo-router';
import { SimpleTabBar } from '@/components/ui/Dock';
import type { BottomTabBarProps } from '@/components/ui/Dock';

function TabBar(props: BottomTabBarProps) {
  // Home tab (index 0) uses PawNavigation on-screen — no tab bar needed
  if (props.state.index === 0) return null;
  return <SimpleTabBar {...props} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dom',
          tabBarStyle: { display: 'none' },  // prevents RN from reserving tab bar height
        }}
      />
      <Tabs.Screen name="pawpanel"     options={{ title: 'Zdrowie' }} />
      <Tabs.Screen name="machdog"      options={{ title: 'MachDog' }} />
      <Tabs.Screen name="dopasowania"  options={{ title: 'Dopasowania' }} />
      <Tabs.Screen name="pawmap"       options={{ title: 'Mapa' }} />
      <Tabs.Screen name="profile"      options={{ title: 'Profil' }} />
    </Tabs>
  );
}
