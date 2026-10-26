import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, press } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import { Icon, type IconName } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { useUi } from '@/store/ui';
import { useAuth } from '@/store/auth';
import { getInitials } from '@/utils/initials';

type TopBarProps = {
  title: string;
  back?: boolean;
  icon?: IconName;
  right?: React.ReactNode;
  /** Profile avatar on root screens. */
  showAccount?: boolean;
};

function ProfileButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const staff = useAuth((s) => s.staff);
  const initials = getInitials(staff?.name ?? '', 'MS');

  return (
    <Pressable
      onPress={() => router.navigate('/profile')}
      accessibilityRole="button"
      accessibilityLabel={t('profile.title')}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: press.opacity }]}
    >
      <Avatar initials={initials} uri={staff?.avatar_url ?? undefined} size={28} />
    </Pressable>
  );
}

export function TopBar({ title, back = false, icon, right, showAccount = false }: TopBarProps) {
  const router = useRouter();
  const online = useUi((s) => s.online);
  const { t } = useTranslation();
  const fonts = useAppFonts();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        {back ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: press.opacity }]}
          >
            <Icon name="arrow-left" size={20} color={colors.ink700} />
          </Pressable>
        ) : icon ? (
          <View style={styles.iconWrap}>
            <Icon name={icon} size={20} color={colors.brand600} />
          </View>
        ) : (
          <View style={styles.mark}>
            <Icon name="tool" size={18} color={colors.white} />
          </View>
        )}
        <Text style={[styles.title, { fontFamily: fonts.display }]} numberOfLines={1}>
          {title}
        </Text>
        {!online ? (
          <View style={styles.offline}>
            <Text style={[styles.offlineText, { fontFamily: fonts.sansSemibold }]}>
              {t('common.offline')}
            </Text>
          </View>
        ) : null}
        {right}
        {showAccount ? <ProfileButton /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: 'rgba(255,255,255,0.92)' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 56,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink200,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.brand500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: colors.ink800,
    marginLeft: 6,
  },
  offline: {
    backgroundColor: colors.warningBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offlineText: {
    fontSize: 10,
    color: colors.warning,
    textTransform: 'uppercase',
  },
});
