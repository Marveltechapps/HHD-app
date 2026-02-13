import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from './Logo';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import ScannerIcon from './icons/ScannerIcon';
import CameraIcon from './icons/CameraIcon';
import NetworkIcon from './icons/NetworkIcon';
import BatteryIcon from './icons/BatteryIcon';
import { Card } from './design-system';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';

interface DeviceReadyScreenProps {
  onComplete?: () => void;
}

interface StatusCardProps {
  iconComponent: 'scanner' | 'camera' | 'network' | 'battery';
  title: string;
  isReady: boolean;
  showCheckmark?: boolean;
  batteryLevel?: number;
  delay: number;
}

function StatusCard({
  iconComponent,
  title,
  isReady,
  showCheckmark = false,
  batteryLevel,
  delay,
}: StatusCardProps) {
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const batteryBarWidth = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconBgColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReady) {
      // Animate border color from gray to green
      Animated.timing(borderColorAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();

      // Animate icon background color from gray to green
      Animated.timing(iconBgColorAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();

      // Animate icon scale for visual feedback
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate checkmark fade in
      if (showCheckmark) {
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 300,
          delay: 200,
          useNativeDriver: true,
        }).start();
      }

      // Animate battery bar if present
      if (batteryLevel !== undefined) {
        Animated.timing(batteryBarWidth, {
          toValue: batteryLevel,
          duration: 600,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [isReady, showCheckmark, batteryLevel]);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', '#48BB78'],
  });

  const iconBgColor = iconBgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      '#E8E8E8',
      iconComponent === 'battery' ? '#5AC085' : '#48BB78',
    ],
  });

  const getIcon = () => {
    const iconProps = { width: 42, height: 42 };
    switch (iconComponent) {
      case 'scanner':
        return <ScannerIcon {...iconProps} />;
      case 'camera':
        return <CameraIcon {...iconProps} />;
      case 'network':
        return <NetworkIcon {...iconProps} />;
      case 'battery':
        return <BatteryIcon {...iconProps} />;
    }
  };

  return (
    <Animated.View style={[styles.statusCard, { borderColor }]}>
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[
            styles.iconBackground,
            {
              backgroundColor: iconBgColor,
              transform: [{ scale: iconScale }],
            },
          ]}
        />
        <View style={styles.iconContainer}>{getIcon()}</View>
      </View>
      <View style={styles.statusContent}>
        {batteryLevel !== undefined ? (
          <View style={styles.batteryContent}>
            <Text style={styles.statusTitle}>{title}</Text>
            <View style={styles.batteryBarContainer}>
              <Animated.View
                style={[
                  styles.batteryBar,
                  {
                    width: batteryBarWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.statusTitle}>{title}</Text>
        )}
      </View>
      {showCheckmark && (
        <Animated.View
          style={[styles.checkmarkContainer, { opacity: checkmarkOpacity }]}
        >
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default function DeviceReadyScreen({ onComplete }: DeviceReadyScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [networkReady, setNetworkReady] = useState(false);
  const [batteryReady, setBatteryReady] = useState(false);

  useEffect(() => {
    // Simulate device scanning - all cards complete within 3 seconds
    // Scanner: 0.5s
    const timer1 = setTimeout(() => {
      setScannerReady(true);
    }, 500);

    // Camera: 1.2s
    const timer2 = setTimeout(() => {
      setCameraReady(true);
    }, 1200);

    // Network: 2s
    const timer3 = setTimeout(() => {
      setNetworkReady(true);
    }, 2000);

    // Battery: 2.8s (last one, within 3s limit)
    const timer4 = setTimeout(() => {
      setBatteryReady(true);
    }, 2800);

    // Navigate to terms screen after all animations complete (3.5s total)
    const navigationTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(navigationTimer);
    };
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header deviceId="HHD-0234" batteryLevel={batteryLevel} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#6B46C1', '#6B46C1']}
              style={styles.logoGradient}
            >
              <Logo width={56} height={56} />
            </LinearGradient>
          </View>
          <Text style={styles.quickPickTitle}>QuickPick</Text>
          <Text style={styles.warehouseText}>WAREHOUSE HHD</Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statusCardsContainer}>
          <StatusCard
            iconComponent="scanner"
            title="Scanner Ready"
            isReady={scannerReady}
            showCheckmark={true}
            delay={500}
          />
          <StatusCard
            iconComponent="camera"
            title="Camera Active"
            isReady={cameraReady}
            showCheckmark={true}
            delay={1200}
          />
          <StatusCard
            iconComponent="network"
            title="Network Connected"
            isReady={networkReady}
            showCheckmark={true}
            delay={2000}
          />
          <StatusCard
            iconComponent="battery"
            title={`Battery: ${batteryLevel}%`}
            isReady={batteryReady}
            showCheckmark={true}
            batteryLevel={batteryLevel}
            delay={2800}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          System v2.1 • All systems operational
        </Text>
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
    alignItems: 'center',
    paddingTop: spacing['3xl'], // 40px (closest to 42px)
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.l, // 20px (closest to 21px)
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing['3xl'], // 40px (closest to 42px)
    marginBottom: spacing['3xl'],
    width: 153.77,
    alignSelf: 'center',
  },
  logoContainer: {
    width: 112,
    height: 112,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 21,
  },
  logoGradient: {
    width: 112,
    height: 112,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(107, 70, 193, 0.08)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16.13,
    shadowOpacity: 1,
    elevation: 8,
  },
  quickPickTitle: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.s, // 8px (closest to 7px)
  },
  warehouseText: {
    ...typography.h4,
    color: colors.primary,
    letterSpacing: 0.44,
    textAlign: 'center',
  },
  statusCardsContainer: {
    width: '100%',
    maxWidth: 364,
    gap: spacing.sm, // 12px (closest to 10.5px)
    alignSelf: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 12px (closest to 14px)
    paddingHorizontal: spacing.m, // 16px (closest to 17.5px)
    paddingVertical: spacing.m,
    minHeight: 80.5,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: radius.medium, // 12px (closest to 14px)
    marginHorizontal: 0,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBackground: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  iconContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  statusContent: {
    flex: 1,
    height: 24.5,
    justifyContent: 'center',
  },
  statusTitle: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  batteryContent: {
    gap: 7,
  },
  batteryBarContainer: {
    height: 7,
    backgroundColor: '#E8E8E8',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  batteryBar: {
    height: 7,
    backgroundColor: '#48BB78',
    borderRadius: 3.5,
  },
  checkmarkContainer: {
    width: 9.19,
    height: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontFamily: 'Arial',
    fontWeight: '700',
    fontSize: 12.25,
    lineHeight: 17.5,
    color: '#48BB78',
  },
  footer: {
    paddingTop: 23,
    paddingHorizontal: 21,
    height: 61.5,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Arial',
    fontWeight: '400',
    fontSize: 12.25,
    lineHeight: 17.5,
    color: '#6B7280',
    textAlign: 'center',
  },
});

