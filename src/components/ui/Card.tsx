import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '@/constants/theme';

export function Card({
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
    backgroundColor: colors.ink100,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
