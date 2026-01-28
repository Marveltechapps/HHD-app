import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import CheckIcon from './icons/CheckIcon';
import SignalIcon from './icons/SignalIcon';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';

interface OrderCompleteScreenProps {
  orderId?: string;
  rackLocation?: string;
  pickTime?: number;
  targetTime?: number;
  onReadyNext?: () => void;
}

export default function OrderCompleteScreen({
  orderId = 'ORD-45621',
  rackLocation = 'RACK-D1-SLOT3',
  pickTime = 52,
  targetTime = 55,
  onReadyNext,
}: OrderCompleteScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');
  const [liveCounter, setLiveCounter] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      setCurrentTime(`${displayHours}:${displayMinutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    // Live counter
    const liveInterval = setInterval(() => {
      setLiveCounter((prev) => (prev + 1) % 10);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, []);

  const savedTime = targetTime - pickTime;
  const beatTarget = pickTime < targetTime;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '6:42 PM'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Card */}
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>🎉 ORDER COMPLETE!</Text>
          <Text style={styles.successSubtitle}>
            📦 {rackLocation} BAG placed ✓
          </Text>
          
          {/* Time Info */}
          <View style={styles.timeInfoRow}>
            <View style={styles.timeInfoItem}>
              <CheckIcon width={14} height={14} color={colors.text.primary} />
              <Text style={styles.timeInfoText}>⏱️ {pickTime}s</Text>
            </View>
            <View style={styles.timeInfoItem}>
              <CheckIcon width={14} height={14} color={colors.success} />
              <Text style={styles.beatTargetText}>
                🎯 Beat target {targetTime}s!
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <CheckIcon width={56} height={56} color={colors.white} />
            </View>
          </View>

          {/* Waiting Text */}
          <Text style={styles.waitingText}>WAITING NEXT ORDER...</Text>

          {/* Live Status Badge */}
          <View style={styles.liveBadge}>
            <SignalIcon width={17.5} height={17.5} color={colors.primary} />
            <Text style={styles.liveText}>📡 LIVE - {liveCounter}s</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pickTime}s</Text>
              <Text style={styles.statLabel}>Pick Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueSaved]}>
                +{savedTime}s
              </Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.readyButton}
          onPress={onReadyNext}
          activeOpacity={0.8}
        >
          <CheckIcon width={14} height={14} color={colors.white} />
          <Text style={styles.readyButtonText}>🎯 READY NEXT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.s,
    paddingBottom: layout.buttonHeight + spacing.xl + spacing.m,
    paddingHorizontal: spacing.l,
  },
  successCard: {
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(72, 187, 120, 0.3)',
    padding: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.m + spacing.xs, // Extra padding for time info
    gap: spacing.xs + 2, // 7px
    marginBottom: spacing.m,
  },
  successTitle: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.success,
    fontSize: 32,
    lineHeight: 40,
  },
  successSubtitle: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xs, // 10.5px
    marginTop: spacing.xs,
  },
  timeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 3.5px
  },
  timeInfoText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  beatTargetText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.success,
    fontSize: 14,
    lineHeight: 21,
  },
  mainContent: {
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  successIconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  waitingText: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 7px
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(107, 70, 193, 0.3)',
    borderRadius: 33554400, // Full rounded
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m + spacing.xs, // ~16px
  },
  liveText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.primary,
    fontSize: 15.75,
    lineHeight: 24.5,
    fontFamily: 'Consolas',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    width: '100%',
    marginTop: spacing.m,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.large, // 20px
    padding: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.xs,
    gap: spacing.xs + 2, // 3.5px
    alignItems: 'center',
    ...shadows.card,
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 21,
    lineHeight: 28,
    textAlign: 'center',
  },
  statValueSaved: {
    color: colors.success,
  },
  statLabel: {
    ...typography.b2,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 12.25,
    lineHeight: 17.5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl + spacing.xs, // 23px
    paddingBottom: spacing.xl,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  readyButton: {
    backgroundColor: colors.success,
    borderRadius: radius.medium,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    ...shadows.large,
  },
  readyButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.white,
    fontSize: 14,
    lineHeight: 22.4,
  },
});

