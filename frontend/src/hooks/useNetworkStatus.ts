import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

/**
 * Custom hook to monitor network connectivity status
 * @returns The current network status (true if online, false if offline)
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let subscription: Network.NetworkStateSubscription | null = null;

    // Get initial network state
    const getInitialNetworkState = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        // Consider online only if connected AND internet is reachable
        // If isInternetReachable is null/undefined, fall back to isConnected
        const online = networkState.isConnected && 
          (networkState.isInternetReachable ?? networkState.isConnected);
        setIsOnline(online);
      } catch (error) {
        console.warn('Failed to get network state:', error);
        // Default to online if we can't determine (optimistic)
        setIsOnline(true);
      }
    };

    // Subscribe to network state changes
    const subscribeToNetworkChanges = async () => {
      try {
        subscription = Network.addNetworkStateListener(({ isConnected, isInternetReachable }) => {
          // Consider online only if connected AND internet is reachable
          // If isInternetReachable is null/undefined, fall back to isConnected
          const online = isConnected && (isInternetReachable ?? isConnected);
          setIsOnline(online);
        });
      } catch (error) {
        console.warn('Failed to subscribe to network state changes:', error);
      }
    };

    getInitialNetworkState();
    subscribeToNetworkChanges();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return isOnline;
}
