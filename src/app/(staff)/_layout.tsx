import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { pickNextRoute, useAuth } from '@/store/auth';
import { hydrateSessionProfile } from '@/features/authentication/session';
import {
  registerDevicePushSubscription,
  registerNotificationNavigation,
} from '@/services/notifications';
import { useStoresHydrated } from '@/store/hydration';
import { SafeRedirect } from '@/components/SafeRedirect';

const STAFF_STACK_OPTIONS = { headerShown: false } as const;

export default function StaffLayout() {
  const hydrated = useStoresHydrated();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const accessToken = useAuth((s) => s.accessToken);
  const refreshToken = useAuth((s) => s.refreshToken);
  const signedIn = isAuthenticated && Boolean(accessToken);

  useEffect(() => {
    if (!signedIn) {
      queryClient.clear();
      return;
    }
    void hydrateSessionProfile();
    void registerDevicePushSubscription().catch(() => {
      /* push is optional; a dropped connection must not redbox */
    });
    return registerNotificationNavigation();
  }, [signedIn, queryClient]);

  if (!hydrated) return null;
  if (!isAuthenticated || !accessToken || !refreshToken) {
    return <SafeRedirect href={pickNextRoute()} />;
  }

  return <Stack screenOptions={STAFF_STACK_OPTIONS} />;
}
