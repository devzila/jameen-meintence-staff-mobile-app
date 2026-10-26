import type { QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { unregisterDevicePushSubscription } from '@/services/notifications';
import { useAuth } from '@/store/auth';

function withTimeout(promise: Promise<unknown>, ms: number) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
}

export async function signOut(queryClient: QueryClient) {
  await withTimeout(unregisterDevicePushSubscription(), 3_000).catch(() => {});
  await useAuth.getState().logout();
  queryClient.clear();
  router.replace('/login');
}
