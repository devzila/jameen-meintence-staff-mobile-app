import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';
import { Icon } from '@/components/Icon';
import { FloatingTabBar, STAFF_TABS } from '@/components/FloatingTabBar';
import { useLocale } from '@/store/locale';
import i18n from '@/i18n';

export default function TabsLayout() {
  useLocale((s) => s.locale);

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand600,
        tabBarInactiveTintColor: colors.ink400,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: colors.surfaceMuted },
      }}
    >
      {STAFF_TABS.map((tab) => {
        const title = i18n.t(tab.titleKey);
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title,
              tabBarAccessibilityLabel: title,
              tabBarIcon: ({ color }) => <Icon name={tab.icon} size={22} color={String(color)} />,
            }}
          />
        );
      })}
    </Tabs>
  );
}
