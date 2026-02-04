import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import { Card, PrimaryButton } from './design-system';
import HomeIcon from './icons/HomeIcon';
import TasksIcon from './icons/TasksIcon';
import ProfileIcon from './icons/ProfileIcon';
import TargetIcon from './icons/TargetIcon';
import { orderService, Order } from '../services/order.service';
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
  colorWithOpacity,
} from '../design-system/tokens';

interface OrderReceivedScreenProps {
  onStartPicking?: (order?: Order) => void;
  onNavigate?: (screen: 'home' | 'tasks' | 'profile') => void;
}

export default function OrderReceivedScreen({
  onStartPicking,
  onNavigate,
}: OrderReceivedScreenProps) {
  const batteryLevel = useBatteryLevel();
  const { isAuthenticated, user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

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
        console.error('[OrderReceivedScreen] Error fetching profile:', error);
        setProfileData(null);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  // Fetch pending orders from assignorders collection
  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('[OrderReceivedScreen] Fetching pending assignorders...');
        const response = await orderService.getAssignOrdersByStatus('pending');
        console.log('[OrderReceivedScreen] Received orders:', response);
        console.log('[OrderReceivedScreen] Number of orders:', response?.length || 0);
        setPendingOrders(response || []);
      } catch (err: any) {
        console.error('[OrderReceivedScreen] Error fetching pending assignorders:', err);
        setError(err.message || 'Failed to load orders');
        setPendingOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingOrders();
  }, [isAuthenticated]);

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
        console.error('[OrderReceivedScreen] Error fetching today completed count:', error);
        setTodayCompletedCount(0);
      }
    };

    fetchTodayCompletedCount();

    // Refresh every 30 seconds
    const refreshInterval = setInterval(fetchTodayCompletedCount, 30000);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  // Format zone display (e.g., "A" -> "Zone A", "Zone B" -> "Zone B")
  const formatZone = (zone: string): string => {
    if (zone.startsWith('Zone ')) {
      return zone;
    }
    return `Zone ${zone}`;
  };

  const handleStartPickingPress = () => {
    if (selectedOrderId && onStartPicking) {
      // Find the selected order object
      const selectedOrder = pendingOrders.find(order => order.orderId === selectedOrderId);
      if (selectedOrder) {
        onStartPicking(selectedOrder);
      } else {
        onStartPicking();
      }
    }
  };

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

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* No Orders State */}
        {!isLoading && !error && pendingOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending orders available</Text>
          </View>
        )}

        {/* Order Cards */}
        {!isLoading && !error && pendingOrders.map((order) => (
          <TouchableOpacity
            key={order._id || order.orderId}
            style={[
              styles.orderCard,
              selectedOrderId === order.orderId && styles.orderCardSelected,
              pendingOrders.length > 1 && styles.orderCardWithMargin,
            ]}
            onPress={() => handleOrderSelect(order.orderId)}
            activeOpacity={0.7}
          >
            <View style={styles.orderHeader}>
              <TargetIcon
                width={17.5}
                height={17.5}
                color={
                  selectedOrderId === order.orderId ? colors.primary : colors.success
                }
              />
              <Text
                style={[
                  styles.orderTitle,
                  selectedOrderId === order.orderId && styles.orderTitleSelected,
                ]}
              >
                🎯 NEW ORDER: {order.orderId} ({order.itemCount} items)
              </Text>
            </View>
            <Text style={styles.orderDetail}>
              📦 {formatZone(order.zone)} start | Target: {order.targetTime || 0}s
            </Text>
            <Text style={styles.orderDetail}>👝 Scan bag to start</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Start Picking Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedOrderId && styles.startButtonDisabled,
          ]}
          onPress={handleStartPickingPress}
          activeOpacity={0.8}
          disabled={!selectedOrderId}
        >
          <Text
            style={[
              styles.startButtonText,
              !selectedOrderId && styles.startButtonTextDisabled,
            ]}
          >
            START PICKING →
          </Text>
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
  orderCardSelected: {
    backgroundColor: colorWithOpacity.primary(0.1),
    borderColor: colors.primary,
    borderBottomColor: colors.primary,
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
  orderTitleSelected: {
    color: colors.primary,
  },
  orderDetail: {
    ...typography.c2,
    color: colors.text.secondary,
  },
  orderCardWithMargin: {
    marginBottom: spacing.m, // 16px spacing between multiple cards
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'], // 32px
  },
  loadingText: {
    ...typography.b2,
    color: colors.text.secondary,
    marginTop: spacing.m, // 16px
  },
  errorContainer: {
    backgroundColor: colorWithOpacity.error(0.1),
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: radius.medium,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  errorText: {
    ...typography.b2,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.b2,
    color: colors.text.secondary,
    textAlign: 'center',
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
  startButtonDisabled: {
    backgroundColor: colors.grayMedium,
    ...shadows.card,
  },
  startButtonText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  startButtonTextDisabled: {
    color: colors.text.tertiary,
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

