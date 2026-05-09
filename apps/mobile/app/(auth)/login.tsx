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
import { Link, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts, FontSize, Spacing } from '@pawflo/theme';
import { LoginSchema } from '@pawflo/validation';
import type { LoginInput } from '@pawflo/validation';
import { PawButton } from '@/components/ui/PawButton';
import { PawInput } from '@/components/ui/PawInput';
import { useLogin } from '@/hooks/useAuth';
import { strings } from '@/i18n/strings.pl';

export default function LoginScreen() {
  const login = useLogin();
  const { registered } = useLocalSearchParams<{ registered?: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

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
            <Text style={styles.heading}>{strings.auth.loginTitle}</Text>
            <Text style={styles.subtitle}>{strings.auth.loginSubtitle}</Text>
          </View>

          {/* Registration success banner */}
          {registered === '1' && (
            <View style={styles.successBanner} accessibilityRole="alert">
              <Text style={styles.successText}>
                Konto utworzone! Sprawdź e-mail i kliknij link weryfikacyjny, aby się zalogować.
              </Text>
            </View>
          )}

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
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit((d) => login.mutate(d))}
                  error={errors.password?.message}
                />
              )}
            />

            {login.error && (
              <Text style={styles.apiError} accessibilityRole="alert">
                {login.error.message}
              </Text>
            )}

            <PawButton
              label={strings.auth.loginCta}
              onPress={handleSubmit((d) => login.mutate(d))}
              loading={login.isPending}
              fullWidth
            />
          </View>

          {/* Footer nav */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{strings.auth.noAccount} </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.footerLink}>{strings.auth.registerCta}</Text>
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

  successBanner: {
    backgroundColor: Colors.success + '22',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  successText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.success,
    textAlign: 'center',
  },

  form: { gap: Spacing.lg },
  apiError: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.danger,
    textAlign: 'center',
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
