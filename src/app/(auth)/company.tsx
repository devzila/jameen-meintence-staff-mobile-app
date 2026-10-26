import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { BrandMark } from '@/components/BrandMark';
import { colors } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { toUserMessage } from '@/utils/errors';

export default function CompanyScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const existingSlug = useOrg((s) => s.slug) ?? '';
  const hasCompany = Boolean(existingSlug);
  const resolveCompany = useOrg((s) => s.resolveCompany);
  const clearSession = useAuth((s) => s.clearSession);
  const [value, setValue] = useState(existingSlug);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleaned = value.trim().toLowerCase();
  const canSubmit = cleaned.length > 0 && !busy;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await clearSession();
      await resolveCompany(cleaned);
      router.replace('/login');
    } catch (err) {
      setError(toUserMessage(err, t('auth.companyNotFound')));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      footer={
        <Button
          label={busy ? t('auth.checking') : t('auth.continue')}
          onPress={() => void onSubmit()}
          disabled={!canSubmit}
          loading={busy}
        />
      }
    >
      <View style={styles.hero}>
        <BrandMark size={64} />
        <Text style={[styles.title, { fontFamily: fonts.displayExtra }]}>
          {hasCompany ? t('auth.changeCompanyTitle') : t('auth.selectCompany')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fonts.sans }]}>
          {t('auth.companySubtitle')}
        </Text>
      </View>
      <FormCard>
        <TextField
          label={t('auth.companySlug')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          value={value}
          onChangeText={setValue}
          placeholder={t('auth.companySlugPlaceholder')}
          accessibilityLabel={t('auth.companySlug')}
        />
        <Text style={[styles.hint, { fontFamily: fonts.sans }]}>{t('auth.companyHint')}</Text>
      </FormCard>
      {error ? <ErrorState message={error} /> : null}
      {hasCompany ? (
        <Button
          label={t('auth.backToSignIn')}
          variant="ghost"
          onPress={() => router.replace('/login')}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: 32, gap: 8 },
  title: { fontSize: 26, color: colors.ink800, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.ink500, textAlign: 'center' },
  hint: { fontSize: 12, color: colors.ink400 },
});
