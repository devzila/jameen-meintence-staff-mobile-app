import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { RequestCard } from '@/components/RequestCard';
import { Icon, type IconName } from '@/components/Icon';
import { colors, press, radii, shadows } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import type { StatusFilter } from '@/lib/requestStatus';
import { useHomeSummary, usePriorityRequests } from '@/features/requests/hooks';
import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { toUserMessage } from '@/utils/errors';
import type { MaintenanceRequest } from '@/types/maintenance';

type Tile = {
  key: string;
  label: string;
  value: number | undefined;
  icon: IconName;
  tint: string;
  bg: string;
  filter: StatusFilter;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const staff = useAuth((s) => s.staff);
  const company = useOrg((s) => s.company);
  const summary = useHomeSummary();
  const priority = usePriorityRequests();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([summary.refetch(), priority.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [summary, priority]);

  const openRequest = useCallback((request: MaintenanceRequest) => {
    router.push({ pathname: '/requests/[id]', params: { id: String(request.id) } });
  }, []);

  const firstName = staff?.name?.split(' ')[0];
  const tiles: Tile[] = [
    {
      key: 'todo',
      label: t('home.todo'),
      value: summary.counts.todo,
      icon: 'clipboard',
      tint: colors.brand600,
      bg: colors.brand50,
      filter: 'open',
    },
    {
      key: 'inProgress',
      label: t('home.inProgress'),
      value: summary.counts.inProgress,
      icon: 'tool',
      tint: colors.info,
      bg: colors.infoBg,
      filter: 'in_progress',
    },
    {
      key: 'onHold',
      label: t('home.onHold'),
      value: summary.counts.onHold,
      icon: 'pause',
      tint: colors.warning,
      bg: colors.warningBg,
      filter: 'on_hold',
    },
    {
      key: 'breached',
      label: t('home.slaBreached'),
      value: summary.counts.breached,
      icon: 'alert-triangle',
      tint: colors.danger,
      bg: colors.dangerBg,
      filter: 'open',
    },
  ];

  return (
    <View style={styles.root}>
      <TopBar title={company?.name || t('home.title')} showAccount />
      <Screen
        edges={[]}
        tabBarInset
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.brand500}
          />
        }
      >
        <View style={styles.greeting}>
          <Text style={[styles.hello, { fontFamily: fonts.displayExtra }]}>
            {firstName ? t('home.greetingName', { name: firstName }) : t('home.greeting')}
          </Text>
          <Text style={[styles.lead, { fontFamily: fonts.sans }]}>{t('home.lead')}</Text>
        </View>

        {summary.error ? (
          <ErrorState
            message={toUserMessage(summary.error, t('home.loadFailed'))}
            onRetry={() => void summary.refetch()}
          />
        ) : null}

        <View style={styles.grid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.key}
              accessibilityRole="button"
              accessibilityLabel={`${tile.label} ${tile.value ?? ''}`}
              onPress={() =>
                router.navigate({ pathname: '/requests', params: { status: tile.filter } })
              }
              style={({ pressed }) => [styles.tile, pressed && { opacity: press.opacity }]}
            >
              <View style={[styles.tileIcon, { backgroundColor: tile.bg }]}>
                <Icon name={tile.icon} size={18} color={tile.tint} />
              </View>
              <Text style={[styles.tileValue, { fontFamily: fonts.displayExtra }]}>
                {tile.value ?? (summary.isLoading ? '…' : '—')}
              </Text>
              <Text style={[styles.tileLabel, { fontFamily: fonts.sansMedium }]} numberOfLines={1}>
                {tile.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionLabel>{t('home.priority')}</SectionLabel>
        {priority.error ? (
          <ErrorState
            message={toUserMessage(priority.error, t('home.loadFailed'))}
            onRetry={() => void priority.refetch()}
          />
        ) : priority.data && priority.data.length > 0 ? (
          <View style={styles.list}>
            {priority.data.map((request) => (
              <RequestCard key={request.id} request={request} onPress={openRequest} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="check-circle"
            message={priority.isLoading ? t('common.loading') : t('home.noPriority')}
          />
        )}

        <Button
          label={t('home.viewAll')}
          variant="secondary"
          icon="tool"
          style={styles.viewAll}
          onPress={() => router.navigate({ pathname: '/requests', params: { status: 'open' } })}
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  greeting: { paddingTop: 16, paddingBottom: 12, gap: 4 },
  hello: { fontSize: 24, color: colors.ink800 },
  lead: { fontSize: 14, color: colors.ink500 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    gap: 6,
    ...shadows.e1,
  },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileValue: { fontSize: 26, color: colors.ink800 },
  tileLabel: { fontSize: 12, color: colors.ink500 },
  list: { gap: 10 },
  viewAll: { marginTop: 16 },
});
