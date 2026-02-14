import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import BackIcon from './icons/BackIcon';
import BagIcon from './icons/BagIcon';
import LightIcon from './icons/LightIcon';
import ManualIcon from './icons/ManualIcon';
import CameraViewfinderIcon from './icons/CameraViewfinderIcon';
import ScannerIcon from './icons/ScannerIcon';
import ManualEntryModal from './ManualEntryModal';
import { bagService } from '../services/bag.service';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface BagScanScreenProps {
  orderId?: string;
  itemCount?: number;
  zone?: string;
  onBack?: () => void;
  onStartScan?: () => void;
  onToggleLight?: () => void;
  onManualEntry?: () => void;
}

export default function BagScanScreen({
  orderId = 'ORD-45621',
  itemCount = 18,
  zone = 'Zone B',
  onBack,
  onStartScan,
  onToggleLight,
  onManualEntry,
}: BagScanScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');
  const [lightOn, setLightOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const cameraRef = useRef<CameraView>(null);

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
      return { size: '15L Small', emoji: '🟢', color: colors.success };
    } else if (itemCount <= 20) {
      return { size: '25L Medium', emoji: '🟢', color: colors.success };
    } else if (itemCount <= 35) {
      return { size: '35L Large', emoji: '🟡', color: '#F59E0B' };
    } else {
      return { size: '50L X-Large', emoji: '🔴', color: colors.error };
    }
  };

  const bagInfo = getBagSize();
  const expectedQR = `BAG-001-${bagInfo.size.split(' ')[0]}-XYZ123`;

  const handleLightToggle = () => {
    setLightOn(!lightOn);
    onToggleLight?.();
  };

  const handleStartScan = () => {
    setIsScanning(true);
  };

  const handleBarcodeScanned = async ({ data, type }: BarcodeScanningResult) => {
    if (isScanning && type === 'qr' && !isSubmitting) {
      console.log('QR Code scanned:', data);
      setIsScanning(false);
      setIsSubmitting(true);
      setError(undefined);

      try {
        // Validate QR code format (should start with BAG-)
        if (!data || !data.startsWith('BAG-')) {
          throw new Error('Invalid bag QR code format. Expected format: BAG-{number}-{size}-{code}');
        }

        // Call API to scan bag
        const bag = await bagService.scanBag({
          qrCode: data,
          orderId,
        });

        console.log('Bag scanned successfully:', bag);
        
        // Reset submitting state immediately
        setIsSubmitting(false);
        
        // Navigate immediately after successful scan (don't wait for Alert)
        // Show success message as non-blocking notification
        Alert.alert(
          'Bag Scanned Successfully',
          `Bag ID: ${bag.bagId}\nSize: ${bag.size || 'N/A'}\nStatus: ${bag.status}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigation already happened, just close alert
              },
            },
          ]
        );
        
        // Navigate to next screen immediately
        onStartScan?.();
      } catch (error: any) {
        console.error('Error scanning bag:', error);
        const errorMessage = error.message || 'Failed to scan bag. Please try again.';
        setError(errorMessage);
        setIsSubmitting(false);
        
        // Check if it's a duplicate bag error (409 status or specific message)
        const isDuplicateBag = error.status === 409 || errorMessage.includes('already been scanned');
        
        Alert.alert(
          isDuplicateBag ? 'Bag Already Scanned' : 'Scan Failed',
          isDuplicateBag 
            ? `${errorMessage}\n\nPlease scan a different bag.`
            : errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset scanning state to allow user to scan again
                setIsScanning(false);
              },
            },
          ]
        );
      }
    }
  };

  const handleManualEntry = async (bagCode: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(undefined);
    setShowManualModal(false);

    try {
      // Validate QR code format
      if (!bagCode || !bagCode.startsWith('BAG-')) {
        throw new Error('Invalid bag QR code format. Expected format: BAG-{number}-{size}-{code}');
      }

      // Call API to scan bag
      const bag = await bagService.scanBag({
        qrCode: bagCode,
        orderId,
      });

      console.log('Bag scanned successfully (manual):', bag);
      
      // Reset submitting state immediately
      setIsSubmitting(false);
      
      // Navigate immediately after successful scan (don't wait for Alert)
      // Show success message as non-blocking notification
      Alert.alert(
        'Bag Scanned Successfully',
        `Bag ID: ${bag.bagId}\nSize: ${bag.size || 'N/A'}\nStatus: ${bag.status}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation already happened, just close alert
            },
          },
        ]
      );
      
      // Navigate to next screen immediately
      onStartScan?.();
    } catch (error: any) {
      console.error('Error scanning bag (manual):', error);
      const errorMessage = error.message || 'Failed to scan bag. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
      
      // Check if it's a duplicate bag error (409 status or specific message)
      const isDuplicateBag = error.status === 409 || errorMessage.includes('already been scanned');
      
      Alert.alert(
        isDuplicateBag ? 'Bag Already Scanned' : 'Scan Failed',
        isDuplicateBag 
          ? `${errorMessage}\n\nPlease scan a different bag.`
          : errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset state to allow user to try again
              setIsScanning(false);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        deviceId="HHD-0234"
        batteryLevel={batteryLevel}
        showTime={true}
        time={currentTime || '4:06 PM'}
      />

      {/* Fixed Order Info Card */}
      <View style={styles.fixedOrderCard}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoHeader}>
            <TouchableOpacity
              style={styles.backButtonInCard}
              onPress={() => {
                if (isScanning) {
                  setIsScanning(false);
                } else {
                  onBack?.();
                }
              }}
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
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>👝 SCAN BAG QR CODE</Text>
          <Text style={styles.subtitle}>
            Scan any bag from the rack to begin picking
          </Text>
        </View>

        {/* Bag Recommendation Card */}
        <View style={styles.bagRecommendationCard}>
          <View style={styles.bagRecommendationHeader}>
            <BagIcon width={21} height={21} color={bagInfo.color} />
            <Text style={styles.bagRecommendationText}>
              Recommended: {bagInfo.size} {bagInfo.emoji}
            </Text>
          </View>
          <View style={styles.bagRecommendationDetails}>
            <Text style={styles.bagDetailText}>
              Capacity: {bagInfo.size.split(' ')[0]} | Items: {itemCount} ✓
            </Text>
            <Text style={styles.bagQRText}>Expected QR: {expectedQR}</Text>
          </View>
        </View>

        {/* Camera Viewfinder Area */}
        <View style={styles.cameraArea}>
          {isScanning ? (
            <>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                enableTorch={lightOn}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={handleBarcodeScanned}
              />
              <View style={styles.scanningOverlay}>
                <View style={styles.scannerIconContainer}>
                  <ScannerIcon width={84} height={84} />
                </View>
                <Text style={styles.scanningText}>SCANNING BAG QR...</Text>
                <View style={styles.scanningProgressBar} />
              </View>
            </>
          ) : (
            <>
              <CameraViewfinderIcon width={112} height={112} color={colors.text.secondary} />
              <Text style={styles.cameraInstruction}>
                Point camera at bag QR code
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.fixedActionButtons}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.startScanButton,
            (isScanning || isSubmitting) && styles.startScanButtonDisabled,
          ]}
          onPress={handleStartScan}
          activeOpacity={0.8}
          disabled={isScanning || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.startScanButtonText}>
              {isScanning ? 'SCANNING...' : 'START SCAN'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLightToggle}
            activeOpacity={0.8}
          >
            <LightIcon width={14} height={14} color={colors.text.primary} />
            <Text style={styles.secondaryButtonText}>🔦 LIGHT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowManualModal(true)}
            activeOpacity={0.8}
          >
            <ManualIcon width={14} height={14} color={colors.text.primary} />
            <Text style={styles.secondaryButtonText}>MANUAL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Entry Modal */}
      <ManualEntryModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={handleManualEntry}
      />
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
    paddingBottom: spacing.s, // 8px (closest to 2px)
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
    paddingTop: layout.statusBarHeight, // Space for fixed order card (64px header + card height)
    paddingBottom: layout.buttonHeight + spacing.xl * 2 + spacing.m, // Space for fixed buttons at bottom (~180px for buttons + padding)
    paddingHorizontal: spacing.l, // 20px
  },
  titleSection: {
    alignItems: 'center',
    marginTop: spacing.m, // 16px - reduced spacing from fixed order card
    marginBottom: spacing.l, // 20px
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.s, // 8px (closest to 7px)
  },
  subtitle: {
    ...typography.b1,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  bagRecommendationCard: {
    backgroundColor: colorWithOpacity.success(0.1),
    borderWidth: 2,
    borderColor: colorWithOpacity.success(0.3),
    borderRadius: radius.medium, // 14px
    padding: spacing.m, // 16px (closest to 19.5px)
    marginBottom: spacing.xl, // 24px
    gap: spacing.xs, // 4px (closest to 3.5px)
  },
  bagRecommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s, // 8px (closest to 7px)
  },
  bagRecommendationText: {
    ...typography.b1,
    color: colors.success,
  },
  bagRecommendationDetails: {
    gap: spacing.xs, // 4px (closest to 3.5px)
    marginTop: spacing.xs,
  },
  bagDetailText: {
    ...typography.b2,
    color: colors.text.secondary,
  },
  bagQRText: {
    ...typography.c4,
    color: colors.text.secondary,
  },
  cameraArea: {
    backgroundColor: colors.grayLight,
    borderRadius: radius.large, // 21px
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl, // 24px
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl, // 21px
    marginBottom: spacing['2xl'], // 32px
    minHeight: 382, // 381.61px from design
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: radius.large - 2, // 19px (21px - 2px border)
  },
  cameraInstruction: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl, // 21px
    paddingTop: spacing['2xl'], // 32px top padding
    paddingBottom: spacing['2xl'], // 32px bottom padding
    pointerEvents: 'none',
  },
  scannerIconContainer: {
    opacity: 0.5, // Match Figma opacity
  },
  scanningText: {
    fontFamily: 'Consolas',
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.success,
    marginTop: spacing.xl, // 24px spacing from icon
  },
  scanningProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: colors.success,
  },
  fixedActionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.l, // 20px
    paddingTop: spacing.m, // 16px
    paddingBottom: spacing.m, // 16px (plus safe area if needed)
    borderTopWidth: 2,
    borderTopColor: colors.border,
    gap: spacing.sm, // 10.5px
    zIndex: 10,
  },
  startScanButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.medium, // 14px
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...shadows.large,
  },
  startScanButtonDisabled: {
    opacity: 0.5,
  },
  startScanButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: spacing.sm, // 10.5px
    height: 52,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium, // 14px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s, // 8px
  },
  secondaryButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  errorContainer: {
    backgroundColor: colorWithOpacity.error(0.1),
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.small,
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  errorText: {
    ...typography.b2,
    color: colors.error,
    textAlign: 'center',
  },
});
