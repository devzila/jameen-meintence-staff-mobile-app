import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, shadows } from '@/constants/theme';
import { Icon, type IconName } from '@/components/Icon';
import { useAppFonts } from '@/lib/fonts';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  icon?: IconName;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.brand500, text: colors.white },
  secondary: { bg: colors.white, text: colors.ink800, border: colors.ink200 },
  danger: { bg: colors.white, text: colors.danger, border: colors.dangerBorder },
  ghost: { bg: 'transparent', text: colors.ink500 },
};

export function Button({
  label,
  variant = 'primary',
  loading,
  disabled,
  icon,
  compact,
  style,
  ...rest
}: ButtonProps) {
  const fonts = useAppFonts();
  const palette = variantStyles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.bg, borderColor: palette.border ?? 'transparent' },
        palette.border ? styles.bordered : null,
        variant === 'primary' ? shadows.e2 : null,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={compact ? 12 : 16} color={palette.text} /> : null}
          <Text
            style={[
              styles.label,
              compact && styles.compactLabel,
              { color: palette.text, fontFamily: fonts.sansSemibold },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  compact: {
    minHeight: 32,
    paddingHorizontal: 10,
  },
  bordered: {
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontSize: 15,
  },
  compactLabel: {
    fontSize: 11,
  },
  disabled: { opacity: 0.6 },
  pressed: { transform: [{ scale: 0.98 }] },
});
