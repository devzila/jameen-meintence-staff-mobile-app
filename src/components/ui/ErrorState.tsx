import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radii } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useAppFonts } from '@/lib/fonts';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  return (
    <View style={styles.box}>
      <Text style={[styles.message, { fontFamily: fonts.sans }]}>{message}</Text>
      {onRetry ? (
        <Button
          label={t('common.tryAgain')}
          variant="ghost"
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBg,
    padding: 16,
  },
  message: {
    fontSize: 14,
    color: colors.danger,
  },
  retry: {
    minHeight: 40,
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
});
