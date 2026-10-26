import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'jameen.maintenance.accessToken';
const REFRESH_KEY = 'jameen.maintenance.refreshToken';
const PUSH_TOKEN_KEY = 'jameen.maintenance.pushToken';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}

export async function getPushToken(): Promise<string | null> {
  return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export async function savePushToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
