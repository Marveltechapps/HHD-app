import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../design-system/tokens';

interface PickingOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onReportIssue?: () => void;
  onPausePicking?: () => void;
  onOrderDetails?: () => void;
  onCancelOrder?: () => void;
}

interface OptionItem {
  id: string;
  icon: string;
  text: string;
  isDestructive?: boolean;
  onPress?: () => void;
}

export default function PickingOptionsModal({
  visible,
  onClose,
  onReportIssue,
  onPausePicking,
  onOrderDetails,
  onCancelOrder,
}: PickingOptionsModalProps) {
  const options: OptionItem[] = [
    {
      id: 'report-issue',
      icon: '🚨',
      text: 'Report Issue',
      onPress: onReportIssue,
    },
    {
      id: 'pause-picking',
      icon: '⏸️',
      text: 'Pause Picking',
      onPress: onPausePicking,
    },
    {
      id: 'order-details',
      icon: '📋',
      text: 'Order Details',
      onPress: onOrderDetails,
    },
    {
      id: 'cancel-order',
      icon: '❌',
      text: 'Cancel Order',
      isDestructive: true,
      onPress: onCancelOrder,
    },
  ];

  const handleOptionPress = (option: OptionItem) => {
    if (option.onPress) {
      option.onPress();
    }
    // Don't close immediately - let the action modal handle closing
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Picking Options</Text>
          <Text style={styles.subtitle}>Choose an action</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                option.isDestructive && styles.optionItemDestructive,
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.optionText,
                  option.isDestructive && styles.optionTextDestructive,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.closeButtonText}>Close</Text>
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
    borderTopLeftRadius: radius.large, // 24px
    borderTopRightRadius: radius.large, // 24px
    paddingTop: spacing.xl, // 24px
    paddingHorizontal: spacing.l, // 20px
    paddingBottom: spacing.xl + spacing.m, // 24px + safe area
    ...shadows.large,
  },
  header: {
    marginBottom: spacing.xl, // 24px
    gap: spacing.xs, // 4px
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.b2,
    color: colors.text.secondary,
  },
  optionsContainer: {
    gap: spacing.s, // 8px
    marginBottom: spacing.xl, // 24px
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m, // 16px
    borderRadius: radius.medium, // 12px
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.m, // 16px
  },
  optionItemDestructive: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderColor: 'rgba(245, 101, 101, 0.3)',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    ...typography.b1,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  optionTextDestructive: {
    color: colors.priority.high,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: spacing.m, // 16px
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.b1,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

