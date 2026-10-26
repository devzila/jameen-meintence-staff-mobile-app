import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/TopBar';
import { TextField } from '@/components/ui/TextField';
import { FormCard } from '@/components/ui/FormCard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { useAuth } from '@/store/auth';
import { changePassword } from '@/services/api/auth';
import { toUserMessage } from '@/utils/errors';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const clearSession = useAuth((s) => s.clearSession);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const match = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = password.length > 0 && newPassword.length >= 8 && match && !busy;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await changePassword({
        current_password: password,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      await clearSession();
      router.replace('/login');
    } catch (err) {
      setError(toUserMessage(err, t('profile.passwordFailed')));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <TopBar title={t('profile.changePassword')} back />
      <Screen
        edges={[]}
        padded
        footer={
          <Button
            label={busy ? t('profile.passwordUpdating') : t('profile.passwordUpdate')}
            onPress={() => void onSubmit()}
            disabled={!canSubmit}
            loading={busy}
          />
        }
      >
        <Text style={[styles.lead, { fontFamily: fonts.sans }]}>{t('profile.passwordLead')}</Text>
        <FormCard>
          <TextField
            label={t('profile.currentPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            secureToggle
          />
          <TextField
            label={t('profile.newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            secureToggle
          />
          <TextField
            label={t('profile.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            secureToggle
          />
          {confirmPassword.length > 0 && !match ? (
            <Text style={[styles.error, { fontFamily: fonts.sans }]}>
              {t('profile.passwordMismatch')}
            </Text>
          ) : null}
          {error ? <Text style={[styles.error, { fontFamily: fonts.sans }]}>{error}</Text> : null}
        </FormCard>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  lead: { fontSize: 13, color: colors.ink500, marginVertical: 16 },
  error: { color: colors.danger, fontSize: 13 },
});
