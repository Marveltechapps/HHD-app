import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceIcon from './icons/DeviceIcon';
import {
  colors,
  typography,
  spacing,
  layout,
  radius,
  colorWithOpacity,
} from '../design-system/tokens';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface HeaderProps {
  deviceId?: string;
  batteryLevel?: number;
  showStepBadge?: boolean;
  stepText?: string;
  time?: string;
  showTime?: boolean;
}

export default function Header({
  deviceId = 'HHD-0234',
  batteryLevel = 94,
  showStepBadge = false,
  stepText,
  time,
  showTime = false,
}: HeaderProps) {
  const isOnline = useNetworkStatus();

  return (
    <View style={styles.header}>
      <View style={styles.deviceInfo}>
        <DeviceIcon width={17.5} height={17.5} />
        <Text style={styles.deviceText}>
          {deviceId} 🔋{batteryLevel}%
        </Text>
      </View>
      <View style={styles.rightSection}>
        {showTime && time && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        )}
        {showStepBadge && stepText && (
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{stepText}</Text>
          </View>
        )}
        <View
          style={[
            styles.onlineStatus,
            isOnline ? styles.onlineStatusActive : styles.onlineStatusInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isOnline ? styles.statusDotActive : styles.statusDotInactive,
            ]}
          />
          <Text
            style={[
              styles.onlineText,
              isOnline ? styles.onlineTextActive : styles.onlineTextInactive,
            ]}
          >
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l, // 20px (closest to 21px from design)
    paddingTop: spacing.xl, // 24px
    paddingBottom: 0,
    height: layout.statusBarHeight, // 64px
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    width: '100%',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s, // 8px (closest to 7px)
    flexShrink: 1,
    minWidth: 0, // Allow shrinking if needed
    height: 25.5,
  },
  deviceText: {
    ...typography.b1,
    color: colors.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 12px gap between elements
    flexShrink: 0,
  },
  timeContainer: {
    height: 25.5, // Match deviceText height for alignment
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeText: {
    ...typography.b1,
    color: colors.text.primary,
  },
  stepBadge: {
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderRadius: radius.large, // 24px (pill shape)
    paddingHorizontal: spacing.sm, // 12px (closest to 14px)
    paddingTop: spacing.sm, // 12px
    paddingBottom: 0,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    ...typography.c2,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: colors.success,
    textTransform: 'uppercase',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s, // 8px (closest to 7px)
    paddingHorizontal: spacing.sm, // 12px (closest to 14px)
    paddingVertical: 0,
    height: 36.39,
    borderRadius: radius.large, // 24px (pill shape)
  },
  onlineStatusActive: {
    backgroundColor: colorWithOpacity.success(0.1),
  },
  onlineStatusInactive: {
    backgroundColor: colorWithOpacity.error(0.1),
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    opacity: 0.597,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotInactive: {
    backgroundColor: colors.error,
  },
  onlineText: {
    ...typography.c1,
  },
  onlineTextActive: {
    color: colors.success,
  },
  onlineTextInactive: {
    color: colors.error,
  },
});

