/**
 * API Configuration
 * Base URL and API endpoints configuration
 * 
 * To override the API URL, set EXPO_PUBLIC_API_URL environment variable
 * Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
 */

// For React Native/Expo development, use your machine's IP address
// For Android emulator: use 10.0.2.2 instead of localhost
// For iOS simulator: use localhost
// For physical device: use your computer's IP address

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseURL = () => {
  // Priority 1: Environment variable (highest priority)
  // Set EXPO_PUBLIC_API_URL in .env file
  // Example: EXPO_PUBLIC_API_URL=http://192.168.1.49:5000/api
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    const url = process.env.EXPO_PUBLIC_API_URL;
    console.log('[API Config] ✅ Using environment variable (EXPO_PUBLIC_API_URL):', url);
    return url;
  }
  
  // Priority 2: app.json extra config (for physical devices)
  // Configured in app.json → expo.extra.apiUrl
  try {
    const apiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (apiUrl) {
      console.log('[API Config] ✅ Using app.json config (extra.apiUrl):', apiUrl);
      return apiUrl;
    }
  } catch (e) {
    console.warn('[API Config] Could not read Expo Constants:', e);
  }

  // Development
  if (__DEV__) {
    const platform = Platform.OS;
    
    console.log('[API Config] Platform detected:', platform);
    
    // Check for web platform first
    if (platform === 'web') {
      const url = 'http://localhost:5000/api';
      console.log('[API Config] Web platform - Using:', url);
      return url;
    }
    
    // Android emulator - use 10.0.2.2 to access host machine's localhost
    if (platform === 'android') {
      // Try to detect if running on physical device
      // For physical devices, we need the actual computer IP address
      // For emulator, 10.0.2.2 works
      
      // Check if we're in an emulator (Expo Go on physical device will have different behavior)
      // For now, try 10.0.2.2 first (emulator), but provide clear instructions for physical devices
      const url = 'http://10.0.2.2:5000/api';
      console.log('[API Config] Android platform detected');
      console.log('[API Config] Using emulator URL:', url);
      console.log('[API Config] ⚠️  If on PHYSICAL DEVICE, you need your computer IP (e.g., http://192.168.1.49:5000/api)');
      console.log('[API Config] Set EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api in .env or app.json');
      return url;
    }
    
    // iOS simulator - use localhost
    if (platform === 'ios') {
      const url = 'http://localhost:5000/api';
      console.log('[API Config] iOS platform - Using:', url);
      return url;
    }
    
    // Default fallback (shouldn't reach here, but just in case)
    const url = 'http://localhost:5000/api';
    console.log('[API Config] Unknown platform, defaulting to:', url);
    return url;
  }
  
  // Production - replace with your production backend URL
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    BY_STATUS: (status: string) => `/orders/status/${status}`,
    COMPLETED: '/orders/completed',
    ASSIGNORDERS_BY_STATUS: (status: string) => `/orders/assignorders/status/${status}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    UPDATE_ASSIGNORDER_STATUS: (id: string) => `/orders/assignorders/${id}/status`,
  },
  // Bags
  BAGS: {
    SCAN: '/bags/scan',
    BY_ID: (id: string) => `/bags/${id}`,
    UPDATE: (id: string) => `/bags/${id}`,
  },
  // Items
  ITEMS: {
    BY_ORDER: (orderId: string) => `/items/order/${orderId}`,
    SCAN: '/items/scan',
    NOT_FOUND: (id: string) => `/items/${id}/not-found`,
    UPDATE: (id: string) => `/items/${id}`,
  },
  // Racks
  RACKS: {
    SCAN: '/racks/scan',
    BY_CODE: (code: string) => `/racks/${code}`,
  },
  // Tasks
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
  },
  // Photos
  PHOTOS: {
    UPLOAD: '/photos',
    BY_ORDER_BAG: (orderId: string, bagId: string) => `/photos/order/${orderId}/bag/${bagId}`,
    VERIFY: (id: string) => `/photos/${id}/verify`,
  },
  // Users
  USERS: {
    PROFILE: '/users/profile',
  },
} as const;
