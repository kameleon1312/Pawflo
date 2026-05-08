import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

// Minimal local type — avoids declaring @react-navigation/bottom-tabs as a direct dep
// (it's already a transitive dep of expo-router, but not resolvable by tsc without declaration).
type TabRoute = { key: string; name: string };
type TabDescriptor = { options: { title?: string } };
type TabNavigation = {
  emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
  navigate: (name: string) => void;
};
export type BottomTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<string, TabDescriptor>;
  navigation: TabNavigation;
};
import { Colors, Fonts, FontSize } from '@pawflo/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index:    { active: 'home',          inactive: 'home-outline' },
  pawpanel: { active: 'fitness',       inactive: 'fitness-outline' },
  machdog:  { active: 'heart',         inactive: 'heart-outline' },
  pawmap:   { active: 'map',           inactive: 'map-outline' },
  profile:  { active: 'person-circle', inactive: 'person-circle-outline' },
};

// Shown on all tabs except home — standard dark tab bar
export function SimpleTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[simpleStyles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const label = (descriptors[route.key]?.options.title ?? route.name) as string;
        const icons = ICONS[route.name];
        const iconName = isFocused ? icons?.active : icons?.inactive;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [simpleStyles.tab, pressed && { opacity: 0.65 }]}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
          >
            <Ionicons
              name={iconName ?? 'ellipse-outline'}
              size={22}
              color={isFocused ? Colors.coral : Colors.textFaint}
            />
            <Text style={[simpleStyles.label, isFocused && simpleStyles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Shown only on the home tab — 3D paw button for MachDog in center
export function Dock({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      speed: 14,
      bounciness: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        dockStyles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 8), transform: [{ translateY }] },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isMachDog = route.name === 'machdog';
        const label = (descriptors[route.key]?.options.title ?? route.name) as string;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (isMachDog) {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [dockStyles.machdogTab, pressed && { opacity: 0.82 }]}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isFocused }}
            >
              <LinearGradient
                colors={isFocused
                  ? [Colors.coral, Colors.coralDeep]
                  : [Colors.inkSoft, '#221810']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[dockStyles.machdogButton, isFocused && dockStyles.machdogButtonActive]}
              >
                <Image
                  source={require('../../../assets/3d/paw-3d.png')}
                  style={[dockStyles.pawImage, !isFocused && dockStyles.pawImageInactive]}
                  resizeMode="contain"
                />
              </LinearGradient>
              <Text style={[dockStyles.label, isFocused && dockStyles.labelActive]}>{label}</Text>
            </Pressable>
          );
        }

        const icons = ICONS[route.name];
        const iconName = isFocused ? icons?.active : icons?.inactive;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [dockStyles.tab, pressed && { opacity: 0.65 }]}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
          >
            <Ionicons
              name={iconName ?? 'ellipse-outline'}
              size={22}
              color={isFocused ? Colors.coral : Colors.textFaint}
            />
            <Text style={[dockStyles.label, isFocused && dockStyles.labelActive]}>{label}</Text>
            {isFocused && <View style={dockStyles.dot} />}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const simpleStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.ink,
    borderTopWidth: 1,
    borderTopColor: Colors.warmLine,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.textFaint,
  },
  labelActive: {
    color: Colors.coral,
  },
});

const dockStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.inkSoft,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,219,197,0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingBottom: 4,
    minHeight: 52,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.textFaint,
  },
  labelActive: {
    color: Colors.coral,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.coral,
    marginTop: 1,
  },
  machdogTab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  machdogButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  machdogButtonActive: {
    shadowColor: Colors.coral,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 12,
  },
  pawImage: {
    width: 36,
    height: 36,
  },
  pawImageInactive: {
    opacity: 0.5,
  },
});
