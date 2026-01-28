import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from './Logo';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import { PrimaryButton, TextField } from './design-system';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
} from '../design-system/tokens';
import {
  validateMobileNumber,
  isMobileInputAllowed,
  cleanMobileNumber,
} from '../utils/mobileValidation';

interface LoginScreenProps {
  onSendOTP?: (mobileNumber: string) => void;
}

export default function LoginScreen({ onSendOTP }: LoginScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  // Validate mobile number
  const validation = validateMobileNumber(mobileNumber, { country: 'IN' });
  const isValid = validation.isValid;

  // Handle mobile number input with validation
  const handleMobileChange = (text: string) => {
    // Filter input - only allow digits
    if (isMobileInputAllowed(text, mobileNumber)) {
      // Clean and set the value
      const cleaned = cleanMobileNumber(text);
      setMobileNumber(cleaned);
      
      // Clear error if input is being corrected
      if (error && cleaned.length > 0) {
        const newValidation = validateMobileNumber(cleaned, { country: 'IN' });
        if (newValidation.isValid || cleaned.length < mobileNumber.length) {
          setError(undefined);
        }
      }
      
      // Show error only after user has interacted (touched)
      if (touched) {
        const newValidation = validateMobileNumber(cleaned, { country: 'IN' });
        setError(newValidation.error);
      }
    }
  };

  // Handle input blur - show validation error
  const handleBlur = () => {
    setTouched(true);
    const validation = validateMobileNumber(mobileNumber, { country: 'IN' });
    setError(validation.error);
  };

  const handleSendOTP = () => {
    setTouched(true);
    const validation = validateMobileNumber(mobileNumber, { country: 'IN' });
    
    if (validation.isValid && onSendOTP) {
      // Send cleaned mobile number
      const cleaned = cleanMobileNumber(mobileNumber);
      onSendOTP(cleaned);
      setError(undefined);
    } else {
      setError(validation.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <Header deviceId="HHD-0234" batteryLevel={batteryLevel} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#6B46C1', '#6B46C1']}
                style={styles.logoGradient}
              >
                <Logo width={35} height={35} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>📱 ENTER MOBILE NUMBER</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <TextField
              label="Mobile Number"
              placeholder="Enter 10-digit mobile"
              value={mobileNumber}
              onChangeText={handleMobileChange}
              onBlur={handleBlur}
              keyboardType="phone-pad"
              maxLength={10}
              error={error}
            />

            <PrimaryButton
              title="SEND OTP →"
              onPress={handleSendOTP}
              disabled={!isValid}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            System Status: Online • Secure Connection
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing['3xl'], // 40px (closest to 42px)
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.l, // 20px (closest to 21px)
    alignItems: 'center',
  },
  logoSection: {
    width: '100%',
    maxWidth: 364,
    marginBottom: spacing['3xl'], // 40px (closest to 42px)
    alignSelf: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l, // 20px (closest to 21px)
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: radius.medium, // 12px (closest to 14px)
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm, // 12px (closest to 10.5px)
  },
  subtitle: {
    ...typography.b1,
    color: colors.text.secondary,
  },
  inputSection: {
    width: '100%',
    maxWidth: 364,
    gap: spacing.l, // 20px (closest to 21px)
    alignSelf: 'center',
  },
  footer: {
    paddingTop: spacing.xl, // 24px (closest to 23px)
    paddingHorizontal: spacing.l, // 20px (closest to 21px)
    paddingBottom: 0,
    height: 64.39,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.c2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

