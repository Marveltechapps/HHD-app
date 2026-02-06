import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import ScannerIcon from './icons/ScannerIcon';
import CameraViewfinderIcon from './icons/CameraViewfinderIcon';
import { rackService } from '../services/rack.service';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface ScanRackQRScreenProps {
  orderId?: string;
  bagId?: string;
  rackLocation?: string;
  riderName?: string;
  pickStartTime?: Date | null;
  onBack?: () => void;
  onScanComplete?: (rackLocation?: string) => void;
}

export default function ScanRackQRScreen({
  orderId = 'ORD-45621',
  bagId = 'BAG-001',
  rackLocation = 'Rack D1-Slot 3',
  riderName = 'Rider Rohan',
  pickStartTime,
  onBack,
  onScanComplete,
}: ScanRackQRScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');
  const [isScanning, setIsScanning] = useState(false);
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

  const handleStartScan = () => {
    setError(undefined); // Clear any previous errors
    setIsScanning(true);
  };

  /**
   * Validate QR code format: Rack-{identifier}-Slot{number} ({rider name})
   * Example: Rack-D1-Slot3 (John Doe) or Rack-D1-Slot3(John Doe)
   */
  const validateQRFormat = (qrData: string): boolean => {
    if (!qrData || typeof qrData !== 'string') {
      return false;
    }
    
    const trimmed = qrData.trim();
    // Flexible format validation: Rack-{identifier}-Slot{number} ({rider name})
    // Allows zero or more spaces before the opening parenthesis
    const fullPattern = /^Rack-([A-Z0-9]+)-Slot(\d+)\s*\(([^)]+)\)$/i;
    return fullPattern.test(trimmed);
  };

  const handleBarcodeScanned = async ({ data, type }: BarcodeScanningResult) => {
    if (isScanning && type === 'qr' && !isSubmitting) {
      console.log('Rack QR Code scanned:', data);
      setIsScanning(false);
      setIsSubmitting(true);
      setError(undefined);

      try {
        // Validate QR code format
        if (!validateQRFormat(data)) {
          throw new Error(
            'Invalid QR code format. Expected format: Rack-{identifier}-Slot{number} ({rider name})\nExample: Rack-D1-Slot3 (John Doe)'
          );
        }

        // Calculate pickTime in minutes (backend expects minutes)
        let pickTimeInMinutes: number | undefined;
        if (pickStartTime) {
          const pickTimeSeconds = Math.round((new Date().getTime() - pickStartTime.getTime()) / 1000);
          pickTimeInMinutes = Math.round(pickTimeSeconds / 60); // Convert to minutes
        }

        // Call API to scan rack and insert into database
        const rack = await rackService.scanRack({
          qrCode: data,
          orderId: orderId,
          pickTime: pickTimeInMinutes,
        });

        console.log('✅ Rack scanned and saved to database:', rack);
        
        // Show success message
        Alert.alert(
          'Rack Scanned Successfully',
          `Rack Code: ${rack.rackCode}\nLocation: ${rack.location}\nZone: ${rack.zone}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setIsSubmitting(false);
                // Pass rack location back to parent component
                onScanComplete?.(rack.location || rack.rackCode); // Navigate to next screen after successful scan
              },
            },
          ]
        );
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to scan rack. Please try again.';
        setError(errorMessage);
        setIsSubmitting(false);
        setIsScanning(false); // Reset scanning state
        
        // Show error alert with option to retry
        Alert.alert(
          'Scan Failed',
          errorMessage,
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear error after alert is dismissed
                setError(undefined);
              },
            },
          ]
        );
      }
    }
  };

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
          <Text style={styles.successTitle}>✅ PHOTO VERIFIED ✓</Text>
          <Text style={styles.successSubtitle}>
            📦 {orderId} {bagId}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>🚚 SCAN DELIVERY RACK</Text>
            <Text style={styles.subtitle}>
              📍 {rackLocation} ({riderName})
            </Text>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => setError(undefined)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Scanner Preview Area */}
          <View style={styles.scannerContainer}>
            <View style={styles.scannerPreview}>
              {isScanning ? (
                <>
                  <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={handleBarcodeScanned}
                  />
                  <View style={styles.frameOverlay}>
                    {/* QR Code Frame Border with Corner Indicators */}
                    <View style={styles.qrFrameBorder}>
                      {/* Top Left Corner */}
                      <View style={[styles.cornerIndicator, styles.topLeftCorner]} />
                      {/* Top Right Corner */}
                      <View style={[styles.cornerIndicator, styles.topRightCorner]} />
                      {/* Bottom Left Corner */}
                      <View style={[styles.cornerIndicator, styles.bottomLeftCorner]} />
                      {/* Bottom Right Corner */}
                      <View style={[styles.cornerIndicator, styles.bottomRightCorner]} />
                    </View>

                    {/* Instruction Text */}
                    <Text style={styles.frameText}>SCANNING RACK QR...</Text>
                  </View>
                </>
              ) : (
                <View style={styles.frameOverlay}>
                  {/* QR Code Frame Border with Corner Indicators */}
                  <View style={styles.qrFrameBorder}>
                    {/* Top Left Corner */}
                    <View style={[styles.cornerIndicator, styles.topLeftCorner]} />
                    {/* Top Right Corner */}
                    <View style={[styles.cornerIndicator, styles.topRightCorner]} />
                    {/* Bottom Left Corner */}
                    <View style={[styles.cornerIndicator, styles.bottomLeftCorner]} />
                    {/* Bottom Right Corner */}
                    <View style={[styles.cornerIndicator, styles.bottomRightCorner]} />
                  </View>

                  {/* Instruction Text */}
                  <Text style={styles.frameText}>Align rack QR in frame</Text>
                  <View style={styles.cameraPlaceholder}>
                    <CameraViewfinderIcon width={112} height={112} color={colors.text.secondary} />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.scanButton,
            (isScanning || isSubmitting) && styles.scanButtonDisabled,
          ]}
          onPress={handleStartScan}
          activeOpacity={0.8}
          disabled={isScanning || isSubmitting}
        >
          <ScannerIcon width={14} height={14} />
          <Text style={styles.scanButtonText}>
            {isSubmitting
              ? 'PROCESSING...'
              : isScanning
              ? 'SCANNING...'
              : 'SCAN RACK QR'}
          </Text>
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
    backgroundColor: colorWithOpacity.success(0.1),
    borderBottomWidth: 2,
    borderBottomColor: colorWithOpacity.success(0.3),
    padding: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  successTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.success,
  },
  successSubtitle: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  mainContent: {
    gap: spacing.m,
  },
  titleSection: {
    alignItems: 'center',
    gap: spacing.xs + 2, // 7px
    marginBottom: spacing.m,
  },
  mainTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.c1,
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: spacing.s,
    padding: spacing.s,
    backgroundColor: colorWithOpacity.error(0.1),
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colorWithOpacity.error(0.3),
  },
  errorText: {
    ...typography.c1,
    fontWeight: '600',
    color: colors.error,
    textAlign: 'center',
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  dismissButton: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    backgroundColor: colorWithOpacity.error(0.2),
    borderRadius: radius.small,
    alignSelf: 'center',
  },
  dismissButtonText: {
    ...typography.c1,
    fontWeight: '600',
    color: colors.error,
    fontSize: 11,
  },
  scannerContainer: {
    marginTop: spacing.xl + spacing.s, // 32px from title section
    marginBottom: spacing.xl,
  },
  scannerPreview: {
    width: '100%',
    aspectRatio: 1, // Square (364x364)
    backgroundColor: colors.grayLight, // Light gray background to simulate scanner
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    overflow: 'hidden',
    ...shadows.large,
    position: 'relative',
    padding: spacing.xxs, // 2px padding for frame
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.medium,
  },
  cameraPlaceholder: {
    marginTop: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameOverlay: {
    position: 'absolute',
    top: spacing.m + spacing.xs, // 28px
    left: spacing.m + spacing.xs, // 28px
    right: spacing.m + spacing.xs,
    bottom: spacing.m + spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.m, // 14px
  },
  qrFrameBorder: {
    width: 304,
    height: 304,
    borderWidth: 4,
    borderColor: colorWithOpacity.primary(0.5), // Primary color with opacity
    borderRadius: radius.large, // 20px
    position: 'relative',
  },
  cornerIndicator: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderColor: colors.primary,
  },
  topLeftCorner: {
    top: -2,
    left: -2,
    borderTopWidth: 5.83,
    borderLeftWidth: 5.83,
    borderTopLeftRadius: radius.large,
  },
  topRightCorner: {
    top: -2,
    right: -2,
    borderTopWidth: 5.83,
    borderRightWidth: 5.83,
    borderTopRightRadius: radius.large,
  },
  bottomLeftCorner: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 5.83,
    borderLeftWidth: 5.83,
    borderBottomLeftRadius: radius.large,
  },
  bottomRightCorner: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 5.83,
    borderRightWidth: 5.83,
    borderBottomRightRadius: radius.large,
  },
  frameText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing.m, // 14px gap
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
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    ...shadows.large,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.white,
  },
});

