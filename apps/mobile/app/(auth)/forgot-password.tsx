import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSize, Spacing } from '@pawflo/theme';
import { ForgotPasswordSchema } from '@pawflo/validation';
import type { ForgotPasswordInput } from '@pawflo/validation';
import { PawButton } from '@/components/ui/PawButton';
import { PawInput } from '@/components/ui/PawInput';
import { useForgotPassword } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgot = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (forgot.isSuccess) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.heading}>Sprawdź skrzynkę</Text>
          <Text style={styles.body}>
            Jeśli konto z tym adresem istnieje, wyślemy link do resetu hasła. Sprawdź też folder spam.
          </Text>
          <PawButton
            label="Wróć do logowania"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.heading}>Resetuj hasło</Text>
            <Text style={styles.body}>
              Podaj adres e-mail konta. Wyślemy link do ustawienia nowego hasła.
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <PawInput
                  label="Adres e-mail"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit((d) => forgot.mutate(d.email))}
                  error={errors.email?.message}
                />
              )}
            />

            {forgot.error && (
              <Text style={styles.apiError} accessibilityRole="alert">
                {forgot.error.message}
              </Text>
            )}

            <PawButton
              label="Wyślij link"
              onPress={handleSubmit((d) => forgot.mutate(d.email))}
              loading={forgot.isPending}
              fullWidth
            />

            <PawButton
              label="Wróć do logowania"
              onPress={() => router.back()}
              variant="ghost"
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.ink },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.xxl,
  },
  center: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  header: { gap: Spacing.sm },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: FontSize.h2,
    color: Colors.cream,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.textFaint,
    lineHeight: 22,
  },
  form: { gap: Spacing.lg },
  apiError: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.danger,
    textAlign: 'center',
  },
});
