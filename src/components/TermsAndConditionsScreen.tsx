import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from './Logo';
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
} from '../design-system/tokens';

interface TermCardProps {
  number: number;
  text: string;
}

function TermCard({ number, text }: TermCardProps) {
  return (
    <View style={styles.termCard}>
      <View style={styles.termNumberBadge}>
        <Text style={styles.termNumber}>{number}</Text>
      </View>
      <View style={styles.termTextContainer}>
        <Text style={styles.termText}>{text}</Text>
      </View>
    </View>
  );
}

interface TermsAndConditionsScreenProps {
  onAccept?: () => void;
}

export default function TermsAndConditionsScreen({
  onAccept,
}: TermsAndConditionsScreenProps) {
  const batteryLevel = useBatteryLevel();
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
              colors={[colors.primary, colors.primary]}
              style={styles.logoGradient}
            >
              <Logo width={35} height={35} />
            </LinearGradient>
          </View>
          <Text
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode="clip"
            allowFontScaling={false}
          >
            Terms & Conditions
          </Text>
          <Text style={styles.subtitle}>
            Please review and accept to continue
          </Text>
        </View>

        {/* Terms Cards */}
        <View style={styles.termsContainer}>
          <TermCard
            number={1}
            text="I agree to follow all warehouse safety protocols and wear protective equipment during my shift"
          />
          <TermCard
            number={2}
            text="I will complete all assigned orders accurately and maintain quality standards for customers"
          />
          <TermCard
            number={3}
            text="I will return the HHD device to the charging station and report any issues immediately"
          />
        </View>
      </ScrollView>

      {/* Footer with Accept Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="I ACCEPT & CONTINUE"
          onPress={onAccept || (() => {})}
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
    // Keep the title on a single line on smaller screens
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.b1,
    color: colors.text.secondary,
  },
  termsContainer: {
    width: '100%',
    maxWidth: 364,
    gap: spacing.l, // 20px (closest to 21px)
    alignSelf: 'center',
  },
  termCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium,
    padding: spacing.xl, // 24px (closest to 23px)
    minHeight: 129.78,
    alignItems: 'flex-start',
    width: '100%',
  },
  termNumberBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm, // 12px (closest to 14px)
    marginTop: 3.5,
  },
  termNumber: {
    ...typography.h4,
    color: colors.success,
  },
  termTextContainer: {
    flex: 1,
    paddingTop: spacing.xs, // 4px (closest to 5px)
  },
  termText: {
    ...typography.b1,
    color: colors.text.primary,
  },
  footer: {
    paddingTop: spacing.xl, // 24px (closest to 23px)
    paddingHorizontal: spacing.l, // 20px (closest to 21px)
    paddingBottom: 0,
    height: 96,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
