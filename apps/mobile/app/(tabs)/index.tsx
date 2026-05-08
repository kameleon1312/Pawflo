import { useEffect, useRef } from 'react';
import { Animated, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Shortcut = { key: string; label: string; icon: IconName; route: string; color: string };

const SHORTCUTS: Shortcut[] = [
  { key: 'machdog',      label: 'MachDog',       icon: 'heart',                  route: '/(tabs)/machdog',   color: Colors.coral },
  { key: 'health',       label: 'Zdrowie',        icon: 'fitness-outline',         route: '/(tabs)/pawpanel',  color: Colors.success },
  { key: 'map',          label: 'Mapa',            icon: 'map-outline',             route: '/(tabs)/pawmap',    color: Colors.info },
  { key: 'dog',          label: 'Mój pies',        icon: 'paw-outline',             route: '/(tabs)/profile',   color: Colors.coralSoft },
  { key: 'chat',         label: 'Chat',            icon: 'chatbubbles-outline',     route: '/(tabs)/machdog',   color: Colors.warning },
  { key: 'notifs',       label: 'Powiadomienia',   icon: 'notifications-outline',   route: '/(tabs)/index',     color: Colors.textFaint },
];

export default function HomeScreen() {
  const router = useRouter();

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyY      = useRef(new Animated.Value(24)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const gridScale  = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(copyOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(copyY,       { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(gridOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(gridScale, { toValue: 1, speed: 16, bounciness: 5, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Hero photo */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: heroOpacity }]}>
        <ImageBackground
          source={require('../../assets/images/hero-dog.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Top vignette — logo legibility */}
      <LinearGradient
        colors={[Colors.ink, 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Bottom vignette — content legibility */}
      <LinearGradient
        colors={['transparent', Colors.ink, Colors.ink]}
        locations={[0, 0.55, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>PawFlo</Text>
            <Text style={styles.tagline}>{strings.home.tagline}</Text>
          </View>
          <Pressable style={styles.bellWrap} hitSlop={12} accessibilityRole="button" accessibilityLabel="Powiadomienia">
            <Ionicons name="notifications-outline" size={24} color={Colors.cream} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        {/* Spacer — lets the dog photo breathe */}
        <View style={{ flex: 1 }} />

        {/* ── Copy + CTA ── */}
        <Animated.View style={[styles.copyWrap, { opacity: copyOpacity, transform: [{ translateY: copyY }] }]}>
          <Text style={styles.h1}>{strings.home.hero}</Text>
          <Text style={styles.sub}>{strings.home.heroSub}</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/machdog' as Href)}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={strings.home.cta}
          >
            <LinearGradient
              colors={[Colors.coral, Colors.coralDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaInner}
            >
              <Text style={styles.ctaText}>{strings.home.cta}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── Shortcut grid ── */}
        <Animated.View style={[styles.grid, { opacity: gridOpacity, transform: [{ scale: gridScale }] }]}>
          {SHORTCUTS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.shortcut, pressed && { opacity: 0.65 }]}
              onPress={() => router.push(item.route as Href)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: `${item.color}22` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.shortcutLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: Colors.ink },
  safeArea: { flex: 1 },

  topGradient: {
    ...StyleSheet.absoluteFillObject,
    bottom: '62%',
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '32%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  logo: {
    fontFamily: Fonts.serif,   // 'Fraunces'
    fontSize: 28,
    color: Colors.cream,
    letterSpacing: -0.4,
  },
  tagline: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.coralSoft,
    letterSpacing: 3.2,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  bellWrap: {
    marginTop: 4,
    padding: 4,
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },

  // Copy
  copyWrap: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  h1: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h1,
    color: Colors.cream,
    lineHeight: FontSize.h1 * 1.18,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    lineHeight: FontSize.bodySm * 1.6,
    marginBottom: 20,
  },
  cta: {
    borderRadius: 100,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  ctaInner: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    minWidth: 192,
  },
  ctaText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.cta,
    color: Colors.cream,
    letterSpacing: 0.2,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
  },
  shortcut: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 76,
    justifyContent: 'center',
  },
  shortcutIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  shortcutLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.bone,
    textAlign: 'center',
  },
});
