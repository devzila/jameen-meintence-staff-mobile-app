import '@/i18n';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/theme';

/** Hold the JS splash long enough to read the title and tagline. */
export const SPLASH_HOLD_MS = 2400;

/** JS splash so Expo Go (QR) can show our logo instead of Expo Go’s own screen. */
export function AppSplash() {
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <Image
        source={require('../../assets/images/logo-mark.png')}
        style={styles.mark}
        resizeMode="contain"
        accessibilityLabel="Jameen"
      />
      <View style={styles.copy}>
        <Text style={styles.title}>{t('splash.title')}</Text>
        <Text style={styles.subtitle}>{t('splash.subtitle')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  mark: {
    width: 112,
    height: 112,
    borderRadius: 28,
  },
  copy: {
    marginTop: 20,
    alignItems: 'center',
    maxWidth: 320,
    gap: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink900,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.ink800,
    textAlign: 'center',
  },
});
