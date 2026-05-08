import { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('screen');
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { PawNavigation } from '@/components/home/PawNavigation';

export default function HomeScreen() {
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyY       = useRef(new Animated.Value(24)).current;
  const pawOpacity  = useRef(new Animated.Value(0)).current;
  const pawScale    = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(copyOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(copyY,       { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pawOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(pawScale,   { toValue: 1, speed: 14, bounciness: 7, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Hero photo — uses physical screen dimensions so it isn't clipped by the tab navigator container ── */}
      <Animated.View style={[styles.heroFill, { opacity: heroOpacity }]}>
        <ImageBackground
          source={require('../../assets/images/hero-dog.jpg')}
          style={styles.heroFill}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Top vignette */}
      <LinearGradient
        colors={[Colors.ink, 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Bottom scrim — semi-transparent so hero shows through the paw area */}
      <LinearGradient
        colors={['transparent', 'rgba(27,20,17,0.42)', 'rgba(27,20,17,0.68)']}
        locations={[0, 0.5, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* ── Header — anchored to top ── */}
      <SafeAreaView style={styles.headerSafe} edges={['top']} pointerEvents="box-none">
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>PawFlo</Text>
            <Text style={styles.tagline}>{strings.home.tagline}</Text>
          </View>
          <Pressable
            style={styles.bellWrap}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Powiadomienia"
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.cream} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Copy — floating at ~30% from top ── */}
      <Animated.View
        style={[styles.copyWrap, { opacity: copyOpacity, transform: [{ translateY: copyY }] }]}
        pointerEvents="none"
      >
        <Text style={styles.h1}>{strings.home.hero}</Text>
        <Text style={styles.sub}>{strings.home.heroSub}</Text>
      </Animated.View>

      {/* ── Paw navigation — anchored to bottom ── */}
      <SafeAreaView style={styles.pawSafe} edges={['bottom']} pointerEvents="box-none">
        <Animated.View style={{ opacity: pawOpacity, transform: [{ scale: pawScale }] }}>
          <PawNavigation />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.ink },

  heroFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SW,
    height: SH,
  },

  topGradient: {
    ...StyleSheet.absoluteFillObject,
    bottom: '55%',
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '52%',
  },

  // Header fixed at the top of the screen
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logo: {
    fontFamily: Fonts.serif,
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
  bellWrap: { marginTop: 4, padding: 4 },
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

  // Copy floats at ~22% from top
  copyWrap: {
    position: 'absolute',
    top: '22%',
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },

  // Paw anchored to the bottom-right corner, pushed slightly below visible area
  pawSafe: {
    position: 'absolute',
    bottom: -28,
    left: 0,
    right: 0,
  },
  h1: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h1,
    color: Colors.cream,
    lineHeight: FontSize.h1 * 1.18,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  sub: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    lineHeight: FontSize.bodySm * 1.6,
  },
});
