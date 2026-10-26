import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/components/Icon';
import { colors, radii } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { formatDateTime, humanize } from '@/utils/format';
import type { ActivityItem } from '@/features/requests/activity';

const ICONS: Record<ActivityItem['kind'], IconName> = {
  comment: 'message',
  status: 'activity',
  note: 'lock',
  update: 'notebook',
};

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  const { t } = useTranslation();
  const fonts = useAppFonts();

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const author =
          item.author === 'you'
            ? t('activity.you')
            : item.authorName || t(`activity.author.${item.author}`);
        const body =
          item.kind === 'status' && item.toState
            ? t('activity.statusChanged', {
                status: t(`requestStatus.${item.toState}`, {
                  defaultValue: humanize(item.toState),
                }),
              })
            : item.body;
        const mine = item.author === 'you';
        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, item.kind === 'status' && styles.dotStatus]}>
                <Icon
                  name={ICONS[item.kind]}
                  size={12}
                  color={item.kind === 'status' ? colors.white : colors.brand600}
                />
              </View>
              {index < items.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.content}>
              <View style={styles.head}>
                <Text style={[styles.author, { fontFamily: fonts.sansSemibold }]} numberOfLines={1}>
                  {author}
                </Text>
                {item.internal ? (
                  <Text style={[styles.internal, { fontFamily: fonts.sansSemibold }]}>
                    {t('activity.internal')}
                  </Text>
                ) : null}
                <Text style={[styles.time, { fontFamily: fonts.sans }]}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
              {body ? (
                <View
                  style={[
                    item.kind === 'status' ? null : styles.bubble,
                    mine && item.kind !== 'status' && styles.bubbleMine,
                    item.internal && styles.bubbleInternal,
                  ]}
                >
                  <Text
                    style={[
                      item.kind === 'status' ? styles.statusText : styles.body,
                      { fontFamily: fonts.sans },
                    ]}
                  >
                    {body}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  row: { flexDirection: 'row', gap: 10 },
  rail: { alignItems: 'center', width: 24 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotStatus: { backgroundColor: colors.brand500 },
  line: { flex: 1, width: 2, backgroundColor: colors.ink100, marginVertical: 2 },
  content: { flex: 1, paddingBottom: 16, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 24 },
  author: { fontSize: 13, color: colors.ink800, flexShrink: 1 },
  internal: {
    fontSize: 10,
    color: colors.warning,
    backgroundColor: colors.warningBg,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  time: { fontSize: 11, color: colors.ink400, marginLeft: 'auto' },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink200,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: { backgroundColor: colors.brand50, borderColor: colors.brand100 },
  bubbleInternal: { backgroundColor: colors.warningBg, borderColor: colors.warningBg },
  body: { fontSize: 14, color: colors.ink800, lineHeight: 20 },
  statusText: { fontSize: 13, color: colors.ink500 },
});
