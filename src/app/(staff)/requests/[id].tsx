import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/TopBar';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { NavRow } from '@/components/ui/NavRow';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { Icon, type IconName } from '@/components/Icon';
import { PriorityBadge, StatusBadge } from '@/components/StatusBadge';
import { HoldReasonSheet } from '@/components/HoldReasonSheet';
import { ResolveSheet } from '@/components/ResolveSheet';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { colors, press, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { isSlaBreached, locationLabel, primaryAction, secondaryActions } from '@/lib/requestStatus';
import {
  useAddActivity,
  useRequestActivity,
  useRequestDetail,
  useRequestTransition,
} from '@/features/requests/hooks';
import { toUserMessage } from '@/utils/errors';
import { formatAvailability, formatDateTime } from '@/utils/format';
import type { HoldReason, MaintenanceRequest, RequestAction } from '@/types/maintenance';

const ACTION_ICONS: Record<RequestAction, IconName> = {
  acknowledge: 'check-circle',
  start: 'play',
  hold: 'pause',
  resume: 'play',
  resolve: 'check',
};

type ToastState = { message: string; tone: 'success' | 'danger' } | null;

function DetailRow({
  icon,
  label,
  value,
  last,
  tone,
}: {
  icon: IconName;
  label: string;
  value?: string | null;
  last?: boolean;
  tone?: string;
}) {
  const fonts = useAppFonts();
  if (!value) return null;
  return (
    <ListRow last={last}>
      <Icon name={icon} size={16} color={colors.ink400} />
      <Text style={[styles.rowLabel, { fontFamily: fonts.sans }]}>{label}</Text>
      <Text
        style={[styles.rowValue, { fontFamily: fonts.sansMedium }, tone ? { color: tone } : null]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </ListRow>
  );
}

function Attachment({ request }: { request: MaintenanceRequest }) {
  const { t } = useTranslation();
  const attachment = request.attachment;
  if (!attachment?.url) return null;
  const open = () => void Linking.openURL(attachment.url).catch(() => {});

  return (
    <>
      <SectionLabel>{t('requestDetail.attachment')}</SectionLabel>
      {attachment.kind === 'photo' ? (
        <Pressable
          onPress={open}
          accessibilityRole="imagebutton"
          accessibilityLabel={attachment.name ?? t('requestDetail.attachment')}
          style={({ pressed }) => pressed && { opacity: press.opacity }}
        >
          <Image
            source={{ uri: attachment.url }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
        </Pressable>
      ) : (
        <Card style={styles.card}>
          <NavRow
            icon="file"
            title={attachment.name || t('requestDetail.openAttachment')}
            subtitle={attachment.content_type ?? undefined}
            last
            onPress={open}
          />
        </Card>
      )}
    </>
  );
}

export default function RequestDetailScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const detail = useRequestDetail(id);
  const activity = useRequestActivity(id);
  const transition = useRequestTransition(id);
  const addActivity = useAddActivity(id);

  const [holdOpen, setHoldOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [internal, setInternal] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [refreshing, setRefreshing] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);

  const request = detail.data;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([detail.refetch(), activity.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [detail, activity]);

  async function run(
    action: RequestAction,
    extra?: { hold_reason?: HoldReason; actual_cost?: string },
  ) {
    setSheetError(null);
    try {
      await transition.mutateAsync({ action, params: extra });
      setHoldOpen(false);
      setResolveOpen(false);
      setToast({ message: t(`actions.done.${action}`), tone: 'success' });
    } catch (err) {
      const text = toUserMessage(err, t('actions.failed'));
      if (action === 'hold' || action === 'resolve') setSheetError(text);
      else setToast({ message: text, tone: 'danger' });
    }
  }

  function onAction(action: RequestAction) {
    if (action === 'hold') {
      setSheetError(null);
      setHoldOpen(true);
    } else if (action === 'resolve') {
      setSheetError(null);
      setResolveOpen(true);
    } else {
      void run(action);
    }
  }

  async function send() {
    const body = message.trim();
    if (!body) return;
    try {
      await addActivity.mutateAsync({ body, internal });
      setMessage('');
      setToast({
        message: internal ? t('activity.noteAdded') : t('activity.commentAdded'),
        tone: 'success',
      });
    } catch (err) {
      setToast({ message: toUserMessage(err, t('activity.sendFailed')), tone: 'danger' });
    }
  }

  const title = request?.request_number ? `#${request.request_number}` : t('requestDetail.title');

  if (!request) {
    return (
      <View style={styles.root}>
        <TopBar title={title} back />
        <Screen edges={['bottom']}>
          {detail.error ? (
            <View style={styles.pad}>
              <ErrorState
                message={toUserMessage(detail.error, t('requestDetail.loadFailed'))}
                onRetry={() => void detail.refetch()}
              />
            </View>
          ) : (
            <ActivityIndicator style={styles.loading} color={colors.brand500} />
          )}
        </Screen>
      </View>
    );
  }

  const primary = primaryAction(request.status);
  const secondary = secondaryActions(request.status);
  const breached = isSlaBreached(request);
  const busyAction = transition.isPending ? transition.variables?.action : undefined;

  const footer =
    primary || secondary.length > 0 ? (
      <View style={styles.actions}>
        {secondary.length > 0 ? (
          <View style={styles.secondaryRow}>
            {secondary.map((action) => (
              <Button
                key={action}
                label={t(`actions.${action}`)}
                icon={ACTION_ICONS[action]}
                variant="secondary"
                style={styles.secondaryBtn}
                loading={busyAction === action}
                disabled={transition.isPending}
                onPress={() => onAction(action)}
              />
            ))}
          </View>
        ) : null}
        {primary ? (
          <Button
            label={t(`actions.${primary}`)}
            icon={ACTION_ICONS[primary]}
            loading={busyAction === primary}
            disabled={transition.isPending}
            onPress={() => onAction(primary)}
          />
        ) : null}
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <TopBar title={title} back />
      <Screen
        edges={['bottom']}
        footer={footer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.brand500}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.badges}>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            {breached ? <Badge tone="danger">{t('requests.slaBreached')}</Badge> : null}
          </View>
          <Text style={[styles.title, { fontFamily: fonts.display }]}>{request.title}</Text>
          {request.description ? (
            <Text style={[styles.description, { fontFamily: fonts.sans }]}>
              {request.description}
            </Text>
          ) : null}
          {request.status === 'on_hold' && request.hold_reason ? (
            <View style={styles.holdBanner}>
              <Icon name="pause" size={14} color={colors.warning} />
              <Text style={[styles.holdText, { fontFamily: fonts.sansMedium }]}>
                {t(`holdReason.${request.hold_reason}`)}
              </Text>
            </View>
          ) : null}
        </View>

        <SectionLabel>{t('requestDetail.details')}</SectionLabel>
        <Card style={styles.card}>
          <DetailRow
            icon="map-pin"
            label={t('requestDetail.location')}
            value={
              request.is_common_area
                ? [t('requestDetail.commonArea'), locationLabel(request)]
                    .filter(Boolean)
                    .join(' · ')
                : locationLabel(request)
            }
          />
          <DetailRow
            icon="map-pin"
            label={t('requestDetail.locationNote')}
            value={request.location_note}
          />
          <DetailRow
            icon="clipboard"
            label={t('requestDetail.category')}
            value={request.category?.name}
          />
          <DetailRow
            icon="calendar"
            label={t('requestDetail.available')}
            value={formatAvailability(request.available_date, request.available_time)}
          />
          <DetailRow
            icon="user"
            label={t('requestDetail.raisedBy')}
            value={request.created_by?.name}
          />
          <DetailRow
            icon="clock"
            label={t('requestDetail.raisedAt')}
            value={formatDateTime(request.created_at)}
          />
          <DetailRow
            icon="clock"
            label={t('requestDetail.responseDue')}
            value={formatDateTime(request.sla_response_due_at)}
          />
          <DetailRow
            icon="alert-circle"
            label={t('requestDetail.resolutionDue')}
            value={formatDateTime(request.sla_resolution_due_at)}
            tone={breached ? colors.danger : undefined}
          />
          <DetailRow
            icon="check-circle"
            label={t('requestDetail.resolvedAt')}
            value={formatDateTime(request.resolved_at)}
          />
          <DetailRow
            icon="file"
            label={t('requestDetail.actualCost')}
            value={request.actual_cost != null ? String(request.actual_cost) : null}
            last
          />
        </Card>

        <Attachment request={request} />

        <SectionLabel>{t('activity.title')}</SectionLabel>
        <Card style={[styles.card, styles.composer]}>
          <TextField
            placeholder={
              internal ? t('activity.notePlaceholder') : t('activity.commentPlaceholder')
            }
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
          />
          <View style={styles.composerRow}>
            <View style={styles.internalRow}>
              <Switch
                value={internal}
                onValueChange={setInternal}
                trackColor={{ true: colors.brand500, false: colors.ink200 }}
                thumbColor={colors.white}
                accessibilityLabel={t('activity.internalToggle')}
              />
              <Text style={[styles.internalLabel, { fontFamily: fonts.sans }]}>
                {t('activity.internalToggle')}
              </Text>
            </View>
            <Button
              label={t('activity.send')}
              icon="send"
              compact
              style={styles.sendBtn}
              disabled={!message.trim()}
              loading={addActivity.isPending}
              onPress={() => void send()}
            />
          </View>
        </Card>

        {activity.error ? (
          <ErrorState
            message={toUserMessage(activity.error, t('activity.loadFailed'))}
            onRetry={() => void activity.refetch()}
          />
        ) : activity.isLoading ? (
          <ActivityIndicator style={styles.loading} color={colors.brand500} />
        ) : activity.items.length === 0 ? (
          <Text style={[styles.empty, { fontFamily: fonts.sans }]}>{t('activity.empty')}</Text>
        ) : (
          <View style={styles.timeline}>
            <ActivityTimeline items={activity.items} />
          </View>
        )}
      </Screen>

      <HoldReasonSheet
        open={holdOpen}
        busy={transition.isPending}
        error={sheetError}
        onCancel={() => setHoldOpen(false)}
        onConfirm={(reason) => void run('hold', { hold_reason: reason })}
      />
      <ResolveSheet
        open={resolveOpen}
        busy={transition.isPending}
        error={sheetError}
        onCancel={() => setResolveOpen(false)}
        onConfirm={(cost) => void run('resolve', { actual_cost: cost })}
      />
      <Toast
        open={Boolean(toast)}
        message={toast?.message ?? ''}
        tone={toast?.tone}
        onClose={closeToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { paddingTop: 16 },
  loading: { marginVertical: 32 },
  hero: { paddingTop: 16, paddingBottom: 8, gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 22, color: colors.ink800 },
  description: { fontSize: 15, color: colors.ink600, lineHeight: 22 },
  holdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningBg,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  holdText: { fontSize: 13, color: colors.warning },
  card: { backgroundColor: colors.white, paddingVertical: 4, marginBottom: 8 },
  rowLabel: { fontSize: 13, color: colors.ink500, minWidth: 96 },
  rowValue: { flex: 1, fontSize: 14, color: colors.ink800, textAlign: 'right' },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
    backgroundColor: colors.ink100,
    marginBottom: 8,
  },
  composer: { paddingVertical: 12, gap: 10 },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  internalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  internalLabel: { fontSize: 12, color: colors.ink500, flexShrink: 1 },
  sendBtn: { minHeight: 36, paddingHorizontal: 14 },
  timeline: { marginTop: 8 },
  empty: { fontSize: 13, color: colors.ink400, textAlign: 'center', marginVertical: 16 },
  actions: { gap: 8 },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1 },
});
