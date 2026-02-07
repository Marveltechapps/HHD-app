import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { useAuth } from '../contexts/AuthContext';
import { checkBackendHealth, getConnectionInfo } from '../utils/apiHelper';

interface LoginScreenProps {
  onSendOTP?: (mobileNumber: string) => void;
}

export default function LoginScreen({ onSendOTP }: LoginScreenProps) {
  const batteryLevel = useBatteryLevel();
  const { sendOTP } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSendOTP = async () => {
    setTouched(true);
    const validation = validateMobileNumber(mobileNumber, { country: 'IN' });
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const cleaned = cleanMobileNumber(mobileNumber);
      
      // Validate mobile number format matches backend requirements (10 digits starting with 6-9)
      if (!/^[6-9]\d{9}$/.test(cleaned)) {
        setError('Mobile number must be 10 digits starting with 6, 7, 8, or 9');
        Alert.alert('Invalid Mobile Number', 'Mobile number must be 10 digits starting with 6, 7, 8, or 9');
        setLoading(false);
        return;
      }

      const response = await sendOTP(cleaned);
      
      console.log('[Login Screen] Send OTP Response:', response);
      
      // In development, OTP is returned in response
      if (__DEV__ && response.otp) {
        console.log('✅ OTP generated (dev only):', response.otp);
        Alert.alert(
          'OTP Sent (Development Mode)',
          `Your OTP is: ${response.otp}\n\nThis is only shown in development mode.\nYou can enter this OTP to verify.`,
          [{ text: 'OK' }]
        );
      } else if (__DEV__) {
        // If in dev mode but OTP not in response, log warning
        console.warn('[Login Screen] Development mode but OTP not in response');
      }

      // Call parent callback if provided
      if (onSendOTP) {
        onSendOTP(cleaned);
      }
    } catch (error: any) {
      console.error('[Login Screen] Send OTP Error:', error);
      console.error('[Login Screen] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      let errorMessage = error.message || 'Failed to send OTP. Please try again.';
      let showDetailedHelp = false;
      
      // Provide more specific error messages
      if (error.message?.includes('Cannot connect to server') || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed')) {
        errorMessage = 'Cannot connect to backend server.';
        showDetailedHelp = true;
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid mobile number format';
      }
      
      setError(errorMessage);
      
      if (showDetailedHelp) {
        const connectionInfo = getConnectionInfo();
        
        Alert.alert(
          'Backend Server Not Running',
          `Cannot connect to backend server.\n\nQuick Fix:\n\n1. Open terminal\n2. Run: cd HHD-APP-Backend\n3. Run: npm run dev\n4. Wait for "🚀 Server running on port 5000"\n5. Try again\n\nOr double-click: start-backend.bat`,
          [
            {
              text: 'OK',
              onPress: () => {},
            },
            {
              text: 'More Info',
              onPress: () => {
                Alert.alert(
                  'Connection Details',
                  `Platform: ${connectionInfo.platform}\nExpected URL: ${connectionInfo.baseUrl.replace('/api', '')}\n\n${connectionInfo.instructions}\n\nSee START_BACKEND.md for help.`
                );
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
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
            <Text
              style={styles.title}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              allowFontScaling={false}
            >
              ENTER MOBILE NUMBER
            </Text>
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
              title={loading ? "SENDING..." : "SEND OTP →"}
              onPress={handleSendOTP}
              disabled={!isValid || loading}
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
    // Keep this heading on a single line on smaller screens
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
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

