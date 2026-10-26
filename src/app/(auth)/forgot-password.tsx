import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { BrandMark } from '@/components/BrandMark';
import { colors, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { isValidEmail } from '@/lib/email';
import { useOrg } from '@/store/org';
import { SafeRedirect } from '@/components/SafeRedirect';
import { requestPasswordReset } from '@/services/api/auth';
import { toUserMessage } from '@/utils/errors';
import { Icon } from '@/components/Icon';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const slug = useOrg((s) => s.slug);
  const company = useOrg((s) => s.company);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailValid = isValidEmail(email);
  const canSubmit = emailValid && !busy;
  const companyLabel = company?.name || slug || t('auth.yourCompanyLower');

  if (!slug) return <SafeRedirect href="/company" />;

  async function onSubmit() {
    if (!canSubmit || !slug) return;
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim().toLowerCase(), slug);
      setSent(true);
    } catch (err) {
      setError(toUserMessage(err, t('auth.couldNotSendReset')));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      keyboardShouldPersistTaps="handled"
      footer={
        <>
          {error ? (
            <View style={styles.errorWrap}>
              <ErrorState message={error} />
            </View>
          ) : null}
          {!sent ? (
            <Button
              label={busy ? t('auth.sending') : t('auth.sendResetLink')}
              onPress={() => void onSubmit()}
              disabled={!canSubmit}
              loading={busy}
            />
          ) : (
            <Button label={t('auth.backToSignIn')} onPress={() => router.replace('/login')} />
          )}
        </>
      }
    >
      <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
        <Icon name="arrow-left" size={16} color={colors.brand600} />
        <Text style={[styles.backText, { fontFamily: fonts.sansSemibold }]}>
          {t('auth.backToSignIn')}
        </Text>
      </Pressable>
      <View style={styles.hero}>
        <BrandMark size={64} />
        <Text style={[styles.title, { fontFamily: fonts.displayExtra }]}>
          {t('auth.resetPassword')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fonts.sans }]}>
          {sent ? t('auth.checkInbox') : t('auth.resetEmailFor', { company: companyLabel })}
        </Text>
      </View>
      {sent ? (
        <View style={styles.notice}>
          <Text style={[styles.noticeText, { fontFamily: fonts.sans }]}>
            {t('auth.resetSent', { email: email.trim().toLowerCase() })}
          </Text>
        </View>
      ) : (
        <FormCard>
          <TextField
            label={t('common.email')}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="done"
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            error={email.trim().length > 0 && !emailValid ? t('auth.emailInvalid') : undefined}
            onSubmitEditing={() => {
              if (canSubmit) void onSubmit();
            }}
          />
        </FormCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingTop: 8 },
  backText: { fontSize: 14, color: colors.brand600 },
  hero: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  title: { fontSize: 26, color: colors.ink800, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.ink500, textAlign: 'center' },
  notice: {
    backgroundColor: colors.successBg,
    borderRadius: radii.md,
    padding: 16,
  },
  noticeText: { fontSize: 14, color: colors.success },
  errorWrap: { marginBottom: 12 },
});
