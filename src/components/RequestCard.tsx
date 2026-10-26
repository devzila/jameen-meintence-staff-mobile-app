import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/Icon';
import { PriorityBadge, StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { colors, press, radii, shadows } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { isSlaBreached, locationLabel } from '@/lib/requestStatus';
import { formatAvailability, formatRelative } from '@/utils/format';
import type { MaintenanceRequest } from '@/types/maintenance';

type Props = {
  request: MaintenanceRequest;
  onPress: (request: MaintenanceRequest) => void;
};

function RequestCardBase({ request, onPress }: Props) {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const location = locationLabel(request);
  const availability = formatAvailability(request.available_date, request.available_time);
  const breached = isSlaBreached(request);

  return (
    <Pressable
      onPress={() => onPress(request)}
      accessibilityRole="button"
      accessibilityLabel={request.title}
      style={({ pressed }) => [styles.card, pressed && { opacity: press.opacity }]}
    >
      <View style={styles.head}>
        <Text style={[styles.number, { fontFamily: fonts.sansSemibold }]} numberOfLines={1}>
          {request.request_number ? `#${request.request_number}` : `#${request.id}`}
        </Text>
        <View style={styles.badges}>
          {breached ? <Badge tone="danger">{t('requests.slaBreached')}</Badge> : null}
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </View>
      </View>

      <Text style={[styles.title, { fontFamily: fonts.sansSemibold }]} numberOfLines={2}>
        {request.title}
      </Text>
      {request.description ? (
        <Text style={[styles.description, { fontFamily: fonts.sans }]} numberOfLines={2}>
          {request.description}
        </Text>
      ) : null}

      <View style={styles.meta}>
        {location ? (
          <View style={styles.metaRow}>
            <Icon name="map-pin" size={13} color={colors.ink400} />
            <Text style={[styles.metaText, { fontFamily: fonts.sans }]} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
        {availability ? (
          <View style={styles.metaRow}>
            <Icon name="calendar" size={13} color={colors.ink400} />
            <Text style={[styles.metaText, { fontFamily: fonts.sans }]} numberOfLines={1}>
              {availability}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.foot}>
        <Text style={[styles.footText, { fontFamily: fonts.sans }]} numberOfLines={1}>
          {request.category?.name ?? ''}
        </Text>
        <Text style={[styles.footText, { fontFamily: fonts.sans }]}>
          {formatRelative(request.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}

export const RequestCard = memo(RequestCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink200,
    ...shadows.e1,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  number: { fontSize: 12, color: colors.ink500, flexShrink: 1 },
  badges: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
  title: { fontSize: 16, color: colors.ink800 },
  description: { fontSize: 13, color: colors.ink500, lineHeight: 18 },
  meta: { gap: 4, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: colors.ink600, flex: 1 },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.ink100,
    gap: 8,
  },
  footText: { fontSize: 11, color: colors.ink400, flexShrink: 1 },
});
