import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { appName } from '@/constants/config';
import { requestRouteFromNotification } from '@/lib/routes';
import {
  ackNotification,
  registerExpoPushSubscription,
  unregisterExpoPushSubscription,
} from '@/services/api/notifications';
import { getPushToken, savePushToken } from '@/services/secureStorage';

const notificationsUnavailableInExpoGo = Platform.OS === 'android' && isRunningInExpoGo();

type NotificationsModule = typeof import('expo-notifications');

function loadNotifications(): NotificationsModule | null {
  if (notificationsUnavailableInExpoGo) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

const Notifications = loadNotifications();

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

async function ensureAndroidChannel() {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: appName,
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function registerDevicePushSubscription(): Promise<string | null> {
  if (!Notifications) return null;
  await ensureAndroidChannel();
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  if (status !== 'granted') return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  if (!token?.data) return null;
  await savePushToken(token.data);
  try {
    await registerExpoPushSubscription(token.data);
  } catch {
    /* re-posted on the next app start */
  }
  return token.data;
}

/** Best effort: deactivate this device's subscription before the session is cleared. */
export async function unregisterDevicePushSubscription(): Promise<void> {
  const token = await getPushToken().catch(() => null);
  if (!token) return;
  try {
    await unregisterExpoPushSubscription(token);
  } catch {
    /* the API drops dead tokens on its own */
  }
  await savePushToken(null).catch(() => {});
}

function openFromNotificationData(data: Record<string, unknown> | undefined) {
  const notificationId = data?.notification_id ?? data?.id;
  if (typeof notificationId === 'number' || typeof notificationId === 'string') {
    void ackNotification(notificationId).catch(() => {});
  }
  const route = requestRouteFromNotification(data);
  router.push(route ?? '/requests');
}

export function registerNotificationNavigation() {
  if (!Notifications) return () => {};
  void Notifications.getLastNotificationResponseAsync?.()
    .then(async (response) => {
      if (!response) return;
      const data = response.notification.request.content.data as
        Record<string, unknown> | undefined;
      openFromNotificationData(data);
      await Notifications.clearLastNotificationResponseAsync?.();
    })
    .catch(() => {});
  const response = Notifications.addNotificationResponseReceivedListener((res) => {
    const data = res.notification.request.content.data as Record<string, unknown> | undefined;
    openFromNotificationData(data);
  });
  return () => {
    response.remove();
  };
}
