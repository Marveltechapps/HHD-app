import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../../design-system/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  gap?: keyof typeof spacing;
}

export default function Card({
  children,
  style,
  padding = 'l', // 20px default
  gap = 'sm', // 12px default
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          padding: spacing[padding],
          gap: spacing[gap],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    ...shadows.card,
  },
});

