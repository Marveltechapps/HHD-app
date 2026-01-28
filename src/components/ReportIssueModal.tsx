import React, { useState } from 'react';
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

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (issueType: string) => void;
}

export default function ReportIssueModal({
  visible,
  onClose,
  onSubmit,
}: ReportIssueModalProps) {
  const [selectedIssue, setSelectedIssue] = useState('');

  const handleSelectIssue = (issueType: string) => {
    setSelectedIssue(issueType);
    onSubmit?.(issueType);
    onClose();
  };

  const handleClose = () => {
    setSelectedIssue('');
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
              ]}
              onPress={() => handleSelectIssue(option)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedIssue === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
});

