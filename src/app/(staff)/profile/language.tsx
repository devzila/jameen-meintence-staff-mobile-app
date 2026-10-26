import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { NavRow } from '@/components/ui/NavRow';
import { colors } from '@/constants/theme';
import { LOCALE_OPTIONS, useLocale, type AppLocale } from '@/store/locale';
import { fontsForLocale, useAppFonts } from '@/lib/fonts';

export default function LanguageScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  function pick(code: AppLocale) {
    if (code === locale) return;
    setLocale(code);
  }

  return (
    <View style={styles.root}>
      <TopBar title={t('profile.languageTitle')} back />
      <Screen edges={[]} padded>
        <Text style={[styles.hint, { fontFamily: fonts.sans }]}>{t('profile.languageHint')}</Text>
        <Card style={styles.card}>
          {LOCALE_OPTIONS.map((option, index) => (
            <NavRow
              key={option.code}
              title={option.nativeName}
              titleFont={fontsForLocale(option.code).sans}
              selected={option.code === locale}
              last={index === LOCALE_OPTIONS.length - 1}
              onPress={() => pick(option.code)}
              accessibilityLabel={option.nativeName}
            />
          ))}
        </Card>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  hint: { fontSize: 13, color: colors.ink500, marginBottom: 12 },
  card: { backgroundColor: colors.white, paddingVertical: 4 },
});
