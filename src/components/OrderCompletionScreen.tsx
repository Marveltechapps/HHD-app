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
import { PrimaryButton } from './design-system';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface CompletedItem {
  id: string;
  name: string;
  crateId: string;
  quantity: number;
  grammage: string;
  mrp: string;
  expiryDate: string;
  bin: string;
}

interface OrderCompletionScreenProps {
  orderId?: string;
  itemCount?: number;
  zone?: string;
  completedItems?: CompletedItem[];
  onBack?: () => void;
  onComplete?: () => void;
}

export default function OrderCompletionScreen({
  orderId = 'ORD-45621',
  itemCount = 18,
  zone = 'Zone B',
  completedItems = [],
  onBack,
  onComplete,
}: OrderCompletionScreenProps) {
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

  // Calculate total items scanned
  const totalItemsScanned = completedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '6:45 PM'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <View style={styles.iconWrapper}>
              <CheckIcon width={40} height={40} color={colors.success} />
            </View>
          </View>
          <Text style={styles.successTitle}>Order Completed!</Text>
          <Text style={styles.successSubtitle}>
            All {itemCount} items have been successfully picked
          </Text>
        </View>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order ID:</Text>
            <Text style={styles.summaryValue}>{orderId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zone:</Text>
            <Text style={styles.summaryValue}>{zone}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Scanned:</Text>
            <Text style={styles.summaryValue}>
              {totalItemsScanned} of {itemCount}
            </Text>
          </View>
        </View>

        {/* Completed Items List */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Completed Items</Text>
          <View style={styles.itemsList}>
            {completedItems.map((item, index) => (
              <View key={item.id || index} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      Qty: {item.quantity} • {item.grammage}
                    </Text>
                  </View>
                  <View style={styles.checkmarkContainer}>
                    <View style={styles.iconWrapper}>
                      <CheckIcon width={16} height={16} color={colors.white} />
                    </View>
                  </View>
                </View>
                <View style={styles.itemCardFooter}>
                  <Text style={styles.itemFooterText}>
                    Crate: {item.crateId} • Bin: {item.bin}
                  </Text>
                  {item.mrp !== '-' && (
                    <Text style={styles.itemFooterText}>MRP: {item.mrp}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="NEXT"
          onPress={onComplete || onBack}
          fullWidth={true}
        />
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
    paddingTop: spacing.s, // Reduced from spacing.m
    paddingBottom: layout.buttonHeight + spacing.xl + spacing.m,
    paddingHorizontal: spacing.l,
  },
  successHeader: {
    alignItems: 'center',
    marginTop: spacing.xl, // Reduced from spacing['2xl']
    marginBottom: spacing.l, // Reduced from spacing.xl
    gap: spacing.s, // Reduced from spacing.m
  },
  successIconContainer: {
    width: 80, // Reduced from 112
    height: 80, // Reduced from 112
    borderRadius: 40, // Reduced from 56
    backgroundColor: colorWithOpacity.success(0.1),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Reduced from 3
    borderColor: colors.success,
  },
  successTitle: {
    ...typography.h3, // Reduced from h2
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.b2, // Reduced from b1
    color: colors.text.secondary,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium,
    padding: spacing.m, // Reduced from spacing.l
    marginBottom: spacing.l, // Reduced from spacing.xl
    gap: spacing.s, // Reduced from spacing.m
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.b1,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4, // Reduced from h3
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.s, // Reduced from spacing.m
  },
  itemsList: {
    gap: spacing.s, // Reduced from spacing.m (8px instead of 16px)
  },
  itemCard: {
    backgroundColor: colorWithOpacity.success(0.1),
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: radius.medium,
    padding: spacing.s, // Reduced from spacing.m (8px instead of 16px)
    gap: spacing.xs, // Reduced from spacing.sm (4px instead of 12px)
    ...shadows.card,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed from flex-start to center
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xxs, // Reduced from spacing.xs (2px instead of 4px)
  },
  itemName: {
    ...typography.b2, // Reduced from b1
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemDetails: {
    ...typography.bodyTiny, // Reduced from c1
    color: colors.text.secondary,
  },
  checkmarkContainer: {
    width: 28, // Reduced from 40
    height: 28, // Reduced from 40
    borderRadius: 14, // Reduced from 20
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  itemCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs, // Reduced from spacing.sm (4px instead of 12px)
    borderTopWidth: 1,
    borderTopColor: colorWithOpacity.success(0.3),
    flexWrap: 'wrap', // Allow wrapping for long text
    gap: spacing.xs, // Add gap for wrapped items
  },
  itemFooterText: {
    ...typography.c3, // Smaller font
    color: colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    ...shadows.large,
  },
});

