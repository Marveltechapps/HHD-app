import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextField, PrimaryButton } from './design-system';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../design-system/tokens';

interface ManualEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (bagCode: string) => void;
}

export default function ManualEntryModal({
  visible,
  onClose,
  onSubmit,
}: ManualEntryModalProps) {
  const [bagCode, setBagCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!bagCode.trim()) {
      setError('Please enter bag QR code');
      return;
    }
    setError('');
    onSubmit(bagCode.trim());
    setBagCode('');
  };

  const handleClose = () => {
    setBagCode('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Manual Bag Entry</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              Enter the bag QR code manually
            </Text>
            <TextField
              label="Bag QR Code"
              placeholder="e.g., BAG-001-25L-XYZ123"
              value={bagCode}
              onChangeText={(text) => {
                setBagCode(text);
                setError('');
              }}
              error={error}
              autoCapitalize="characters"
              autoFocus
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <PrimaryButton
              title="SUBMIT"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.large, // 24px
    borderTopRightRadius: radius.large, // 24px
    paddingTop: spacing.l, // 20px
    paddingHorizontal: spacing.l, // 20px
    paddingBottom: spacing.xl, // 24px (plus safe area)
    maxHeight: '80%',
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl, // 24px
    paddingBottom: spacing.m, // 16px
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.small, // 8px
    backgroundColor: colors.surfaceAlt,
  },
  closeButtonText: {
    ...typography.h4,
    color: colors.text.secondary,
    fontSize: 20,
    lineHeight: 24,
  },
  content: {
    gap: spacing.l, // 20px
    marginBottom: spacing.xl, // 24px
  },
  description: {
    ...typography.b2,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.m, // 16px
    paddingTop: spacing.m, // 16px
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium, // 14px
  },
  cancelButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  submitButton: {
    flex: 1,
    height: 52,
  },
});

