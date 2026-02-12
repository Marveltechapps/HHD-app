import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../design-system/tokens';
import { pickService, PickIssueType, PickNextAction } from '../services/pick.service';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (issueType: string) => void;
  // New props for API integration
  orderId: string;
  sku: string;
  binId: string;
  deviceId?: string;
  onIssueReported?: (nextAction: PickNextAction, binId?: string) => void;
}

// Map display text to API issue type
const ISSUE_TYPE_MAP: Record<string, PickIssueType> = {
  'Item Damaged': 'ITEM_DAMAGED',
  'Item Missing / Not in Bin': 'ITEM_MISSING',
  'Item Expired': 'ITEM_EXPIRED',
  'Wrong Item in Bin': 'WRONG_ITEM',
};

export default function ReportIssueModal({
  visible,
  onClose,
  onSubmit,
  orderId,
  sku,
  binId,
  deviceId,
  onIssueReported,
}: ReportIssueModalProps) {
  const [selectedIssue, setSelectedIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectIssue = async (displayText: string) => {
    const issueType = ISSUE_TYPE_MAP[displayText];
    if (!issueType) {
      setError('Invalid issue type selected');
      return;
    }

    setSelectedIssue(displayText);
    setError(null);

    // Call legacy onSubmit if provided (for backward compatibility)
    if (onSubmit) {
      onSubmit(displayText);
      onClose();
      return;
    }

    // New API-based flow
    try {
      setLoading(true);

      const response = await pickService.reportIssue({
        orderId,
        sku,
        binId,
        issueType,
        deviceId,
        timestamp: new Date().toISOString(),
      });

      setLoading(false);
      onClose();
      setSelectedIssue('');

      // Notify parent component about the response
      if (onIssueReported) {
        onIssueReported(response.nextAction, response.binId);
      }
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err?.message || 'Failed to report issue. Please try again.';
      setError(errorMessage);
      
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => setError(null),
          },
        ]
      );
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    
    setSelectedIssue('');
    setError(null);
    onClose();
  };

  const issueOptions = [
    'Item Damaged',
    'Item Missing / Not in Bin',
    'Item Expired',
    'Wrong Item in Bin',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>🚨</Text>
            <Text style={styles.title}>Report Issue</Text>
          </View>
          <Text style={styles.subtitle}>Why can't you pick this item?</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {issueOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                selectedIssue === option && styles.optionItemSelected,
                loading && styles.optionItemDisabled,
              ]}
              onPress={() => handleSelectIssue(option)}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading && selectedIssue === option ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.optionText, styles.loadingText]}>
                    Reporting...
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.optionText,
                    selectedIssue === option && styles.optionTextSelected,
                    loading && styles.optionTextDisabled,
                  ]}
                >
                  {option}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Error Message */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, loading && styles.cancelButtonDisabled]}
          onPress={handleClose}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, loading && styles.cancelButtonTextDisabled]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl + spacing.m,
    ...shadows.large,
  },
  header: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.priority.high,
  },
  subtitle: {
    ...typography.b2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  optionsContainer: {
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  optionItem: {
    padding: spacing.m,
    borderRadius: radius.medium,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
  },
  optionText: {
    ...typography.b1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.b1,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonTextDisabled: {
    opacity: 0.5,
  },
  optionItemDisabled: {
    opacity: 0.6,
  },
  optionTextDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  loadingText: {
    marginLeft: spacing.s,
  },
  errorContainer: {
    marginTop: spacing.m,
    padding: spacing.m,
    borderRadius: radius.medium,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderWidth: 1,
    borderColor: colors.priority.high,
  },
  errorText: {
    ...typography.b2,
    color: colors.priority.high,
    textAlign: 'center',
  },
});

