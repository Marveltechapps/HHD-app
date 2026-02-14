import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Header from './Header';
import { Card } from './design-system';
import HomeIcon from './icons/HomeIcon';
import TasksIcon from './icons/TasksIcon';
import ProfileIcon from './icons/ProfileIcon';
import SignalIcon from './icons/SignalIcon';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import { statisticsService } from '../services/statistics.service';
import { useAuth } from '../contexts/AuthContext';
import { authService, UserProfileResponse } from '../services/auth.service';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';

interface HomeScreenProps {
  onNavigate?: (screen: 'home' | 'tasks' | 'profile') => void;
  onOrderReceived?: () => void;
}

export default function HomeScreen({ onNavigate, onOrderReceived }: HomeScreenProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const batteryLevel = useBatteryLevel();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Auto-navigate to order received screen after 5 seconds
    const timer = setTimeout(() => {
      if (onOrderReceived) {
        onOrderReceived();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onOrderReceived]);

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

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) {
        setProfileData(null);
        return;
      }

      try {
        const profile = await authService.getProfile();
        setProfileData(profile);
      } catch (error) {
        console.error('[HomeScreen] Error fetching profile:', error);
        setProfileData(null);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  // Fetch today's completed orders count
  useEffect(() => {
    const fetchTodayCompletedCount = async () => {
      if (!isAuthenticated) {
        setTodayCompletedCount(0);
        return;
      }

      try {
        const count = await statisticsService.getTodayCompletedOrdersCount();
        setTodayCompletedCount(count);
      } catch (error) {
        console.error('[HomeScreen] Error fetching today completed count:', error);
        setTodayCompletedCount(0);
      }
    };

    fetchTodayCompletedCount();

    // Refresh every 30 seconds
    const refreshInterval = setInterval(fetchTodayCompletedCount, 30000);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Get display name from profile data or user context
  const displayName = profileData?.name || user?.name || 'User';

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
            <Text style={styles.userName}>👤 {displayName}</Text>
            <Text style={styles.targetText}>🎯 Target: 50 orders</Text>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>📊 TODAY: {todayCompletedCount} complete</Text>
            <Text style={styles.statSeparator}>|</Text>
            <Text style={styles.statText}>100%</Text>
            <Text style={styles.statSeparator}>|</Text>
            <Text style={styles.statText}>42s avg</Text>
          </View>
        </Card>

        {/* Waiting Message */}
        <View style={styles.waitingSection}>
          <Text style={styles.waitingText}>WAITING FOR ORDER...</Text>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusSection}>
          <SignalIcon width={21} height={21} color={colors.success} />
          <Text style={styles.statusText}>📡 LIVE - Auto assigned</Text>
        </View>
      </ScrollView>

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
    paddingBottom: layout.bottomNavHeight + spacing.m, // 80px + 16px
    paddingHorizontal: spacing.l, // 20px
  },
  dashboardCard: {
    marginBottom: spacing['2xl'], // 32px
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
  waitingSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing['3xl'], // 40px (closest to positioning from design)
    marginBottom: spacing['2xl'], // 32px (closest to 28px gap)
    opacity: 0.5,
  },
  waitingText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 57.6, // 1.2em
    color: colors.text.primary,
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s, // 8px (closest to 7px)
    width: '100%',
  },
  statusText: {
    ...typography.b1,
    color: colors.success,
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

