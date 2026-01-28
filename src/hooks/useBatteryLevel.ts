import { useState, useEffect } from 'react';
import * as Battery from 'expo-battery';

/**
 * Custom hook to get the actual battery level of the device
 * @returns The current battery level as a percentage (0-100)
 */
export function useBatteryLevel(): number {
  const [batteryLevel, setBatteryLevel] = useState<number>(100);

  useEffect(() => {
    let subscription: Battery.BatteryLevelEventSubscription | null = null;

    // Get initial battery level
    const getInitialBatteryLevel = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        if (level >= 0) {
          setBatteryLevel(Math.round(level * 100));
        }
      } catch (error) {
        console.warn('Failed to get battery level:', error);
      }
    };

    // Subscribe to battery level changes
    const subscribeToBatteryChanges = async () => {
      try {
        subscription = Battery.addBatteryLevelListener(({ batteryLevel: level }) => {
          if (level >= 0) {
            setBatteryLevel(Math.round(level * 100));
          }
        });
      } catch (error) {
        console.warn('Failed to subscribe to battery level changes:', error);
      }
    };

    getInitialBatteryLevel();
    subscribeToBatteryChanges();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return batteryLevel;
}
