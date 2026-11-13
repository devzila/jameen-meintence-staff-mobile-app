import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// Static web rendering has no window/localStorage. Never retain user state on the server.
function isServerRender() {
  return Platform.OS === 'web' && typeof window === 'undefined';
}

export const persistentStorage: StateStorage = {
  getItem: async (key) => (isServerRender() ? null : AsyncStorage.getItem(key)),
  setItem: async (key, value) => {
    if (!isServerRender()) await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (!isServerRender()) await AsyncStorage.removeItem(key);
  },
};
