/**
 * Mobile Number Validation - Usage Examples
 * 
 * This file demonstrates how to use the mobile validation utility
 * in different scenarios with React Native components.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  validateMobileNumber,
  isMobileInputAllowed,
  cleanMobileNumber,
  formatMobileNumber,
  MOBILE_RULES,
  MOBILE_REGEX,
  MOBILE_ERRORS,
  type MobileValidationOptions,
} from './mobileValidation';

// ============================================================================
// EXAMPLE 1: Basic Validation (India - Default)
// ============================================================================

export function BasicMobileInput() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleChange = (text: string) => {
    if (isMobileInputAllowed(text, mobile)) {
      const cleaned = cleanMobileNumber(text);
      setMobile(cleaned);
      
      // Validate on change
      const validation = validateMobileNumber(cleaned, { country: 'IN' });
      setError(validation.error);
    }
  };

  const validation = validateMobileNumber(mobile, { country: 'IN' });

  return (
    <View>
      <TextInput
        value={mobile}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="Enter mobile number"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {validation.isValid && <Text style={styles.success}>✓ Valid</Text>}
    </View>
  );
}

// ============================================================================
// EXAMPLE 2: Validation with Different Countries
// ============================================================================

export function MultiCountryMobileInput() {
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState<'IN' | 'US' | 'UK'>('IN');

  const options: MobileValidationOptions = { country };
  const validation = validateMobileNumber(mobile, options);

  return (
    <View>
      {/* Country selector would go here */}
      <TextInput
        value={mobile}
        onChangeText={(text) => {
          const cleaned = cleanMobileNumber(text);
          setMobile(cleaned);
        }}
        keyboardType="phone-pad"
        placeholder={`Enter ${MOBILE_RULES[country].description}`}
      />
      {validation.error && <Text>{validation.error}</Text>}
    </View>
  );
}

// ============================================================================
// EXAMPLE 3: Formatted Display (with spaces/dashes)
// ============================================================================

export function FormattedMobileInput() {
  const [mobile, setMobile] = useState('');
  const [displayFormat, setDisplayFormat] = useState<'spaced' | 'dashed' | 'none'>('none');

  const handleChange = (text: string) => {
    const cleaned = cleanMobileNumber(text);
    setMobile(cleaned);
  };

  const formatted = formatMobileNumber(mobile, displayFormat);
  const validation = validateMobileNumber(mobile, { country: 'IN' });

  return (
    <View>
      <TextInput
        value={formatted}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        placeholder="98765 43210"
      />
      <Text>Raw: {mobile}</Text>
      <Text>Formatted: {formatted}</Text>
      {validation.error && <Text>{validation.error}</Text>}
    </View>
  );
}

// ============================================================================
// EXAMPLE 4: Real-time Validation with Debouncing
// ============================================================================

export function DebouncedMobileInput() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (text: string) => {
    if (isMobileInputAllowed(text, mobile)) {
      const cleaned = cleanMobileNumber(text);
      setMobile(cleaned);
      
      // Clear error immediately if user is typing
      if (error && cleaned.length > 0) {
        setError(undefined);
      }
      
      // Validate only if length is 10 (complete)
      if (cleaned.length === 10) {
        setIsValidating(true);
        // Simulate async validation (e.g., checking if number exists)
        setTimeout(() => {
          const validation = validateMobileNumber(cleaned, { country: 'IN' });
          setError(validation.error);
          setIsValidating(false);
        }, 300);
      } else if (cleaned.length < 10) {
        setError(undefined);
        setIsValidating(false);
      }
    }
  };

  return (
    <View>
      <TextInput
        value={mobile}
        onChangeText={handleChange}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="Enter mobile number"
      />
      {isValidating && <Text>Validating...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// ============================================================================
// EXAMPLE 5: Using Regex Directly
// ============================================================================

export function RegexExample() {
  const [mobile, setMobile] = useState('');

  // Direct regex validation
  const isValid = MOBILE_REGEX.IN_STRICT.test(mobile);

  return (
    <View>
      <TextInput
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Text>
        {isValid ? 'Valid Indian mobile' : 'Invalid format'}
      </Text>
    </View>
  );
}

// ============================================================================
// VALIDATION RULES SUMMARY
// ============================================================================

/**
 * INDIAN MOBILE NUMBER RULES:
 * - Length: Exactly 10 digits
 * - Starting digits: Must start with 6, 7, 8, or 9
 * - Format: Only digits, no spaces, dashes, or special characters
 * - Unique digits: All 10 digits cannot be the same
 * - Regex: /^[6-9]\d{9}$/
 * 
 * Examples:
 * ✅ Valid: 9876543210, 8765432109, 7654321098, 6543210987
 * ❌ Invalid: 1234567890 (starts with 1), 0123456789 (starts with 0),
 *             987654321 (9 digits), 98765432101 (11 digits),
 *             9999999999 (all digits same), 1111111111 (all digits same)
 */

// ============================================================================
// REGEX PATTERNS AVAILABLE
// ============================================================================

/**
 * MOBILE_REGEX.IN_STRICT: /^[6-9]\d{9}$/
 *   - Strict validation for Indian mobile numbers
 *   - 10 digits starting with 6-9
 * 
 * MOBILE_REGEX.GENERIC_STRICT: /^\d{10}$/
 *   - Generic 10-digit validation
 *   - Any 10 digits
 * 
 * MOBILE_REGEX.DIGITS_ONLY: /^\d+$/
 *   - Check if string contains only digits
 *   - Used for cleaning input
 */

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * MOBILE_ERRORS.EMPTY: "Mobile number is required"
 * MOBILE_ERRORS.TOO_SHORT: "Mobile number must be 10 digits"
 * MOBILE_ERRORS.TOO_LONG: "Mobile number cannot exceed 10 digits"
 * MOBILE_ERRORS.INVALID_START: "Mobile number must start with 6, 7, 8, or 9"
 * MOBILE_ERRORS.INVALID_FORMAT: "Mobile number must contain only digits"
 * MOBILE_ERRORS.INVALID_LENGTH: "Mobile number must be exactly 10 digits"
 * MOBILE_ERRORS.INVALID_PATTERN: "Please enter a valid mobile number"
 * MOBILE_ERRORS.ALL_SAME_DIGITS: "Mobile number cannot have all digits the same"
 */

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  success: {
    color: 'green',
    fontSize: 12,
    marginTop: 4,
  },
});
