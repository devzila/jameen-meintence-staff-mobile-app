import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const tones: Record<BadgeTone, { bg: string; text: string }> = {
  success: { bg: colors.successBg, text: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning },
  danger: { bg: colors.dangerBg, text: colors.danger },
  info: { bg: colors.infoBg, text: colors.info },
  neutral: { bg: colors.ink100, text: colors.ink500 },
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  const palette = tones[tone];
  const fonts = useAppFonts();
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text, fontFamily: fonts.sansSemibold }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
  },
});
