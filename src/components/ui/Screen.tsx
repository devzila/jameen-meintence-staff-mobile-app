import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { useTabBarContentInset } from '@/components/FloatingTabBar';

type ScreenProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  /** Leave room for the floating tab bar overlay. */
  tabBarInset?: boolean;
} & Pick<ScrollViewProps, 'refreshControl'>;

export function Screen({
  children,
  footer,
  scroll = true,
  padded = true,
  edges = ['top'],
  refreshControl,
  keyboardShouldPersistTaps = 'always',
  tabBarInset = false,
}: ScreenProps) {
  const overlay = useTabBarContentInset(edges);
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        padded && styles.padded,
        tabBarInset && { paddingBottom: 32 + overlay },
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      keyboardDismissMode="on-drag"
      nestedScrollEnabled
      removeClippedSubviews={false}
      automaticallyAdjustKeyboardInsets
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, tabBarInset && { paddingBottom: overlay }]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {footer ? <View style={[styles.footer, padded && styles.padded]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  flex: { flex: 1 },
  content: { paddingBottom: 32 },
  padded: { paddingHorizontal: spacing.lg },
  footer: {
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.ink200,
  },
});
