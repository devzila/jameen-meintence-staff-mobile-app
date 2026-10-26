import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { BrandMark } from '@/components/BrandMark';
import { colors, press, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { isValidEmail } from '@/lib/email';
import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { SafeRedirect } from '@/components/SafeRedirect';
import { toUserMessage } from '@/utils/errors';

export default function LoginScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const slug = useOrg((s) => s.slug);
  const company = useOrg((s) => s.company);
  const clearCompany = useOrg((s) => s.clear);
  const savedEmail = useAuth((s) => s.email);
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState(savedEmail ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const emailValid = isValidEmail(email);
  const emailError =
    (attempted || email.trim().length > 0) && email.trim().length > 0 && !emailValid
      ? t('auth.emailInvalid')
      : undefined;
  const canSubmit = emailValid && password.length > 0 && !busy;
  const companyLabel = company?.name || slug || t('auth.yourCompany');

  if (!slug) return <SafeRedirect href="/company" />;

  async function onSubmit() {
    setAttempted(true);
    if (!emailValid || !slug) return;
    if (!password.length) return;
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password, slug);
      router.replace('/home');
    } catch (err) {
      setError(toUserMessage(err, t('auth.signInFailed')));
    } finally {
      setBusy(false);
    }
  }

  function onChangeCompany() {
    clearCompany();
    router.replace('/company');
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
          <Button
            label={busy ? t('auth.signingIn') : t('auth.signIn')}
            onPress={() => void onSubmit()}
            disabled={!canSubmit}
            loading={busy}
          />
        </>
      }
    >
      <View style={styles.hero}>
        {company?.logo_url ? (
          <Image source={{ uri: company.logo_url }} style={styles.logo} />
        ) : (
          <BrandMark size={64} />
        )}
        <Text style={[styles.title, { fontFamily: fonts.displayExtra }]}>
          {t('auth.welcomeBack')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fonts.sans }]}>
          {t('auth.signInSubtitle')}
        </Text>
        <View style={styles.slug}>
          <Text style={[styles.slugKicker, { fontFamily: fonts.sansSemibold }]}>
            {t('common.company')}
          </Text>
          <Text style={[styles.slugText, { fontFamily: fonts.sansSemibold }]}>{companyLabel}</Text>
          <Pressable
            onPress={onChangeCompany}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.changeHit, pressed && { opacity: press.opacity }]}
          >
            <Text style={[styles.change, { fontFamily: fonts.sansSemibold }]}>
              {t('auth.changeCompany')}
            </Text>
          </Pressable>
        </View>
      </View>

      <FormCard>
        <TextField
          label={t('common.email')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          blurOnSubmit={false}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          error={emailError}
        />
        <TextField
          label={t('common.password')}
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          secureToggle
          onSubmitEditing={() => {
            if (canSubmit) void onSubmit();
          }}
        />
        <Link href="/forgot-password" asChild>
          <Pressable accessibilityRole="link" style={styles.forgotHit}>
            <Text style={[styles.forgot, { fontFamily: fonts.sansSemibold }]}>
              {t('auth.forgot')}
            </Text>
          </Pressable>
        </Link>
      </FormCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 8 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: colors.brand50 },
  title: { fontSize: 26, color: colors.ink800 },
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
    letterSpacing: 0.6,
  },
  slugText: { fontSize: 15, color: colors.ink800, marginTop: 2 },
  changeHit: { minHeight: 44, justifyContent: 'center' },
  change: { fontSize: 12, color: colors.brand600 },
  forgotHit: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center' },
  forgot: {
    fontSize: 12,
    color: colors.brand600,
  },
  errorWrap: { marginBottom: 12 },
});
