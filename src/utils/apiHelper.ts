/**
 * API Helper Utilities
 * Helper functions for API connectivity and debugging
 */

import { API_BASE_URL } from '../config/api';
import { Platform } from 'react-native';

/**
 * Check if backend server is reachable
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // Remove /api from base URL to get server root
    const baseUrl = API_BASE_URL.replace('/api', '');
    const healthUrl = `${baseUrl}/health`;
    
    console.log('[API Helper] Checking backend health at:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[API Helper] Backend is healthy:', data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[API Helper] Backend health check failed:', error);
    return false;
  }
};

/**
 * Get current API base URL (for debugging)
 */
export const getCurrentAPIUrl = (): string => {
  return API_BASE_URL;
};

/**
 * Get platform-specific connection info
 */
export const getConnectionInfo = () => {
  const platform = Platform.OS;
  const baseUrl = API_BASE_URL;
  
  return {
    platform,
    baseUrl,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web',
    instructions: platform === 'android' 
      ? 'For Android emulator, backend should be accessible at http://10.0.2.2:5000'
      : platform === 'ios'
      ? 'For iOS simulator, backend should be accessible at http://localhost:5000'
      : 'For web, backend should be accessible at http://localhost:5000',
  };
};
