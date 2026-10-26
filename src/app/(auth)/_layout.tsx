import { Stack } from 'expo-router';
import { useAuth } from '@/store/auth';
import { useStoresHydrated } from '@/store/hydration';
import { SafeRedirect } from '@/components/SafeRedirect';

const AUTH_STACK_OPTIONS = { headerShown: false } as const;

export default function AuthLayout() {
  const hydrated = useStoresHydrated();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const accessToken = useAuth((s) => s.accessToken);
  const refreshToken = useAuth((s) => s.refreshToken);

  if (!hydrated) return null;
  if (isAuthenticated && accessToken && refreshToken) {
    return <SafeRedirect href="/home" />;
  }

  return <Stack screenOptions={AUTH_STACK_OPTIONS} />;
}
