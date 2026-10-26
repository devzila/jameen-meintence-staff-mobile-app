import { useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { useRevokeSession, useSessions } from '@/features/profile/hooks';
import { signOut } from '@/features/authentication/signOut';
import { toUserMessage } from '@/utils/errors';
import { formatRelative } from '@/utils/format';
import type { DeviceSession } from '@/types/api';

function deviceLabel(session: DeviceSession, fallback: string) {
  const raw = session.device_name?.trim();
  if (!raw) return fallback;
  return (
    raw
      .replace(/^maintenance-staff-(mobile|pwa)-?/, '')
      .replace(/\/(ios|android)$/, '')
      .replace(/-/g, ' ')
      .trim() || raw
  );
}

export default function SessionsScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const queryClient = useQueryClient();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const [toast, setToast] = useState<string | null>(null);

  const rows = (sessions.data ?? []).filter((session) => session.active !== false);

  async function onRevoke(session: DeviceSession) {
    if (session.current) {
      await signOut(queryClient);
      return;
    }
    try {
      await revoke.mutateAsync(session.id);
      setToast(t('sessions.revoked'));
    } catch (err) {
      setToast(toUserMessage(err, t('sessions.revokeFailed')));
    }
  }

  return (
    <View style={styles.root}>
      <TopBar title={t('sessions.title')} back />
      <Screen
        edges={['bottom']}
        refreshControl={
          <RefreshControl
            refreshing={sessions.isRefetching}
            onRefresh={() => void sessions.refetch()}
            tintColor={colors.brand500}
          />
        }
      >
        <Text style={[styles.lead, { fontFamily: fonts.sans }]}>{t('sessions.lead')}</Text>
        {sessions.isLoading ? (
          <ActivityIndicator color={colors.brand500} style={styles.loading} />
        ) : sessions.error ? (
          <ErrorState
            message={toUserMessage(sessions.error, t('sessions.loadFailed'))}
            onRetry={() => void sessions.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState icon="smartphone" message={t('sessions.empty')} />
        ) : (
          <Card style={styles.card}>
            {rows.map((session, index) => (
              <ListRow key={session.id} last={index === rows.length - 1} style={styles.row}>
                <Icon name="smartphone" size={18} color={colors.ink500} />
                <View style={styles.flex}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.title, { fontFamily: fonts.sansSemibold }]}
                      numberOfLines={1}
                    >
                      {deviceLabel(session, t('sessions.unknownDevice'))}
                    </Text>
                    {session.current ? (
                      <Badge tone="success">{t('sessions.thisDevice')}</Badge>
                    ) : null}
                  </View>
                  <Text style={[styles.meta, { fontFamily: fonts.sans }]} numberOfLines={1}>
                    {[
                      session.last_used_at
                        ? t('sessions.lastActive', { time: formatRelative(session.last_used_at) })
                        : null,
                      session.ip_address,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Button
                  label={session.current ? t('profile.signOut') : t('sessions.revoke')}
                  variant="danger"
                  compact
                  loading={revoke.isPending && revoke.variables === session.id}
                  onPress={() => void onRevoke(session)}
                />
              </ListRow>
            ))}
          </Card>
        )}
      </Screen>
      <Toast open={Boolean(toast)} message={toast ?? ''} onClose={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  lead: { fontSize: 13, color: colors.ink500, marginVertical: 16 },
  loading: { marginVertical: 24 },
  card: { backgroundColor: colors.white, paddingVertical: 4 },
  row: { alignItems: 'center' },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, color: colors.ink800, flexShrink: 1, textTransform: 'capitalize' },
  meta: { fontSize: 12, color: colors.ink400 },
});
