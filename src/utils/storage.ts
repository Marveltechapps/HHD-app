/**
 * Storage Utility
 * Provides cross-platform storage (AsyncStorage for native, localStorage for web)
 */

import { Platform } from 'react-native';

// For web, use localStorage; for native, use AsyncStorage
const isWeb = Platform.OS === 'web';

// Import AsyncStorage only for native platforms
let AsyncStorage: any = null;
if (!isWeb) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('AsyncStorage not available:', error);
  }
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
      }
    } else {
      if (!AsyncStorage) return null;
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('AsyncStorage getItem error:', error);
        return null;
      }
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage setItem error:', error);
      }
    } else {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('AsyncStorage setItem error:', error);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage removeItem error:', error);
      }
    } else {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('AsyncStorage removeItem error:', error);
      }
    }
  },
};
