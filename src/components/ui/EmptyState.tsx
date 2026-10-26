import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { Icon, type IconName } from '@/components/Icon';
import { Card } from '@/components/ui/Card';
import { useAppFonts } from '@/lib/fonts';

export function EmptyState({
  icon = 'clipboard',
  message,
  children,
}: {
  icon?: IconName;
  message: string;
  children?: React.ReactNode;
}) {
  const fonts = useAppFonts();
  return (
    <Card style={styles.card}>
      <View style={styles.icon}>
        <Icon name={icon} size={26} color={colors.brand600} />
      </View>
      <Text style={[styles.message, { fontFamily: fonts.sansMedium }]}>{message}</Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: colors.white,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.ink500,
    textAlign: 'center',
  },
});
