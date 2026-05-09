import { Pressable, Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Colors, Fonts } from '@pawflo/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Container size — square, matches paw-3d.png aspect ratio (1:1)
const SIZE = 390;

type Zone = {
  label:  string;
  icon:   IconName;
  route:  string;
  // absolute center position within SIZE×SIZE container (percentages of image)
  cx: number;   // % from left
  cy: number;   // % from top
  r:  number;   // hit circle radius
  isCenter?: boolean;
};

// Positions derived from paw-3d.png layout (540×540 source).
// Pixel measurements: outer toes ~(78,208) & (462,208); inner toes ~(197,135) & (343,135); pad ~(270,363).
const ZONES: Zone[] = [
  { label: 'Profil psa',  icon: 'paw-outline',        route: '/(tabs)/profile',  cx: 21,   cy: 42.5, r: 32 },
  { label: 'Dopasowania', icon: 'heart',               route: '/(tabs)/matches',  cx: 38.5, cy: 25,   r: 32 },
  { label: 'Czat',        icon: 'chatbubbles-outline', route: '/(tabs)/matches',  cx: 61.5, cy: 25,   r: 32 },
  { label: 'Zdrowie',     icon: 'fitness-outline',     route: '/(tabs)/pawpanel', cx: 80,   cy: 42.5, r: 32 },
  { label: 'MachDog',     icon: 'heart',               route: '/(tabs)/machdog',  cx: 50,   cy: 67,   r: 44, isCenter: true },
];

export function PawNavigation() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* The actual 3D paw image — displayed as-is, no distortion */}
      <Image
        source={require('../../../assets/3d/paw-3d.png')}
        style={styles.paw}
        resizeMode="contain"
      />

      {/* Interactive zones overlaid on each pad */}
      {ZONES.map((zone) => {
        // Convert % center to absolute top-left corner
        const cx = (zone.cx / 100) * SIZE;
        const cy = (zone.cy / 100) * SIZE;
        const diameter = zone.r * 2;

        return (
          <Pressable
            key={zone.route + zone.label}
            onPress={() => router.push(zone.route as Href)}
            style={({ pressed }) => [
              styles.zone,
              {
                width: diameter,
                height: diameter,
                borderRadius: zone.r,
                top:  cy - zone.r,
                left: cx - zone.r,
                backgroundColor: zone.isCenter
                  ? 'rgba(240,138,138,0.32)'
                  : 'rgba(250,244,233,0.32)',
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={zone.label}
          >
            <Ionicons
              name={zone.icon}
              size={zone.isCenter ? 24 : 18}
              color={zone.isCenter ? Colors.cream : Colors.coral}
            />
            <Text
              style={[
                styles.label,
                { color: zone.isCenter ? Colors.cream : Colors.coral },
              ]}
              numberOfLines={1}
            >
              {zone.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'flex-end',
    marginRight: -36,
  },
  paw: {
    width: SIZE,
    height: SIZE,
  },
  zone: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.92 }],
  },
});
