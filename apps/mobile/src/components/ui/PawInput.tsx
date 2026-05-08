import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@pawflo/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function PawInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError, style]}
        placeholderTextColor={Colors.textFaint}
        selectionColor={Colors.coral}
        {...props}
      />
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  label: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.textLow,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    height: 52,
    backgroundColor: Colors.inkSoft,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.warmLine,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.danger,
  },
});
