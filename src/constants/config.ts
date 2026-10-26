import { Platform } from 'react-native';

export type AppEnv = 'development' | 'staging' | 'production';

const rawEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

export const appEnv: AppEnv =
  rawEnv === 'staging' || rawEnv === 'production' ? rawEnv : 'development';

export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export const appName = 'Jameen Maintenance';

export const deviceName =
  Platform.OS === 'ios' ? 'maintenance-staff-mobile-ios' : 'maintenance-staff-mobile-android';

export const PORTAL = 'maintenance_staff';

/** Matches the API's BaseCrud default page size. */
export const PAGE_SIZE = 10;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
