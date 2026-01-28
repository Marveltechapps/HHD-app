import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, radius, spacing, layout } from '../../design-system/tokens';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
}

export default function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  disabled = false,
  keyboardType = 'default',
  maxLength,
  style,
  inputStyle,
  autoCapitalize = 'none',
  autoFocus = false,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          editable={!disabled}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.s, // 8px between label and input
  },
  label: {
    ...typography.b2,
    color: colors.text.primary,
  },
  labelError: {
    color: colors.error,
  },
  inputWrapper: {
    height: layout.inputHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.m,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.6,
  },
  input: {
    ...typography.b2,
    color: colors.text.primary,
    padding: 0,
    flex: 1,
  },
  errorText: {
    ...typography.c2,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

