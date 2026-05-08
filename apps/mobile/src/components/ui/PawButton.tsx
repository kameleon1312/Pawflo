import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, FontSize, BorderRadius, Spacing } from '@pawflo/theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const HEIGHT: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
const FONT: Record<Size, number> = { sm: FontSize.caption, md: FontSize.cta, lg: FontSize.bodySm };
const PX: Record<Size, number> = { sm: Spacing.lg, md: Spacing.xl, lg: Spacing.xxl };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PawButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;
  const labelColor = variant === 'secondary' ? Colors.coralDeep : Colors.cream;

  const inner = loading ? (
    <ActivityIndicator color={labelColor} size="small" />
  ) : (
    <Text style={[styles.label, { fontSize: FONT[size], color: labelColor }]}>{label}</Text>
  );

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[animatedStyle, fullWidth && styles.fullWidth]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={isDisabled ? [Colors.coralSoft, Colors.coral] : [Colors.coral, Colors.coralDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            { height: HEIGHT[size], paddingHorizontal: PX[size] },
            isDisabled && styles.disabled,
          ]}
        >
          {inner}
        </LinearGradient>
      ) : (
        <Animated.View
          style={[
            styles.base,
            { height: HEIGHT[size], paddingHorizontal: PX[size] },
            variant === 'secondary' && styles.secondary,
            variant === 'ghost' && styles.ghost,
            isDisabled && styles.disabled,
          ]}
        >
          {inner}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: Colors.coral,
  },
  ghost: {
    // transparent by default
  },
  disabled: {
    opacity: 0.5,
  },
});
