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
import BackIcon from './icons/BackIcon';
import BagIcon from './icons/BagIcon';
import CheckIcon from './icons/CheckIcon';
import FreshCategoryIcon from './icons/FreshCategoryIcon';
import SnacksCategoryIcon from './icons/SnacksCategoryIcon';
import GroceryCategoryIcon from './icons/GroceryCategoryIcon';
import CareCategoryIcon from './icons/CareCategoryIcon';
import OrderDetailsIcon from './icons/OrderDetailsIcon';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';

interface OrderOverviewScreenProps {
  orderId?: string;
  itemCount?: number;
  zone?: string;
  onBack?: () => void;
  onStartPicking?: () => void;
}

interface CategoryItem {
  name: string;
  count: number;
  color: string;
  backgroundColor: string;
  borderColor: string;
  icon?: React.ReactNode;
}

export default function OrderOverviewScreen({
  orderId = 'ORD-45621',
  itemCount = 18,
  zone = 'Zone B',
  onBack,
  onStartPicking,
}: OrderOverviewScreenProps) {
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

  // Calculate bag size based on item count
  const getBagSize = () => {
    if (itemCount <= 10) {
      return '15L';
    } else if (itemCount <= 20) {
      return '25L';
    } else if (itemCount <= 35) {
      return '35L';
    } else {
      return '50L';
    }
  };

  const bagSize = getBagSize();

  // Category icon component - using actual Figma icons
  const renderCategoryIcon = (color: string, type: string) => {
    const iconSize = 35; // Reduced icon size to match card
    switch (type) {
      case 'Fresh':
        return <FreshCategoryIcon width={iconSize} height={iconSize} color={color} />;
      case 'Snacks':
        return <SnacksCategoryIcon width={iconSize} height={iconSize} color={color} />;
      case 'Grocery':
        return <GroceryCategoryIcon width={iconSize} height={iconSize} color={color} />;
      case 'Care':
        return <CareCategoryIcon width={iconSize} height={iconSize} color={color} />;
      default:
        return null;
    }
  };

  // Category data
  const categories: CategoryItem[] = [
    {
      name: 'Fresh',
      count: 5,
      color: colors.category.fresh,
      backgroundColor: 'rgba(72, 187, 120, 0.1)',
      borderColor: 'rgba(72, 187, 120, 0.3)',
    },
    {
      name: 'Snacks',
      count: 4,
      color: colors.category.snacks,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    {
      name: 'Grocery',
      count: 6,
      color: colors.category.grocery,
      backgroundColor: 'rgba(107, 70, 193, 0.1)',
      borderColor: 'rgba(107, 70, 193, 0.3)',
    },
    {
      name: 'Care',
      count: 3,
      color: colors.category.care,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '5:03 PM'}
      />

      {/* Fixed Order Info Card */}
      <View style={styles.fixedOrderCard}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoHeader}>
            <TouchableOpacity
              style={styles.backButtonInCard}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <BackIcon width={24} height={24} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.orderInfoLeft}>
              <View style={styles.orderIdRow}>
                <Text style={styles.orderId}>{orderId}</Text>
                <Text style={styles.itemCount}>({itemCount} items)</Text>
              </View>
            </View>
            <Text style={styles.zoneText}>📦 {zone}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bag Scan Status Card */}
        <View style={styles.bagScanCard}>
          <View style={styles.bagScanContent}>
            <View style={styles.bagScanLeft}>
              <View style={styles.bagIconContainer}>
                <BagIcon width={21} height={21} color={colors.white} />
              </View>
              <View style={styles.bagScanText}>
                <Text style={styles.bagScanTitle}>📦 Scan Bag First</Text>
                <Text style={styles.bagScanSubtitle}>
                  Required: {bagSize} bag for {itemCount} items
                </Text>
              </View>
            </View>
            <CheckIcon width={21} height={21} color={colors.success} />
          </View>
        </View>

        {/* Progress Card - Hidden until requested */}
        {/* <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Progress: 0/{itemCount} items</Text>
            <Text style={styles.progressPercentage}>0%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '0%' }]} />
            </View>
          </View>
        </View> */}

        {/* Item Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Item Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <View
                key={index}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: category.backgroundColor,
                    borderColor: category.borderColor,
                  },
                ]}
              >
                <View style={styles.categoryIconContainer}>
                  {renderCategoryIcon(category.color, category.name)}
                </View>
                <Text style={[styles.categoryName, { color: category.color }]}>
                  {category.name}
                </Text>
                <Text style={[styles.categoryCount, { color: category.color }]}>
                  {category.count}
                </Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: category.color, opacity: 0.7 },
                  ]}
                >
                  items
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Details Section */}
        <View style={styles.orderDetailsCard}>
          <View style={styles.orderDetailsHeader}>
            <OrderDetailsIcon width={21} height={21} color={colors.primary} />
            <Text style={styles.orderDetailsTitle}>Order Details</Text>
          </View>
          <View style={styles.orderDetailsContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority:</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>HIGH</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Zone:</Text>
              <Text style={[styles.detailValue, { color: colors.success }]}>
                Sector 3 (1.2km)
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Target Time:</Text>
              <Text style={styles.detailValue}>55 seconds</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>#C-89234</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Start Picking Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={styles.startPickingButton}
          onPress={onStartPicking}
          activeOpacity={0.8}
        >
          <Text style={styles.startPickingButtonText}>START PICKING</Text>
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
  fixedOrderCard: {
    position: 'absolute',
    top: layout.statusBarHeight, // 64px - right below header
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 5,
    backgroundColor: colors.background,
  },
  orderInfoCard: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    padding: spacing.m, // 16px internal padding
    paddingHorizontal: spacing.l, // 20px
    paddingTop: spacing.m, // 16px
    paddingBottom: spacing.s, // 8px
  },
  orderInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s, // 8px gap between elements
  },
  backButtonInCard: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s, // 8px gap
  },
  orderInfoLeft: {
    flex: 1,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  orderId: {
    ...typography.b1,
    color: colors.primary,
  },
  itemCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  zoneText: {
    ...typography.b2,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: layout.statusBarHeight + spacing.l + spacing.m, // 64px header + 20px + 16px = 100px (rounded to 84px for design)
    paddingBottom: layout.buttonHeight + spacing.xl + spacing.l, // 52px button + 24px + 20px = 96px (rounded to 120px for safety)
    paddingHorizontal: spacing.l, // 20px
  },
  bagScanCard: {
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: radius.medium, // 14px
    padding: spacing.m, // 16px (closest to 19.5px)
    paddingTop: spacing.m + spacing.xs, // 20px (19.5px)
    paddingBottom: spacing.m, // 16px - match top padding for balance
    marginBottom: spacing.m, // 16px - proper spacing
  },
  bagScanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bagScanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 10.5px
    flex: 1,
  },
  bagIconContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: radius.large, // 20px
  },
  bagScanText: {
    flex: 1,
    gap: spacing.xs, // 4px
  },
  bagScanTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  bagScanSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  progressCard: {
    backgroundColor: colors.grayLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium, // 14px
    padding: spacing.m, // 16px
    paddingTop: spacing.m, // 16px
    paddingBottom: spacing.xs, // 4px (2px)
    marginBottom: spacing.xl, // 24px - proper spacing following design system
    gap: spacing.sm, // 10.5px
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  progressPercentage: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text.primary,
  },
  progressBarContainer: {
    alignSelf: 'stretch',
    paddingVertical: spacing.xs, // 4px (1px from design)
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 10.5, // 8.5px + 2px for visibility
    backgroundColor: colors.grayMedium,
    borderRadius: radius.large, // 24px (pill shape)
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.grayMedium,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: radius.large,
    minWidth: 0,
    width: '0%', // Will be updated based on progress
  },
  categoriesSection: {
    gap: spacing.m + spacing.xs, // 17.5px
    marginBottom: spacing.m, // 16px (reduced from 24px)
    paddingRight: 0, // Remove right padding to fill width
    width: '100%',
  },
  sectionTitle: {
    ...typography.headingSection,
    color: colors.text.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s, // 8px - reduced gap
    width: '100%',
  },
  categoryCard: {
    flex: 1,
    minWidth: '47%', // Minimum width for 2 columns
    maxWidth: '48%', // Maximum width to maintain 2 columns
    minHeight: 140, // Reduced height
    borderWidth: 2,
    borderRadius: radius.medium, // 14px
    padding: spacing.sm, // 12px - reduced padding
    justifyContent: 'flex-start',
  },
  categoryIconContainer: {
    width: 35, // Reduced icon container
    height: 35,
    marginBottom: spacing.xs, // 4px - minimal spacing
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    ...typography.c1,
    fontWeight: '700',
    marginBottom: spacing.xs, // 4px
  },
  categoryCount: {
    ...typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs, // 4px
  },
  categoryLabel: {
    ...typography.bodyTiny,
    opacity: 0.7,
  },
  orderDetailsCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium, // 14px
    padding: spacing.l + spacing.xs, // 23px
    paddingTop: spacing.l + spacing.xs, // 23px
    paddingBottom: spacing.xs, // 4px (2px)
    gap: spacing.sm, // 14px
    marginBottom: spacing.s, // 8px (reduced from 24px)
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s, // 8px (7px from design)
    marginBottom: spacing.sm, // 14px
  },
  orderDetailsTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text.primary,
  },
  orderDetailsContent: {
    gap: spacing.sm, // 10.5px
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm, // 10.5px
    paddingVertical: spacing.xs, // 4px
    backgroundColor: colors.background,
    borderRadius: radius.large, // 20px
  },
  detailLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  detailValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  priorityBadge: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 101, 101, 0.3)',
    borderRadius: radius.medium, // 16px
    paddingHorizontal: spacing.sm, // 10.5px
    paddingVertical: spacing.xs, // 4px
  },
  priorityText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.priority.high,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l, // 20px
    paddingTop: spacing.l + spacing.xs, // 23px
    paddingBottom: spacing.xl, // 24px
    borderTopWidth: 2,
    borderTopColor: colors.border,
    zIndex: 10,
  },
  startPickingButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.medium, // 14px
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...shadows.large,
  },
  startPickingButtonText: {
    ...typography.c1,
    fontSize: 14,
    lineHeight: 22.4, // 1.6em
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
});

