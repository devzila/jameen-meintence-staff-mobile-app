import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '@/constants/theme';

export function FormCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
    marginBottom: 12,
  },
});
