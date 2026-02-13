import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotating animation for loading circle
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#6B46C1', '#6B46C1', '#5A3BA0']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <Animated.View
        style={[styles.content, { opacity: fadeAnim }]}
      >
        {/* Decorative Circles */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <View style={styles.logoWrapper}>
              <Logo width={82.64} height={82.64} />
            </View>
          </View>

          {/* QuickPick Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>QuickPick</Text>
          </View>

          {/* WAREHOUSE HHD Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>WAREHOUSE HHD</Text>
          </View>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[
                styles.loadingCircle,
                { transform: [{ rotate: spin }] },
              ]}
            />
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        </View>

        {/* Bottom Text */}
        <View style={styles.bottomContainer}>
          <Text style={styles.bottomTitle}>Smart Picking System</Text>
          <Text style={styles.bottomSubtitle}>
            v2.1 • © 2026 QuickPick Technologies
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  decorativeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 33554400,
    opacity: 0.8047,
  },
  circle1: {
    width: 112,
    height: 112,
    left: width * 0.086,
    top: height * 0.077,
  },
  circle2: {
    width: 84,
    height: 84,
    left: width * 0.655,
    top: height * 0.784,
  },
  circle3: {
    width: 56,
    height: 56,
    left: width * 0.759,
    top: height * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainContent: {
    position: 'absolute',
    top: height * 0.26,
    left: (width - 232) / 2,
    width: 232,
    alignItems: 'center',
  },
  logoContainer: {
    width: 165.29,
    height: 165.29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoGlow: {
    position: 'absolute',
    width: 165.29,
    height: 165.29,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    opacity: 0.8047,
  },
  logoWrapper: {
    width: 82.64,
    height: 82.64,
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  heading: {
    fontFamily: 'Arial',
    fontWeight: '700',
    fontSize: 40,
    lineHeight: 48,
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'left',
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 33554400,
    paddingVertical: 12.3,
    paddingHorizontal: 29.5,
    marginTop: 10,
    opacity: 0.8047,
  },
  badgeText: {
    fontFamily: 'Arial',
    fontWeight: '700',
    fontSize: 17.5,
    lineHeight: 24.5,
    color: '#FFFFFF',
    letterSpacing: 1.75,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
    gap: 5,
  },
  loadingCircle: {
    width: 95.86,
    height: 95.86,
    borderRadius: 47.93,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
  },
  loadingText: {
    fontFamily: 'Arial',
    fontWeight: '700',
    fontSize: 15.75,
    lineHeight: 24.5,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 42.5,
    left: 0,
    right: 0,
    width: width,
    height: 38.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  bottomTitle: {
    fontFamily: 'Arial',
    fontWeight: '700',
    fontSize: 12.25,
    lineHeight: 17.5,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  bottomSubtitle: {
    fontFamily: 'Arial',
    fontWeight: '400',
    fontSize: 10.5,
    lineHeight: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});

