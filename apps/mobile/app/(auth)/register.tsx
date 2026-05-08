import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { z } from 'zod';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@pawflo/theme';
import { RegisterSchema } from '@pawflo/validation';
import { PawButton } from '@/components/ui/PawButton';
import { PawInput } from '@/components/ui/PawInput';
import { useRegister } from '@/hooks/useAuth';
import { strings } from '@/i18n/strings.pl';

// Extends RegisterSchema with client-side passwordConfirm — stripped before API call.
const RegisterFormSchema = RegisterSchema.extend({
  passwordConfirm: z.string().min(1, 'Potwierdź hasło'),
}).refine((d) => d.password === d.passwordConfirm, {
  message: strings.errors.passwordMismatch,
  path: ['passwordConfirm'],
});

type RegisterFormInput = z.infer<typeof RegisterFormSchema>;

export default function RegisterScreen() {
  const register = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      acceptTerms: undefined as unknown as true,
      acceptPrivacy: undefined as unknown as true,
    },
  });

  const onSubmit = ({ passwordConfirm: _pc, ...data }: RegisterFormInput) => {
    register.mutate(data);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + heading */}
          <View style={styles.header}>
            <Text style={styles.logo}>PawFlo</Text>
            <Text style={styles.heading}>{strings.auth.registerTitle}</Text>
            <Text style={styles.subtitle}>{strings.auth.registerSubtitle}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <PawInput
                  label={strings.auth.email}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PawInput
                  label={strings.auth.password}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="next"
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="passwordConfirm"
              render={({ field: { onChange, onBlur, value } }) => (
                <PawInput
                  label={strings.auth.passwordConfirm}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="done"
                  error={errors.passwordConfirm?.message}
                />
              )}
            />

            {/* Consent checkboxes */}
            <View style={styles.checkboxGroup}>
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    style={styles.checkRow}
                    onPress={() => onChange(value ? (undefined as unknown as true) : true)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!value }}
                    accessibilityLabel={strings.auth.acceptTerms}
                  >
                    <View style={[styles.checkbox, !!value && styles.checkboxChecked]}>
                      {!!value && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkLabel, !!errors.acceptTerms && styles.checkLabelError]}>
                      {strings.auth.acceptTerms}
                    </Text>
                  </Pressable>
                )}
              />
              {errors.acceptTerms && (
                <Text style={styles.fieldError}>{errors.acceptTerms.message}</Text>
              )}

              <Controller
                control={control}
                name="acceptPrivacy"
                render={({ field: { onChange, value } }) => (
                  <Pressable
                    style={styles.checkRow}
                    onPress={() => onChange(value ? (undefined as unknown as true) : true)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!value }}
                    accessibilityLabel={strings.auth.acceptPrivacy}
                  >
                    <View style={[styles.checkbox, !!value && styles.checkboxChecked]}>
                      {!!value && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkLabel, !!errors.acceptPrivacy && styles.checkLabelError]}>
                      {strings.auth.acceptPrivacy}
                    </Text>
                  </Pressable>
                )}
              />
              {errors.acceptPrivacy && (
                <Text style={styles.fieldError}>{errors.acceptPrivacy.message}</Text>
              )}
            </View>

            {register.error && (
              <Text style={styles.apiError} accessibilityRole="alert">
                {register.error.message}
              </Text>
            )}

            <PawButton
              label={strings.auth.registerCta}
              onPress={handleSubmit(onSubmit)}
              loading={register.isPending}
              fullWidth
            />
          </View>

          {/* Footer nav */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{strings.auth.hasAccount} </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.footerLink}>{strings.auth.loginCta}</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.ink },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.xxl,
  },

  header: { gap: Spacing.sm },
  logo: {
    fontFamily: Fonts.serif,
    fontSize: FontSize.h1,
    color: Colors.cream,
    letterSpacing: -1,
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: FontSize.h2,
    color: Colors.cream,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.textFaint,
  },

  form: { gap: Spacing.lg },
  apiError: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.danger,
    textAlign: 'center',
  },

  checkboxGroup: { gap: Spacing.sm },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.warmLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  checkmark: {
    color: Colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  checkLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textLow,
    flex: 1,
  },
  checkLabelError: {
    color: Colors.danger,
  },
  fieldError: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.danger,
    marginLeft: 30,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.lg,
  },
  footerText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
  },
  footerLink: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.coral,
    fontWeight: '600',
  },
});
