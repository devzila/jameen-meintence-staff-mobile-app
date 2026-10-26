import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ListRow } from '@/components/ui/ListRow';
import { Icon, type IconName } from '@/components/Icon';
import { colors, press } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';

type NavRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: IconName;
  iconColor?: string;
  last?: boolean;
  danger?: boolean;
  selected?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  titleFont?: string;
  style?: StyleProp<ViewStyle>;
};

export function NavRow({
  title,
  subtitle,
  meta,
  icon,
  iconColor = colors.ink500,
  last,
  danger,
  selected,
  showChevron,
  onPress,
  accessibilityLabel,
  titleFont,
  style,
}: NavRowProps) {
  const fonts = useAppFonts();
  const chevron = showChevron ?? (Boolean(onPress) && !selected);
  const body = (
    <ListRow last={last} style={style}>
      {icon ? <Icon name={icon} size={17} color={danger ? colors.danger : iconColor} /> : null}
      <View style={styles.flex}>
        <Text
          style={[styles.title, { fontFamily: titleFont ?? fonts.sans }, danger && styles.danger]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sub, { fontFamily: fonts.sans }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {meta ? (
        <Text style={[styles.meta, { fontFamily: fonts.sans }]} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
      {selected ? <Icon name="check-circle" size={18} color={colors.brand600} /> : null}
      {chevron ? <Icon name="chevron-right" size={16} color={colors.ink400} /> : null}
    </ListRow>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => pressed && { opacity: press.opacity }}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, color: colors.ink800 },
  sub: { fontSize: 12, color: colors.ink500, marginTop: 2 },
  meta: { fontSize: 12, color: colors.ink400, maxWidth: 120 },
  danger: { color: colors.danger },
});
