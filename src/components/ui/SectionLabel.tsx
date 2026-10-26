import { StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';

export function SectionLabel({ children }: { children: string }) {
  const fonts = useAppFonts();
  return <Text style={[styles.label, { fontFamily: fonts.sansMedium }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    color: colors.ink500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 8,
  },
});
