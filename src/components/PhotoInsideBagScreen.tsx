import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CameraView, CameraCapturedPicture } from 'expo-camera';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import CheckIcon from './icons/CheckIcon';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface PhotoInsideBagScreenProps {
  orderId?: string;
  itemCount?: number;
  bagId?: string;
  detectedCount?: number;
  onBack?: () => void;
  onComplete?: () => void;
}

export default function PhotoInsideBagScreen({
  orderId = 'ORD-45621',
  itemCount = 18,
  bagId = 'BAG-001',
  detectedCount = 0,
  onBack,
  onComplete,
}: PhotoInsideBagScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [currentTime, setCurrentTime] = useState('');
  const [detectedItems, setDetectedItems] = useState(detectedCount);
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
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

    // Simulate item detection
    const detectionInterval = setInterval(() => {
      setDetectedItems((prev) => {
        if (prev < itemCount) {
          return prev + 1;
        }
        return prev;
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(detectionInterval);
    };
  }, [itemCount]);

  // Auto-capture photo when camera is ready
  useEffect(() => {
    if (isCameraReady && !capturedPhoto && cameraRef.current) {
      // Wait a bit for camera to stabilize, then take photo
      const captureTimer = setTimeout(async () => {
        try {
          if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.8,
              base64: false,
            });
            setCapturedPhoto(photo);
            console.log('Photo captured automatically:', photo.uri);
          }
        } catch (error) {
          console.error('Error capturing photo:', error);
        }
      }, 1500); // 1.5 second delay to ensure camera is stable

      return () => clearTimeout(captureTimer);
    }
  }, [isCameraReady, capturedPhoto]);

  const isDetectionComplete = detectedItems >= itemCount;

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
          <Text style={styles.successTitle}>
            📦 {orderId} COMPLETE ✓
          </Text>
          <Text style={styles.successSubtitle}>
            👝 {bagId} {itemCount}/{itemCount} items ✓
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>📸 PHOTO INSIDE BAG</Text>
            <Text style={styles.subtitle}>
              Hold HHD 30cm above OPEN bag
            </Text>
          </View>

          {/* Camera Preview Area */}
          <View style={styles.cameraContainer}>
            {/* Camera Preview Background */}
            <View style={styles.cameraPreview}>
              {capturedPhoto ? (
                <Image
                  source={{ uri: capturedPhoto.uri }}
                  style={styles.capturedImage}
                  resizeMode="cover"
                />
              ) : (
                <CameraView
                  ref={cameraRef}
                  style={styles.cameraView}
                  facing="back"
                  onCameraReady={() => {
                    setIsCameraReady(true);
                  }}
                />
              )}
              {/* Frame Overlay */}
              <View style={styles.frameOverlay}>
                <Text style={styles.frameText}>Frame ALL items here</Text>
                
                {/* Detection Status Badge */}
                <View
                  style={[
                    styles.detectionBadge,
                    isDetectionComplete && styles.detectionBadgeComplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.detectionText,
                      isDetectionComplete && styles.detectionTextComplete,
                    ]}
                  >
                    {detectedItems}/{itemCount} detected
                    {isDetectionComplete ? ' ✓' : ' ...'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.detectButton,
            !isDetectionComplete && styles.detectButtonDisabled,
          ]}
          disabled={!isDetectionComplete}
          activeOpacity={0.8}
          onPress={isDetectionComplete ? onComplete : undefined}
        >
          <CheckIcon width={14} height={14} color={isDetectionComplete ? colors.white : colors.text.secondary} />
          <Text
            style={[
              styles.detectButtonText,
              !isDetectionComplete && styles.detectButtonTextDisabled,
            ]}
          >
            {isDetectionComplete
              ? 'CAPTURE CONTENTS'
              : `DETECTING... ${detectedItems}/${itemCount}`}
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
  cameraContainer: {
    marginTop: spacing.xl + spacing.s, // 32px from title section
    marginBottom: spacing.xl,
  },
  cameraPreview: {
    width: '100%',
    aspectRatio: 364 / 273, // Based on Figma dimensions
    backgroundColor: colors.grayLight, // Light gray background to simulate camera preview
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    overflow: 'hidden',
    ...shadows.large,
    position: 'relative',
  },
  cameraView: {
    width: '100%',
    height: '100%',
  },
  capturedImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  frameOverlay: {
    position: 'absolute',
    top: spacing.m + spacing.xs, // 30px
    left: spacing.m + spacing.xs, // 30px
    right: spacing.m + spacing.xs,
    bottom: spacing.m + spacing.xs,
    borderWidth: 4,
    borderColor: colorWithOpacity.primary(0.5), // Primary color with opacity
    borderRadius: radius.large, // 20px
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs + 2, // 7px
    backgroundColor: 'transparent',
  },
  frameText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
  },
  detectionBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2, // 6px
    borderRadius: radius.medium,
    ...shadows.card,
  },
  detectionText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text.primary,
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
  detectButton: {
    backgroundColor: colors.success, // Green when enabled
    borderRadius: radius.medium,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    ...shadows.large,
  },
  detectButtonDisabled: {
    backgroundColor: colors.grayLight,
    opacity: 0.5,
  },
  detectButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.white,
  },
  detectButtonTextDisabled: {
    color: colors.text.secondary,
  },
  detectionBadgeComplete: {
    backgroundColor: colors.success, // Green background when complete
  },
  detectionTextComplete: {
    color: colors.white, // White text when complete
  },
});

