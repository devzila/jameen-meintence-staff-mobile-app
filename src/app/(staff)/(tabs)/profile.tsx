import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { NavRow } from '@/components/ui/NavRow';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/Icon';
import { colors } from '@/constants/theme';
import { appName } from '@/constants/config';
import { useAuth } from '@/store/auth';
import { useOrg } from '@/store/org';
import { localeNativeName, useLocale } from '@/store/locale';
import { useAppFonts } from '@/lib/fonts';
import { useProfile } from '@/features/profile/hooks';
import { signOut } from '@/features/authentication/signOut';
import { toUserMessage } from '@/utils/errors';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const fonts = useAppFonts();
  const queryClient = useQueryClient();
  const cachedStaff = useAuth((s) => s.staff);
  const company = useOrg((s) => s.company);
  const slug = useOrg((s) => s.slug);
  const locale = useLocale((s) => s.locale);
  const profile = useProfile();
  const [signingOut, setSigningOut] = useState(false);

  const staff = profile.data ?? cachedStaff;
  const name = staff?.name || t('profile.staffFallback');
  const properties = staff?.properties ?? [];

  async function onSignOut() {
    setSigningOut(true);
    try {
      await signOut(queryClient);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <View style={styles.root}>
      <TopBar title={t('profile.title')} icon="user" />
      <Screen
        edges={[]}
        tabBarInset
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefetching}
            onRefresh={() => void profile.refetch()}
            tintColor={colors.brand500}
          />
        }
      >
        <View style={styles.hero}>
          <Avatar name={name} uri={staff?.avatar_url} size={72} />
          <Text style={[styles.name, { fontFamily: fonts.sansSemibold }]}>{name}</Text>
          {staff?.email ? (
            <Text style={[styles.email, { fontFamily: fonts.sans }]}>{staff.email}</Text>
          ) : null}
          {staff?.active === false ? (
            <Badge tone="danger">{t('profile.inactive')}</Badge>
          ) : (
            <Badge tone="success">{t('profile.active')}</Badge>
          )}
        </View>

        {profile.error && !staff ? (
          <ErrorState
            message={toUserMessage(profile.error, t('profile.loadFailed'))}
            onRetry={() => void profile.refetch()}
          />
        ) : null}

        <Card style={styles.card}>
          <ListRow>
            <Icon name="building" size={16} color={colors.ink500} />
            <Text style={[styles.row, { fontFamily: fonts.sans }]}>
              {company?.name || slug || t('common.company')}
            </Text>
          </ListRow>
          <ListRow>
            <Icon name="mail" size={16} color={colors.ink500} />
            <Text style={[styles.row, { fontFamily: fonts.sans }]}>
              {staff?.email || t('common.dash')}
            </Text>
          </ListRow>
          <ListRow last>
            <Icon name="phone" size={16} color={colors.ink500} />
            <Text style={[styles.row, { fontFamily: fonts.sans }]}>
              {staff?.mobile_number || t('common.dash')}
            </Text>
          </ListRow>
        </Card>

        <SectionLabel>{t('profile.properties')}</SectionLabel>
        <Card style={styles.card}>
          {properties.length > 0 ? (
            properties.map((property, index) => (
              <ListRow key={property.id ?? index} last={index === properties.length - 1}>
                <Icon name="map-pin" size={16} color={colors.ink500} />
                <View style={styles.flex}>
                  <Text style={[styles.row, { fontFamily: fonts.sansMedium }]}>
                    {property.name || property.short_name}
                  </Text>
                  {property.address || property.city ? (
                    <Text style={[styles.sub, { fontFamily: fonts.sans }]} numberOfLines={1}>
                      {[property.address, property.city].filter(Boolean).join(', ')}
                    </Text>
                  ) : null}
                </View>
              </ListRow>
            ))
          ) : (
            <ListRow last>
              <Icon name="map-pin" size={16} color={colors.ink400} />
              <Text style={[styles.sub, styles.flex, { fontFamily: fonts.sans }]}>
                {t('profile.allProperties')}
              </Text>
            </ListRow>
          )}
        </Card>

        <SectionLabel>{t('profile.settingsSection')}</SectionLabel>
        <Card style={styles.card}>
          <NavRow
            icon="edit"
            title={t('profile.editProfile')}
            onPress={() => router.push('/profile/edit')}
          />
          <NavRow
            icon="languages"
            title={t('profile.language')}
            meta={localeNativeName(locale)}
            onPress={() => router.push('/profile/language')}
          />
          <NavRow
            icon="lock"
            title={t('profile.changePassword')}
            onPress={() => router.push('/profile/change-password')}
          />
          <NavRow
            icon="smartphone"
            title={t('profile.devices')}
            last
            onPress={() => router.push('/profile/sessions')}
          />
        </Card>

        <Button
          label={t('profile.signOut')}
          variant="danger"
          icon="log-out"
          loading={signingOut}
          style={styles.signOut}
          onPress={() => void onSignOut()}
        />
        <Text style={[styles.version, { fontFamily: fonts.sans }]}>
          {appName} · v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  hero: { alignItems: 'center', gap: 6, marginBottom: 16, paddingTop: 16 },
  name: { fontSize: 18, color: colors.ink800, marginTop: 4 },
  email: { fontSize: 13, color: colors.ink500 },
  card: { backgroundColor: colors.white, paddingVertical: 4, marginBottom: 8 },
  flex: { flex: 1 },
  row: { flex: 1, marginLeft: 4, fontSize: 15, color: colors.ink800 },
  sub: { fontSize: 12, color: colors.ink500, marginLeft: 4 },
  signOut: { marginTop: 16 },
  version: { textAlign: 'center', fontSize: 11, color: colors.ink400, marginTop: 12 },
});
