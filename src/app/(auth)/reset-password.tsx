import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { BrandMark } from '@/components/BrandMark';
import { colors, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { useOrg } from '@/store/org';
import { completePasswordReset } from '@/services/api/auth';
import { toUserMessage } from '@/utils/errors';
import { Icon } from '@/components/Icon';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const params = useLocalSearchParams<{ token?: string; 'company-slug'?: string }>();
  const resolveCompany = useOrg((s) => s.resolveCompany);
  const orgSlug = useOrg((s) => s.slug);
  const company = useOrg((s) => s.company);
  const token = typeof params.token === 'string' ? params.token.trim() : '';
  const querySlug = typeof params['company-slug'] === 'string' ? params['company-slug'].trim() : '';
  const companySlug = (querySlug || orgSlug || '').trim().toLowerCase();

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!querySlug || company?.slug === querySlug) return;
    void resolveCompany(querySlug).catch(() => {
      /* still allow reset with the query slug */
    });
  }, [querySlug, company?.slug, resolveCompany]);

  const passwordsMatch = password.length > 0 && password === confirmation;
  const canSubmit =
    Boolean(token) && Boolean(companySlug) && password.length >= 8 && passwordsMatch && !busy;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await completePasswordReset({
        token,
        password,
        passwordConfirmation: confirmation,
        companySlug,
      });
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 1600);
    } catch (err) {
      setError(toUserMessage(err, t('auth.updateFailed')));
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <Screen
        footer={
          <Button
            label={t('auth.requestNewLink')}
            onPress={() => router.replace('/forgot-password')}
          />
        }
      >
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { fontFamily: fonts.displayExtra }]}>
            {t('auth.chooseNewPassword')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fonts.sans }]}>
            {t('auth.resetIncomplete')}
          </Text>
        </View>
        <ErrorState message={t('auth.missingToken')} />
      </Screen>
    );
  }

  if (!companySlug) {
    return (
      <Screen
        footer={
          <Button label={t('auth.selectCompany')} onPress={() => router.replace('/company')} />
        }
      >
        <View style={styles.hero}>
          <BrandMark size={64} />
          <Text style={[styles.title, { fontFamily: fonts.displayExtra }]}>
            {t('auth.chooseNewPassword')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fonts.sans }]}>
            {t('auth.companyRequired')}
          </Text>
        </View>
        <View style={styles.warn}>
          <Text style={[styles.warnText, { fontFamily: fonts.sans }]}>
            {t('auth.companyUnknown')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          {error ? (
            <View style={styles.errorWrap}>
              <ErrorState message={error} />
            </View>
          ) : null}
          {!success ? (
            <Button
              label={busy ? t('auth.updating') : t('auth.updatePassword')}
              onPress={() => void onSubmit()}
              disabled={!canSubmit}
              loading={busy}
            />
          ) : (
            <Button label={t('auth.goToSignIn')} onPress={() => router.replace('/login')} />
          )}
        </>
      }
    >
      <Pressable onPress={() => router.replace('/login')} style={styles.back}>
        <Icon name="arrow-left" size={16} color={colors.brand600} />
        <Text style={[styles.backText, { fontFamily: fonts.sansSemibold }]}>
          {t('auth.backToSignIn')}
        </Text>
      </Pressable>
      <View style={styles.hero}>
        <BrandMark size={64} />
        <Text style={[styles.title, { fontFamily: fonts.displayExtra }]}>
          {t('auth.chooseNewPassword')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fonts.sans }]}>{t('auth.resetSubtitle')}</Text>
        <View style={styles.slug}>
          <Text style={[styles.slugKicker, { fontFamily: fonts.sansSemibold }]}>
            {t('common.company')}
          </Text>
          <Text style={[styles.slugText, { fontFamily: fonts.sansSemibold }]}>
            {company?.name || companySlug}
          </Text>
        </View>
      </View>
      {success ? (
        <View style={styles.notice}>
          <Text style={[styles.noticeText, { fontFamily: fonts.sans }]}>
            {t('auth.passwordUpdated')}
          </Text>
        </View>
      ) : (
        <FormCard>
          <TextField
            label={t('auth.newPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            secureToggle
            autoComplete="password-new"
            placeholder={t('auth.passwordPlaceholder')}
          />
          <TextField
            label={t('auth.confirmPassword')}
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            secureToggle
            autoComplete="password-new"
            placeholder={t('auth.repeatPassword')}
          />
          {confirmation.length > 0 && !passwordsMatch ? (
            <Text style={[styles.error, { fontFamily: fonts.sans }]}>
              {t('auth.passwordsMismatch')}
            </Text>
          ) : null}
        </FormCard>
      )}
      <Text style={[styles.hint, { fontFamily: fonts.sans }]}>{t('auth.linkExpires')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingTop: 8 },
  backText: { fontSize: 14, color: colors.brand600 },
  hero: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  title: { fontSize: 26, color: colors.ink800, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.ink500, textAlign: 'center' },
  slug: {
    marginTop: 8,
    width: '100%',
    backgroundColor: colors.ink100,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  slugKicker: {
    fontSize: 11,
    color: colors.ink400,
    textTransform: 'uppercase',
  },
  slugText: { fontSize: 15, color: colors.ink800, marginTop: 2 },
  notice: {
    backgroundColor: colors.successBg,
    borderRadius: radii.md,
    padding: 16,
  },
  noticeText: { fontSize: 14, color: colors.success },
  warn: {
    backgroundColor: colors.warningBg,
    borderRadius: radii.md,
    padding: 16,
  },
  warnText: { fontSize: 14, color: colors.warning },
  error: { color: colors.danger, fontSize: 13 },
  errorWrap: { marginBottom: 12 },
  hint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 11,
    color: colors.ink400,
  },
});
