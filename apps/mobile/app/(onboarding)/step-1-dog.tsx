import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { DogSex, DogSize } from '@pawflo/types';

const s = strings.onboarding.step1;

type Pill<T extends string> = { label: string; value: T };

const SEX_OPTIONS: Pill<DogSex>[] = [
  { label: s.sexMale,   value: 'MALE' },
  { label: s.sexFemale, value: 'FEMALE' },
];

const SIZE_OPTIONS: Pill<DogSize>[] = [
  { label: s.sizeSmall,  value: 'SMALL' },
  { label: s.sizeMedium, value: 'MEDIUM' },
  { label: s.sizeLarge,  value: 'LARGE' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

export default function Step1DogScreen() {
  const router = useRouter();
  const setStep1 = useOnboardingStore((s) => s.setStep1);

  const [name,      setName]      = useState('');
  const [breed,     setBreed]     = useState('');
  const [sex,       setSex]       = useState<DogSex | null>(null);
  const [size,      setSize]      = useState<DogSize | null>(null);
  const [birthYear, setBirthYear] = useState<number | null>(null);

  const canProceed = name.trim().length > 0 && sex !== null && size !== null;

  function handleNext() {
    if (!canProceed) return;
    setStep1({ name: name.trim(), breed: breed.trim() || '', sex, size, birthYear });
    router.push('/(onboarding)/step-2-photos' as Href);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.step}>1 / 3</Text>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.subtitle}>{s.subtitle}</Text>
          </View>

          {/* Name */}
          <TextInput
            style={styles.input}
            placeholder={s.namePlaceholder}
            placeholderTextColor={Colors.inkSoft}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Breed */}
          <TextInput
            style={styles.input}
            placeholder={s.breedPlaceholder}
            placeholderTextColor={Colors.inkSoft}
            value={breed}
            onChangeText={setBreed}
            autoCapitalize="words"
            returnKeyType="done"
          />

          {/* Sex */}
          <Text style={styles.label}>{s.sexLabel}</Text>
          <View style={styles.pillRow}>
            {SEX_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.pill, sex === opt.value && styles.pillActive]}
                onPress={() => setSex(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: sex === opt.value }}
              >
                <Text style={[styles.pillText, sex === opt.value && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Size */}
          <Text style={styles.label}>{s.sizeLabel}</Text>
          <View style={styles.pillRow}>
            {SIZE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.pill, size === opt.value && styles.pillActive]}
                onPress={() => setSize(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: size === opt.value }}
              >
                <Text style={[styles.pillText, size === opt.value && styles.pillTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Birth year */}
          <Text style={styles.label}>{s.birthYearLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearRow}
          >
            {YEAR_OPTIONS.map((year) => (
              <Pressable
                key={year}
                style={[styles.pill, birthYear === year && styles.pillActive]}
                onPress={() => setBirthYear(birthYear === year ? null : year)}
                accessibilityRole="radio"
                accessibilityState={{ selected: birthYear === year }}
              >
                <Text style={[styles.pillText, birthYear === year && styles.pillTextActive]}>
                  {year}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.cta, !canProceed && styles.ctaDisabled]}
            onPress={handleNext}
            disabled={!canProceed}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{s.cta}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.ink },
  flex:  { flex: 1 },
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

  input: {
    backgroundColor: Colors.inkSoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
    marginBottom: 12,
    minHeight: 52,
  },

  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    marginTop: 16,
    marginBottom: 8,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yearRow: { gap: 8, paddingBottom: 4 },

  pill: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: Colors.coral,
    backgroundColor: 'rgba(240,138,138,0.12)',
  },
  pillText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
  },
  pillTextActive: { color: Colors.coral },

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
