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

interface CancelOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function CancelOrderModal({
  visible,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
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
          <Text style={styles.title}>❌ Cancel Order</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.warningText}>
            ⚠️ Warning: This action cannot be undone
          </Text>
          <Text style={styles.description}>
            Are you sure you want to cancel this order? All progress will be
            lost and the order will be returned to the queue.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>KEEP ORDER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>CANCEL ORDER</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: spacing.l,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.m,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.priority.high,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.small,
    backgroundColor: colors.surfaceAlt,
  },
  closeButtonText: {
    ...typography.h4,
    color: colors.text.secondary,
    fontSize: 20,
    lineHeight: 24,
  },
  content: {
    marginBottom: spacing.xl,
    gap: spacing.m,
  },
  warningText: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.priority.high,
  },
  description: {
    ...typography.b2,
    color: colors.text.secondary,
    lineHeight: 24,
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
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(245, 101, 101, 0.3)',
    borderRadius: radius.medium,
  },
  confirmButtonText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.priority.high,
  },
});

