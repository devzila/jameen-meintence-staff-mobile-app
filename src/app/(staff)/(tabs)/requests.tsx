import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RequestCard } from '@/components/RequestCard';
import { useTabBarContentInset } from '@/components/FloatingTabBar';
import { colors, spacing } from '@/constants/theme';
import { STATUS_FILTERS, type StatusFilter } from '@/lib/requestStatus';
import { useRequestList } from '@/features/requests/hooks';
import { toUserMessage } from '@/utils/errors';
import type { MaintenanceRequest } from '@/types/maintenance';

function isStatusFilter(value: unknown): value is StatusFilter {
  return typeof value === 'string' && (STATUS_FILTERS as string[]).includes(value);
}

export default function RequestsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ status?: string }>();
  const bottomInset = useTabBarContentInset([]);
  const filter: StatusFilter = isStatusFilter(params.status) ? params.status : 'open';
  const [refreshing, setRefreshing] = useState(false);
  const list = useRequestList(filter);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await list.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [list]);

  const openRequest = useCallback((request: MaintenanceRequest) => {
    router.push({ pathname: '/requests/[id]', params: { id: String(request.id) } });
  }, []);

  const loadMore = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  }, [list]);

  const rows = list.data ?? [];

  return (
    <View style={styles.root}>
      <TopBar title={t('requests.title')} icon="tool" showAccount />
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {STATUS_FILTERS.map((item) => (
            <FilterChip
              key={item}
              label={item === 'open' ? t('requests.filterOpen') : t(`requestStatus.${item}`)}
              selected={filter === item}
              onPress={() => router.setParams({ status: item })}
            />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RequestCard request={item} onPress={openRequest} />}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
        ItemSeparatorComponent={Separator}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.brand500}
          />
        }
        ListEmptyComponent={
          list.isLoading ? (
            <ActivityIndicator style={styles.loading} color={colors.brand500} />
          ) : list.error ? (
            <ErrorState
              message={toUserMessage(list.error, t('requests.loadFailed'))}
              onRetry={() => void list.refetch()}
            />
          ) : (
            <EmptyState icon="check-circle" message={t('requests.empty')} />
          )
        }
        ListFooterComponent={
          list.isFetchingNextPage ? (
            <ActivityIndicator style={styles.loading} color={colors.brand500} />
          ) : null
        }
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  chips: { gap: 8, paddingHorizontal: spacing.lg, paddingVertical: 12 },
  content: { paddingHorizontal: spacing.lg, flexGrow: 1 },
  separator: { height: 10 },
  loading: { marginVertical: 24 },
});
