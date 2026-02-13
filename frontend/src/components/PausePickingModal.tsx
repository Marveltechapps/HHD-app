import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { PrimaryButton } from './design-system';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../design-system/tokens';

interface PausePickingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function PausePickingModal({
  visible,
  onClose,
  onConfirm,
}: PausePickingModalProps) {
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
          <Text style={styles.title}>⏸️ Pause Picking</Text>
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
          <Text style={styles.description}>
            Are you sure you want to pause the current picking session? Your
            progress will be saved and you can resume later.
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
          <PrimaryButton
            title="PAUSE"
            onPress={handleConfirm}
            style={styles.confirmButton}
          />
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
    color: colors.text.primary,
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
  },
});

