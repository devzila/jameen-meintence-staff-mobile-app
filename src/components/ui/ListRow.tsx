import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

export function ListRow({
  children,
  last,
  style,
}: {
  children: React.ReactNode;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.row, !last && styles.border, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingVertical: 12,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink200,
  },
});
