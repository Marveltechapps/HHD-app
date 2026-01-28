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
  colorWithOpacity,
} from '../design-system/tokens';

interface SignOutConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function SignOutConfirmationModal({
  visible,
  onClose,
  onConfirm,
}: SignOutConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🚪 Sign Out</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.description}>
                Are you sure you want to sign out? You'll need to log in again to
                access your account.
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>SIGN OUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colorWithOpacity.black(0.5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 364,
    ...shadows.large,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.priority.high,
    textAlign: 'center',
  },
  content: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.b2,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 2,
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
    borderRadius: radius.medium,
  },
  cancelButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  confirmButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorWithOpacity.error(0.1),
    borderWidth: 2,
    borderColor: colorWithOpacity.error(0.3),
    borderRadius: radius.medium,
  },
  confirmButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.priority.high,
  },
});

