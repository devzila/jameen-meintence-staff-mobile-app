import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, press, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function FilterChip({ label, selected, onPress, style }: FilterChipProps) {
  const fonts = useAppFonts();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipActive,
        pressed && { opacity: press.opacity },
        style,
      ]}
    >
      <Text
        style={[styles.text, { fontFamily: fonts.sansMedium }, selected && styles.textActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.ink100,
    paddingHorizontal: 14,
  },
  chipActive: { backgroundColor: colors.brand500 },
  text: { fontSize: 13, color: colors.ink600 },
  textActive: { color: colors.white },
});
