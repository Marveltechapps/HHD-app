import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Header from './Header';
import { useBatteryLevel } from '../hooks/useBatteryLevel';
import { useAuth } from '../contexts/AuthContext';
import { authService, UserProfileResponse } from '../services/auth.service';
import HomeIcon from './icons/HomeIcon';
import TasksIcon from './icons/TasksIcon';
import ProfileIcon from './icons/ProfileIcon';
import PhoneIcon from './icons/PhoneIcon';
import EmailIcon from './icons/EmailIcon';
import WarehouseIcon from './icons/WarehouseIcon';
import SignOutIcon from './icons/SignOutIcon';
import SignOutConfirmationModal from './SignOutConfirmationModal';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  colorWithOpacity,
} from '../design-system/tokens';

interface ProfileScreenProps {
  onNavigate?: (screen: 'home' | 'tasks' | 'profile') => void;
  onSignOut?: () => void;
}

export default function ProfileScreen({
  onNavigate,
  onSignOut,
}: ProfileScreenProps) {
  const batteryLevel = useBatteryLevel();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile = await authService.getProfile();
        setProfileData(profile);
      } catch (err: any) {
        console.error('[ProfileScreen] Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

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

  // Helper function to format mobile number
  const formatMobileNumber = (mobile?: string): string => {
    if (!mobile) return 'N/A';
    // Format as +91 XXXXXXXXXX
    if (mobile.length === 10) {
      return `+91 ${mobile}`;
    }
    return mobile;
  };

  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  // Get display values from profile data
  const displayName = profileData?.name || user?.name || 'User';
  const workerId = profileData?.mobile || user?.mobile || 'N/A';
  const phoneNumber = formatMobileNumber(profileData?.mobile || user?.mobile);
  const email = 'N/A'; // Email not in User model
  const warehouse = 'N/A'; // Warehouse not in User model
  const department = 'Warehouse Operations'; // Default value
  const role = profileData?.role || user?.role || 'Picker';
  const shift = 'N/A'; // Shift not in User model
  const joinDate = formatDate(profileData?.createdAt);
  const isActive = profileData?.isActive ?? true;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header deviceId="HHD-0234" batteryLevel={batteryLevel} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <ProfileIcon width={42} height={42} color={colors.white} />
            </View>
          </View>

          {/* Name */}
          <Text style={styles.name}>{displayName.toUpperCase()}</Text>

          {/* Worker ID */}
          <Text style={styles.workerId}>Worker ID: {workerId}</Text>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {isActive ? 'ACTIVE WORKER' : 'INACTIVE WORKER'}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoContent}>
            {/* Phone */}
            <View style={styles.infoRow}>
              <PhoneIcon width={17.5} height={17.5} color={colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{phoneNumber}</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.infoRow}>
              <EmailIcon width={17.5} height={17.5} color={colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
            </View>

            {/* Warehouse */}
            <View style={styles.infoRow}>
              <WarehouseIcon width={17.5} height={17.5} color={colors.text.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Warehouse</Text>
                <Text style={styles.infoValue}>{warehouse}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Employment Details */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Employment Details</Text>

          <View style={styles.employmentContent}>
            {/* Department */}
            <View style={styles.employmentRow}>
              <Text style={styles.employmentLabel}>Department</Text>
              <Text style={styles.employmentValue}>{department}</Text>
            </View>

            {/* Role */}
            <View style={styles.employmentRow}>
              <Text style={styles.employmentLabel}>Role</Text>
              <Text style={styles.employmentValue}>{role}</Text>
            </View>

            {/* Shift */}
            <View style={styles.employmentRow}>
              <Text style={styles.employmentLabel}>Shift</Text>
              <Text style={styles.employmentValue}>{shift}</Text>
            </View>

            {/* Join Date */}
            <View style={styles.employmentRow}>
              <Text style={styles.employmentLabel}>Join Date</Text>
              <Text style={styles.employmentValue}>{joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => setShowSignOutModal(true)}
          activeOpacity={0.8}
        >
          <SignOutIcon width={14} height={14} color={colors.priority.high} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        </>
        )}
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmationModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          setShowSignOutModal(false);
          onSignOut?.();
        }}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate?.('home')}
        >
          <HomeIcon width={24.5} height={24.5} color={colors.text.secondary} />
          <Text style={styles.navText}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onNavigate?.('tasks')}
        >
          <TasksIcon width={24.5} height={24.5} color={colors.text.secondary} />
          <Text style={styles.navText}>TASKS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          onPress={() => onNavigate?.('profile')}
        >
          <ProfileIcon width={24.5} height={24.5} color={colors.primary} />
          <Text style={styles.navTextActive}>PROFILE</Text>
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
    paddingBottom: layout.bottomNavHeight + spacing.m,
    paddingHorizontal: spacing.l,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs, // 23px
    alignItems: 'center',
    marginBottom: spacing.l + spacing.xs, // 21px
    ...shadows.card,
  },
  avatarContainer: {
    marginTop: spacing.l + spacing.xs, // 23px
    marginBottom: spacing.xl + spacing.m, // 32px
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 35,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  workerId: {
    ...typography.b1,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  statusBadge: {
    backgroundColor: colorWithOpacity.success(0.1),
    borderRadius: radius.large, // 20px
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2, // 7px
  },
  statusText: {
    ...typography.c2,
    fontWeight: '700',
    color: colors.success,
    fontSize: 12.25,
    lineHeight: 17.5,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: radius.medium,
    padding: spacing.l + spacing.xs, // 23px
    paddingBottom: spacing.xs,
    gap: spacing.m,
    marginBottom: spacing.xl, // 24px - proper spacing between cards
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 15.75,
    lineHeight: 24.5,
  },
  infoContent: {
    gap: spacing.m,
    paddingBottom: spacing.l, // 20px
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xs, // 10.5px
  },
  infoTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.b2,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 12.25,
    lineHeight: 17.5,
  },
  infoValue: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
  },
  employmentContent: {
    gap: spacing.sm + spacing.xs, // 10.5px
  },
  employmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm + spacing.xs, // 10.5px
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  employmentLabel: {
    ...typography.b1,
    fontWeight: '400',
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  employmentValue: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  signOutButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colorWithOpacity.error(0.3),
    borderRadius: radius.medium,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  signOutText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.priority.high,
    fontSize: 14,
    lineHeight: 22.4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.bottomNavHeight, // 88px
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 0,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs, // 3.5px
    paddingVertical: spacing.s,
    borderRadius: radius.large, // 20px
  },
  navButtonActive: {
    backgroundColor: colorWithOpacity.primary(0.1),
  },
  navText: {
    ...typography.c2,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  navTextActive: {
    ...typography.c2,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.m,
  },
  loadingText: {
    ...typography.b1,
    color: colors.text.secondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  errorText: {
    ...typography.b1,
    color: colors.priority.high,
    fontSize: 16,
    textAlign: 'center',
  },
});

