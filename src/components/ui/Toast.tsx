import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';

export function Toast({
  message,
  open,
  onClose,
  tone = 'success',
}: {
  message: string;
  open: boolean;
  onClose: () => void;
  tone?: 'success' | 'danger' | 'info';
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [open, onClose]);

  const fonts = useAppFonts();
  if (!open) return null;

  const bg = tone === 'danger' ? colors.danger : tone === 'info' ? colors.info : colors.success;

  return (
    <View style={[styles.toast, { backgroundColor: bg }]} accessibilityRole="alert">
      <Text style={[styles.text, { fontFamily: fonts.sansMedium }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    ...shadows.e3,
  },
  text: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
});
