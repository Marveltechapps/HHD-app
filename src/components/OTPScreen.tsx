import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from './Logo';
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
} from '../design-system/tokens';

interface OTPScreenProps {
  mobileNumber: string;
  onVerify?: (otp: string) => void;
  onChangeNumber?: () => void;
  onResend?: () => void;
}

export default function OTPScreen({
  mobileNumber,
  onVerify,
  onChangeNumber,
  onResend,
}: OTPScreenProps) {
  const batteryLevel = useBatteryLevel();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState<string | undefined>();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Show error indication when OTP is complete but invalid
  useEffect(() => {
    if (isOtpComplete && !isValidOtp) {
      setError('Invalid OTP. Please enter a valid code.');
    } else if (isOtpComplete && isValidOtp) {
      setError(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    if (value.length > 1) {
      // Handle paste - only accept exactly 4 digits
      const pastedDigits = value
        .split('')
        .filter((char) => /^\d$/.test(char))
        .slice(0, 4);
      
      const newOtp = ['', '', '', ''];
      pastedDigits.forEach((digit, i) => {
        if (i < 4) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Clear error when pasting
      if (error) {
        setError(undefined);
      }
      
      // Focus the last input or first empty
      const focusIndex = Math.min(pastedDigits.length, 3);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user starts typing
    if (error) {
      setError(undefined);
    }

    // Auto-focus next input if digit entered and not last
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validate OTP: reject 0000 and all same digits
  const isOtpValid = (otpArray: string[]): boolean => {
    const otpString = otpArray.join('');
    
    // Check if all digits are filled
    if (!otpArray.every((digit) => digit !== '')) {
      return false;
    }
    
    // Reject "0000"
    if (otpString === '0000') {
      return false;
    }
    
    // Reject all same digits (e.g., "1111", "2222", etc.)
    const firstDigit = otpString[0];
    if (otpString.split('').every((digit) => digit === firstDigit)) {
      return false;
    }
    
    return true;
  };

  const isOtpComplete = otp.every((digit) => digit !== '');
  const isValidOtp = isOtpValid(otp);
  const canResend = timeLeft === 0;

  const handleVerify = () => {
    if (!isOtpComplete) {
      return;
    }
    
    if (!isValidOtp) {
      setError('Invalid OTP. Please enter a valid code.');
      return;
    }
    
    setError(undefined);
    if (onVerify) {
      onVerify(otp.join(''));
    }
  };

  const handleResend = () => {
    if (canResend && onResend) {
      setTimeLeft(300);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
      onResend();
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
                colors={[colors.primary, colors.primary]}
                style={styles.logoGradient}
              >
                <Logo width={35} height={35} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>🔐 ENTER OTP</Text>
            <Text style={styles.subtitle}>
              Code sent to +91 {mobileNumber}
            </Text>
          </View>

          {/* OTP Input Section */}
          <View style={styles.otpSection}>
            <View style={styles.otpHeader}>
              <Text style={styles.otpLabel}>One-Time Password</Text>
              <TouchableOpacity onPress={onChangeNumber}>
                <Text style={styles.changeNumberText}>Change Number</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    error && isOtpComplete && styles.otpInputError,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error && isOtpComplete && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Text style={styles.timerText}>
              Expires in {formatTime(timeLeft)}
            </Text>
          </View>

          {/* Verify Button */}
          <View style={styles.verifyButtonContainer}>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!isOtpComplete || !isValidOtp) && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isOtpComplete || !isValidOtp}
              activeOpacity={0.8}
            >
              <CheckIcon width={14} height={14} />
              <Text style={styles.verifyButtonText}>VERIFY & CONTINUE</Text>
            </TouchableOpacity>
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={!canResend}
          >
            <Text
              style={[
                styles.resendText,
                !canResend && styles.resendTextDisabled,
              ]}
            >
              Didn't receive code? Resend
            </Text>
          </TouchableOpacity>
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
    paddingTop: spacing['3xl'], // 40px
    paddingBottom: spacing['3xl'],
    paddingHorizontal: spacing.l, // 20px
    alignItems: 'center',
  },
  logoSection: {
    width: '100%',
    maxWidth: 364,
    marginBottom: spacing['2xl'], // 32px (closest to 28px)
    alignSelf: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l, // 20px
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: radius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm, // 12px
  },
  subtitle: {
    ...typography.b1,
    color: colors.text.secondary,
  },
  otpSection: {
    width: '100%',
    maxWidth: 364,
    gap: spacing.sm, // 12px (closest to 10.5px)
    alignSelf: 'center',
    marginBottom: spacing['2xl'], // 32px
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  otpLabel: {
    ...typography.b1,
    color: colors.text.primary,
  },
  changeNumberText: {
    ...typography.b2,
    color: colors.primary,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: spacing.xl, // 24px
  },
  otpInput: {
    width: 64,
    height: 64,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium,
    ...typography.h3,
    fontWeight: '700',
    fontSize: 28,
    textAlign: 'center',
    color: colors.text.secondary,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  otpInputFilled: {
    borderColor: colors.primary,
    color: colors.text.primary,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.b2,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  timerText: {
    ...typography.b2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  verifyButtonContainer: {
    width: '100%',
    maxWidth: 364,
    marginBottom: spacing.m, // 16px
    alignSelf: 'center',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    height: layout.buttonHeight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    gap: spacing.sm, // 12px
    ...shadows.button,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.white,
  },
  resendButton: {
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    ...typography.b1,
    color: colors.primary,
    textAlign: 'center',
  },
  resendTextDisabled: {
    color: colors.text.tertiary,
    opacity: 0.5,
  },
  footer: {
    paddingTop: spacing.xl, // 24px
    paddingHorizontal: spacing.l, // 20px
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

