import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import BackIcon from './icons/BackIcon';
import ScanItemIcon from './icons/ScanItemIcon';
import NotFoundIcon from './icons/NotFoundIcon';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';

interface AlternateBinScreenProps {
  orderId: string;
  itemName: string;
  sku: string;
  originalBinId: string;
  alternateBinId: string;
  onBack?: () => void;
  onItemPicked?: () => void;
  onReportIssue?: () => void;
}

export default function AlternateBinScreen({
  orderId,
  itemName,
  sku,
  originalBinId,
  alternateBinId,
  onBack,
  onItemPicked,
  onReportIssue,
}: AlternateBinScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');
  const [scannedCount, setScannedCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

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

  const handleScanItem = () => {
    if (!isScanning) {
      setIsScanning(true);
    }
  };

  const handleItemPicked = () => {
    Alert.alert(
      'Item Picked',
      'Item successfully picked from alternate bin.',
      [
        {
          text: 'OK',
          onPress: () => {
            onItemPicked?.();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '6:39 PM'}
      />

      {/* Order Info Card */}
      <View style={styles.orderInfoCard}>
        <View style={styles.orderInfoHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <BackIcon width={24} height={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.orderInfoLeft}>
            <Text style={styles.orderId}>{orderId}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Alternate Bin Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>📍</Text>
          <Text style={styles.noticeTitle}>Pick from Alternate Bin</Text>
          <Text style={styles.noticeText}>
            The original bin had an issue. Please pick this item from the alternate bin shown below.
          </Text>
        </View>

        {/* Item Info Card */}
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfoLeft}>
              <Text style={styles.itemLabel}>Item</Text>
              <Text style={styles.itemName}>{itemName}</Text>
            </View>
          </View>

          <View style={styles.binInfo}>
            <View style={styles.binRow}>
              <View style={styles.binColumn}>
                <Text style={styles.binLabel}>Original Bin</Text>
                <Text style={styles.binValueOriginal}>{originalBinId}</Text>
              </View>
              <View style={styles.binColumn}>
                <Text style={styles.binLabel}>Alternate Bin</Text>
                <Text style={styles.binValueAlternate}>{alternateBinId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Navigate to bin: {alternateBinId}{'\n'}
            2. Locate the item: {itemName}{'\n'}
            3. Scan the item barcode{'\n'}
            4. Confirm the item is correct
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.fixedButtonContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.notFoundButton}
          onPress={onReportIssue}
          activeOpacity={0.8}
        >
          <NotFoundIcon width={14} height={14} color={colors.priority.high} />
          <Text style={styles.notFoundButtonText}>REPORT ISSUE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanItemButton}
          onPress={handleItemPicked}
          activeOpacity={0.8}
        >
          <ScanItemIcon width={14} height={14} color={colors.white} />
          <Text style={styles.scanItemButtonText}>ITEM PICKED</Text>
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
  orderInfoCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.xs,
  },
  orderInfoLeft: {
    flex: 1,
    marginLeft: spacing.m,
  },
  orderId: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.l,
    gap: spacing.l,
  },
  noticeCard: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    borderRadius: radius.medium,
    padding: spacing.l,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  noticeIcon: {
    fontSize: 32,
    marginBottom: spacing.s,
  },
  noticeTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  noticeText: {
    ...typography.b2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.l,
    ...shadows.medium,
  },
  itemHeader: {
    marginBottom: spacing.m,
  },
  itemInfoLeft: {
    gap: spacing.xs,
  },
  itemLabel: {
    ...typography.b2,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  itemName: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  binInfo: {
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  binRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  binColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  binLabel: {
    ...typography.b2,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  binValueOriginal: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  binValueAlternate: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },
  instructionsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.l,
    ...shadows.medium,
  },
  instructionsTitle: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.s,
  },
  instructionsText: {
    ...typography.b1,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.l,
    gap: spacing.m,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.large,
  },
  notFoundButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.priority.high,
    gap: spacing.s,
  },
  notFoundButtonText: {
    ...typography.button,
    fontWeight: '700',
    color: colors.priority.high,
  },
  scanItemButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    gap: spacing.s,
    ...shadows.medium,
  },
  scanItemButtonText: {
    ...typography.button,
    fontWeight: '700',
    color: colors.white,
  },
});
