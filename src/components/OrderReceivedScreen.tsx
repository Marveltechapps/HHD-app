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
import { Card, PrimaryButton } from './design-system';
import HomeIcon from './icons/HomeIcon';
import TasksIcon from './icons/TasksIcon';
import ProfileIcon from './icons/ProfileIcon';
import TargetIcon from './icons/TargetIcon';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface OrderReceivedScreenProps {
  onStartPicking?: () => void;
  onNavigate?: (screen: 'home' | 'tasks' | 'profile') => void;
}

export default function OrderReceivedScreen({
  onStartPicking,
  onNavigate,
}: OrderReceivedScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');

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
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Time */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '3:11 PM'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Card */}
        <Card style={styles.dashboardCard} padding="l" gap="sm">
          <View style={styles.dashboardHeader}>
            <Text style={styles.userName}>👤 Rahul Kumar</Text>
            <Text style={styles.targetText}>🎯 Target: 50 orders</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>📊 TODAY: 0 complete</Text>
            <Text style={styles.statSeparator}>|</Text>
            <Text style={styles.statText}>100%</Text>
            <Text style={styles.statSeparator}>|</Text>
            <Text style={styles.statText}>42s avg</Text>
          </View>
        </Card>

        {/* Order Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <TargetIcon width={17.5} height={17.5} color={colors.success} />
            <Text style={styles.orderTitle}>
              🎯 NEW ORDER: ORD-45621 (18 items)
            </Text>
          </View>
          <Text style={styles.orderDetail}>
            📦 Zone B start | Target: 55s
          </Text>
          <Text style={styles.orderDetail}>👝 Scan bag to start</Text>
        </View>
      </ScrollView>

      {/* Start Picking Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStartPicking}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>START PICKING →</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => onNavigate?.('home')}
        >
          <HomeIcon width={24.5} height={24.5} color={colors.primary} />
          <Text style={styles.navTextActive}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate?.('tasks')}
        >
          <TasksIcon width={24.5} height={24.5} color={colors.text.secondary} />
          <Text style={styles.navText}>TASKS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate?.('profile')}
        >
          <ProfileIcon width={24.5} height={24.5} color={colors.text.secondary} />
          <Text style={styles.navText}>PROFILE</Text>
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
    flexGrow: 1,
    paddingTop: spacing.m, // 16px
    paddingBottom: layout.bottomNavHeight + layout.buttonHeight + spacing.m, // 80px + 56px + 16px
    paddingHorizontal: spacing.l, // 20px
  },
  dashboardCard: {
    marginBottom: spacing.m, // 16px (closest to 14px gap)
    width: '100%',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm, // 12px
  },
  userName: {
    ...typography.b2,
    color: colors.text.primary,
  },
  targetText: {
    ...typography.b2,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 12px (closest to 14px)
  },
  statText: {
    ...typography.c2,
    color: colors.text.secondary,
  },
  statSeparator: {
    ...typography.c2,
    color: colors.text.secondary,
  },
  orderCard: {
    backgroundColor: colorWithOpacity.success(0.1),
    borderWidth: 2,
    borderColor: colorWithOpacity.success(0.3),
    borderBottomColor: colorWithOpacity.success(0.3),
    borderRadius: radius.medium, // 12px
    padding: spacing.m, // 16px (closest to 14px)
    paddingTop: spacing.m, // 16px (closest to 14px)
    paddingBottom: spacing.s, // 8px (closest to 2px)
    gap: spacing.xs, // 4px (closest to 3.5px)
    width: '100%',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s, // 8px (closest to 7px)
    marginBottom: spacing.xs, // 4px
  },
  orderTitle: {
    ...typography.b1,
    color: colors.success,
    flex: 1,
  },
  orderDetail: {
    ...typography.c2,
    color: colors.text.secondary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: layout.bottomNavHeight, // 80px above bottom nav
    left: 0,
    right: 0,
    paddingHorizontal: spacing.l, // 20px
    paddingBottom: spacing.m, // 16px
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.medium, // 14px from design
    height: layout.buttonHeight, // 56px
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 364,
    alignSelf: 'center',
    ...shadows.large,
  },
  startButtonText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.bottomNavHeight, // 80px
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs, // 4px (closest to 3.5px)
    paddingVertical: spacing.s, // 8px
    borderRadius: radius.large, // 20px
  },
  navButtonActive: {
    backgroundColor: colorWithOpacity.primary(0.1),
  },
  navText: {
    ...typography.c3,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  navTextActive: {
    ...typography.c3,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.primary,
    textTransform: 'uppercase',
  },
});

