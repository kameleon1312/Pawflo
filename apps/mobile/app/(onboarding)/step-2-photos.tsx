import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';

const s = strings.onboarding.step2;

// expo-image-picker is not installed — photo picking requires user approval (>50KB dependency).
// This screen serves as a placeholder that lets users skip and complete onboarding.
export default function Step2PhotosScreen() {
  const router = useRouter();

  function handleNext() {
    router.push('/(onboarding)/step-3-traits' as Href);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.step}>2 / 3</Text>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.subtitle}>{s.subtitle}</Text>
        </View>

        {/* Placeholder */}
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={56} color={Colors.inkSoft} />
          <Text style={styles.placeholderText}>{s.comingSoon}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={styles.cta}
            onPress={handleNext}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{s.skipCta}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.ink },
  root: { flex: 1, paddingHorizontal: 24 },

  header: { paddingTop: 16, marginBottom: 40 },
  step: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.coralSoft,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h1,
    color: Colors.cream,
    lineHeight: FontSize.h1 * 1.18,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    lineHeight: FontSize.bodySm * 1.6,
  },

  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  placeholderText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.inkSoft,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: FontSize.bodySm * 1.6,
  },

  footer: { paddingBottom: 8, paddingTop: 12 },
  cta: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.body,
    color: Colors.cream,
  },
});
