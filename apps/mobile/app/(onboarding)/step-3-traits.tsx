import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useCreateDog } from '@/hooks/useDogs';
import type { ActivityLevel } from '@pawflo/types';

const s = strings.onboarding.step3;

type TraitKey = keyof typeof s.traits;
const ALL_TRAITS: TraitKey[] = ['PLAYFUL', 'CALM', 'FRIENDLY', 'PROTECTIVE', 'ENERGETIC', 'LAZY', 'CURIOUS', 'GENTLE'];

type ActivityPill = { label: string; value: ActivityLevel };
const ACTIVITY_OPTIONS: ActivityPill[] = [
  { label: s.activityCalm,     value: 'CALM' },
  { label: s.activityModerate, value: 'MODERATE' },
  { label: s.activityActive,   value: 'ACTIVE' },
];

export default function Step3TraitsScreen() {
  const router = useRouter();
  const dog = useOnboardingStore((st) => st.dog);
  const setStep3 = useOnboardingStore((st) => st.setStep3);
  const reset = useOnboardingStore((st) => st.reset);

  const [traits,        setTraits]        = useState<TraitKey[]>([]);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  const createDog = useCreateDog();
  const canSubmit = activityLevel !== null && !createDog.isPending;

  function toggleTrait(t: TraitKey) {
    setTraits((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  async function handleFinish() {
    if (!canSubmit) return;

    setStep3({ activityLevel, traits });

    const birthDate = dog.birthYear ? `${dog.birthYear}-01-01` : null;

    await createDog.mutateAsync({
      name:          dog.name,
      breed:         dog.breed || null,
      sex:           dog.sex!,
      size:          dog.size!,
      birthDate,
      activityLevel,
      traits,
    });

    reset();
    // authStore.hasDog is set to true inside useCreateDog → auth guard redirects to /(tabs)
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.step}>3 / 3</Text>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.subtitle}>{s.subtitle}</Text>
        </View>

        {/* Traits */}
        <Text style={styles.label}>{s.traitsLabel}</Text>
        <View style={styles.pillGrid}>
          {ALL_TRAITS.map((t) => {
            const active = traits.includes(t);
            return (
              <Pressable
                key={t}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => toggleTrait(t)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {s.traits[t]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Activity level */}
        <Text style={[styles.label, { marginTop: 28 }]}>{s.activityLabel}</Text>
        <View style={styles.pillRow}>
          {ACTIVITY_OPTIONS.map((opt) => {
            const active = activityLevel === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setActivityLevel(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Error */}
        {createDog.isError && (
          <Text style={styles.error}>{strings.errors.generic}</Text>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.cta, !canSubmit && styles.ctaDisabled]}
          onPress={handleFinish}
          disabled={!canSubmit}
          accessibilityRole="button"
        >
          {createDog.isPending ? (
            <ActivityIndicator color={Colors.cream} />
          ) : (
            <Text style={styles.ctaText}>{s.cta}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.ink },
  flex:   { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },

  header: { marginBottom: 32 },
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

  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    marginBottom: 10,
  },

  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pillRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  pill: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    paddingHorizontal: 16,
    paddingVertical: 9,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillActive:     { borderColor: Colors.coral, backgroundColor: 'rgba(240,138,138,0.12)' },
  pillText:       { fontFamily: Fonts.sans, fontSize: FontSize.bodySm, color: Colors.bone },
  pillTextActive: { color: Colors.coral },

  error: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.coral,
    marginTop: 16,
    textAlign: 'center',
  },

  footer: { paddingHorizontal: 24, paddingBottom: 8, paddingTop: 12 },
  cta: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.body,
    color: Colors.cream,
  },
});
