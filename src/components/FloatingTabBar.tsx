import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { colors, radii, shadows } from '@/constants/theme';
import { useAppFonts } from '@/lib/fonts';
import type { IconName } from '@/components/Icon';

/** Height of the pill itself (icon + label). */
export const FLOATING_TAB_BAR_HEIGHT = 64;
const SIDE_INSET = 16;
const BOTTOM_GAP = 10;

export function floatingTabBarOverlay(safeBottom: number, edgesIncludeBottom: boolean) {
  const gap = FLOATING_TAB_BAR_HEIGHT + BOTTOM_GAP;
  return edgesIncludeBottom ? gap : gap + safeBottom;
}

export const STAFF_TABS: { name: string; titleKey: string; icon: IconName }[] = [
  { name: 'home', titleKey: 'tabs.home', icon: 'home' },
  { name: 'requests', titleKey: 'tabs.requests', icon: 'tool' },
  { name: 'profile', titleKey: 'tabs.profile', icon: 'user' },
];

export function useTabBarContentInset(edges: readonly string[] = ['top']) {
  const insets = useSafeAreaInsets();
  return floatingTabBarOverlay(insets.bottom, edges.includes('bottom'));
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const fonts = useAppFonts();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, BOTTOM_GAP) }]}
    >
      <View style={styles.pill} accessibilityRole="tablist">
        {state.routes.map((route) => {
          const focused = state.routes[state.index]?.key === route.key;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;
          const color = focused
            ? (options.tabBarActiveTintColor ?? colors.brand600)
            : (options.tabBarInactiveTintColor ?? colors.ink400);
          const icon = options.tabBarIcon?.({ focused, color: String(color), size: 22 });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>{icon}</View>
              <Text
                style={[
                  styles.label,
                  {
                    color: String(color),
                    fontFamily: focused ? fonts.sansSemibold : fonts.sansMedium,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SIDE_INSET,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: FLOATING_TAB_BAR_HEIGHT,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink100,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(11, 16, 32, 0.12)' } : shadows.e3),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.brand50,
  },
  label: {
    fontSize: 11,
  },
});
