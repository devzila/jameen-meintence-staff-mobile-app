import { Platform } from 'react-native';
import { apiFetch } from '@/services/api/client';
import { deviceName, PORTAL } from '@/constants/config';

export async function ackNotification(id: number | string) {
  await apiFetch<void>(`/v1/${PORTAL}/notifications/${id}/ack`, { method: 'POST' });
}

export async function registerExpoPushSubscription(token: string) {
  return apiFetch<{ data: { id: number; endpoint: string } }>(
    `/v1/${PORTAL}/notifications/subscriptions`,
    {
      method: 'POST',
      body: {
        endpoint: token,
        p256dh_key: 'expo',
        auth_key: 'expo',
        device_label: `${deviceName}/${Platform.OS}`,
      },
    },
  );
}

export async function unregisterExpoPushSubscription(token: string) {
  await apiFetch<void>(`/v1/${PORTAL}/notifications/subscriptions`, {
    method: 'DELETE',
    query: { endpoint: token },
  });
}
