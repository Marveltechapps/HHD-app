import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} from '../design-system/tokens';

interface OrderDetailsModalProps {
  visible: boolean;
  orderId?: string;
  itemCount?: number;
  zone?: string;
  onClose: () => void;
}

export default function OrderDetailsModal({
  visible,
  orderId = 'ORD-45621',
  itemCount = 18,
  zone = 'Zone B',
  onClose,
}: OrderDetailsModalProps) {
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
          <Text style={styles.title}>📋 Order Details</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{orderId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Items:</Text>
              <Text style={styles.detailValue}>{itemCount} items</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Zone:</Text>
              <Text style={styles.detailValue}>{zone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority:</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>HIGH</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Target Time:</Text>
              <Text style={styles.detailValue}>55 seconds</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Zone:</Text>
              <Text style={[styles.detailValue, { color: colors.success }]}>
                Sector 3 (1.2km)
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>#C-89234</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.closeButtonFooter}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonFooterText}>CLOSE</Text>
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
    maxHeight: '90%',
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
  scrollContent: {
    maxHeight: 400,
  },
  content: {
    gap: spacing.m,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.background,
    borderRadius: radius.medium,
  },
  detailLabel: {
    ...typography.b1,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.b1,
    fontWeight: '700',
    color: colors.text.primary,
  },
  priorityBadge: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 101, 101, 0.3)',
    borderRadius: radius.medium,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priorityText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.priority.high,
  },
  footer: {
    paddingTop: spacing.m,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  closeButtonFooter: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.medium,
  },
  closeButtonFooterText: {
    ...typography.c1,
    fontWeight: '700',
    color: colors.text.primary,
  },
});

