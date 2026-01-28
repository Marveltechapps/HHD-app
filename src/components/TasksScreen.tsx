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
import HomeIcon from './icons/HomeIcon';
import TasksIcon from './icons/TasksIcon';
import ProfileIcon from './icons/ProfileIcon';
import CheckIcon from './icons/CheckIcon';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';

interface TasksScreenProps {
  onNavigate?: (screen: 'home' | 'tasks' | 'profile') => void;
}

export default function TasksScreen({ onNavigate }: TasksScreenProps) {
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
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header deviceId="HHD-0234" batteryLevel={batteryLevel} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>MY TASKS</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {/* Orders Completed */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <CheckIcon width={35} height={35} color={colors.success} />
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Orders Completed</Text>
          </View>

          {/* Avg Pick Time */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <View style={styles.clockIcon}>
                <View style={styles.clockHand} />
              </View>
            </View>
            <Text style={styles.statValue}>2m 14s</Text>
            <Text style={styles.statLabel}>Avg Pick Time</Text>
          </View>
        </View>

        {/* Performance Section */}
        <View style={styles.performanceCard}>
          <View style={styles.sectionHeader}>
            <CheckIcon width={21} height={21} color={colors.success} />
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>

          <View style={styles.performanceContent}>
            {/* Accuracy */}
            <View style={styles.performanceItem}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Accuracy</Text>
                <Text style={styles.performanceValue}>98%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '98%' }]} />
              </View>
            </View>

            {/* SLA Compliance */}
            <View style={styles.performanceItem}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>SLA Compliance</Text>
                <Text style={styles.performanceValue}>100%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Today's Activity Section */}
        <View style={styles.activityCard}>
          <View style={styles.sectionHeader}>
            <TasksIcon width={21} height={21} color={colors.primary} />
            <Text style={styles.sectionTitle}>Today's Activity</Text>
          </View>

          <View style={styles.activityContent}>
            {/* Items Picked */}
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>Items Picked</Text>
              <Text style={styles.activityValue}>156</Text>
            </View>

            {/* Active Time */}
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>Active Time</Text>
              <Text style={styles.activityValue}>6h 23m</Text>
            </View>

            {/* Efficiency Rate */}
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>Efficiency Rate</Text>
              <Text style={[styles.activityValue, styles.efficiencyValue]}>
                97%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate?.('home')}
        >
          <HomeIcon width={24.5} height={24.5} color={colors.text.secondary} />
          <Text style={styles.navText}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => onNavigate?.('tasks')}
        >
          <TasksIcon width={24.5} height={24.5} color={colors.primary} />
          <Text style={styles.navTextActive}>TASKS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate?.('profile')}
        >
          <ProfileIcon
            width={24.5}
            height={24.5}
            color={colors.text.secondary}
          />
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
    paddingTop: spacing.s,
    paddingBottom: layout.bottomNavHeight + spacing.m,
    paddingHorizontal: spacing.l,
  },
  titleSection: {
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 32,
    lineHeight: 38.4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.l + spacing.xs, // 21px
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs, // 23px
    alignItems: 'center',
    gap: spacing.m,
    ...shadows.card,
  },
  statIconContainer: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2.92,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clockHand: {
    width: 2.92,
    height: 11.67,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 2.92,
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 24,
    lineHeight: 31.2,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.b2,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 12.25,
    lineHeight: 17.5,
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs, // 23px
    paddingBottom: spacing.xs,
    gap: spacing.m,
    marginBottom: spacing.l + spacing.xs, // 21px
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2, // 7px
  },
  sectionTitle: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 15.75,
    lineHeight: 24.5,
  },
  performanceContent: {
    gap: spacing.m,
  },
  performanceItem: {
    gap: spacing.xs + 2, // 7px
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    ...typography.b1,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  performanceValue: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.success,
    fontSize: 14,
    lineHeight: 21,
  },
  progressBar: {
    height: 10.5,
    backgroundColor: colors.grayLight,
    borderRadius: 33554400, // Full rounded
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    padding: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 33554400,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs, // 23px
    paddingBottom: spacing.xs,
    gap: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  activityContent: {
    gap: spacing.sm + spacing.xs, // 10.5px
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm + spacing.xs, // 10.5px
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityLabel: {
    ...typography.b1,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  activityValue: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  efficiencyValue: {
    color: colors.success,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.bottomNavHeight, // 88px
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
    gap: spacing.xs, // 3.5px
    paddingVertical: spacing.s,
    borderRadius: radius.large, // 20px
  },
  navButtonActive: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
  },
  navText: {
    ...typography.c2,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  navTextActive: {
    ...typography.c2,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: colors.primary,
    textTransform: 'uppercase',
  },
});

