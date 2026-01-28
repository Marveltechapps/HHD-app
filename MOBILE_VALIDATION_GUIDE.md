# Mobile Number Validation Guide

Complete guide for mobile number validation in the HHD app.

## 📋 Table of Contents

1. [Validation Rules](#validation-rules)
2. [Regex Patterns](#regex-patterns)
3. [Usage Examples](#usage-examples)
4. [Error Messages](#error-messages)
5. [Best Practices](#best-practices)

---

## 1. Validation Rules

### Indian Mobile Numbers (Default)

- **Length**: Exactly 10 digits
- **Starting Digits**: Must start with 6, 7, 8, or 9
- **Format**: Only digits (no spaces, dashes, or special characters)
- **Unique Digits**: All 10 digits cannot be the same
- **Regex**: `/^[6-9]\d{9}$/`

**Valid Examples:**
- ✅ `9876543210`
- ✅ `8765432109`
- ✅ `7654321098`
- ✅ `6543210987`

**Invalid Examples:**
- ❌ `1234567890` (starts with 1)
- ❌ `0123456789` (starts with 0)
- ❌ `987654321` (only 9 digits)
- ❌ `98765432101` (11 digits)
- ❌ `98765 43210` (contains space)
- ❌ `98765-43210` (contains dash)
- ❌ `9999999999` (all digits are the same)
- ❌ `1111111111` (all digits are the same)
- ❌ `6666666666` (all digits are the same)
- ❌ `9999999999` (all digits are the same)
- ❌ `1111111111` (all digits are the same)
- ❌ `6666666666` (all digits are the same)

### Other Countries

The utility supports:
- **US**: 10 digits, any starting digit
- **UK**: 10 digits, cannot start with 0
- **GENERIC**: 10 digits, any format

---

## 2. Regex Patterns

### Available Patterns

```typescript
// Indian mobile: Strict validation
MOBILE_REGEX.IN_STRICT: /^[6-9]\d{9}$/

// Indian mobile: Allows spaces/dashes (for display)
MOBILE_REGEX.IN_FORMATTED: /^[6-9][\d\s-]{8,9}\d$/

// Generic: 10 digits only
MOBILE_REGEX.GENERIC_STRICT: /^\d{10}$/

// Generic: Allows spaces/dashes
MOBILE_REGEX.GENERIC_FORMATTED: /^[\d\s-]{10,14}$/

// Digits only (for cleaning)
MOBILE_REGEX.DIGITS_ONLY: /^\d+$/
```

### Quick Reference

| Pattern | Use Case | Example |
|---------|----------|---------|
| `IN_STRICT` | Final validation | `9876543210` ✅ |
| `GENERIC_STRICT` | Generic 10-digit | `1234567890` ✅ |
| `DIGITS_ONLY` | Input cleaning | Remove non-digits |

---

## 3. Usage Examples

### Basic Usage

```typescript
import { validateMobileNumber, cleanMobileNumber } from '../utils/mobileValidation';

const mobile = '9876543210';
const validation = validateMobileNumber(mobile, { country: 'IN' });

if (validation.isValid) {
  console.log('Valid mobile number');
} else {
  console.error(validation.error);
}
```

### In React Native Component

```typescript
import React, { useState } from 'react';
import { TextInput, Text, View } from 'react-native';
import {
  validateMobileNumber,
  isMobileInputAllowed,
  cleanMobileNumber,
} from '../utils/mobileValidation';

function MobileInput() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleChange = (text: string) => {
    // Only allow valid input
    if (isMobileInputAllowed(text, mobile)) {
      const cleaned = cleanMobileNumber(text);
      setMobile(cleaned);
      
      // Validate
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
        placeholder="Enter 10-digit mobile"
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

### With Formatting

```typescript
import { formatMobileNumber } from '../utils/mobileValidation';

const mobile = '9876543210';
const spaced = formatMobileNumber(mobile, 'spaced'); // "98765 43210"
const dashed = formatMobileNumber(mobile, 'dashed'); // "98765-43210"
```

---

## 4. Error Messages

All error messages are available as constants:

```typescript
import { MOBILE_ERRORS } from '../utils/mobileValidation';

MOBILE_ERRORS.EMPTY              // "Mobile number is required"
MOBILE_ERRORS.TOO_SHORT          // "Mobile number must be 10 digits"
MOBILE_ERRORS.TOO_LONG           // "Mobile number cannot exceed 10 digits"
MOBILE_ERRORS.INVALID_START      // "Mobile number must start with 6, 7, 8, or 9"
MOBILE_ERRORS.INVALID_FORMAT     // "Mobile number must contain only digits"
MOBILE_ERRORS.INVALID_LENGTH     // "Mobile number must be exactly 10 digits"
MOBILE_ERRORS.INVALID_PATTERN    // "Please enter a valid mobile number"
MOBILE_ERRORS.ALL_SAME_DIGITS    // "Mobile number cannot have all digits the same"
```

### Error Display Best Practices

1. **Show errors after blur** (not while typing)
2. **Clear errors when user starts typing again**
3. **Use consistent error styling** (red text, small font)
4. **Position errors below the input field**

---

## 5. Best Practices

### ✅ DO

1. **Use `keyboardType="phone-pad"`** for mobile inputs
   ```tsx
   <TextInput keyboardType="phone-pad" />
   ```

2. **Set `maxLength={10}`** to prevent over-typing
   ```tsx
   <TextInput maxLength={10} />
   ```

3. **Filter input in real-time** using `isMobileInputAllowed()`
   ```typescript
   const handleChange = (text: string) => {
     if (isMobileInputAllowed(text, previousText)) {
       setMobile(text);
     }
   };
   ```

4. **Clean input before validation** using `cleanMobileNumber()`
   ```typescript
   const cleaned = cleanMobileNumber(mobile);
   const validation = validateMobileNumber(cleaned);
   ```

5. **Show errors after user interaction** (on blur, not on change)
   ```typescript
   const [touched, setTouched] = useState(false);
   
   const handleBlur = () => {
     setTouched(true);
     // Show validation error
   };
   ```

6. **Disable submit button** until valid
   ```tsx
   <Button disabled={!validation.isValid} />
   ```

7. **Provide clear placeholder text**
   ```tsx
   <TextInput placeholder="Enter 10-digit mobile" />
   ```

### ❌ DON'T

1. **Don't validate on every keystroke** (only on blur or submit)
2. **Don't allow non-digit characters** (filter them out)
3. **Don't show errors immediately** (wait for user to finish typing)
4. **Don't accept country codes** in the input (handle separately)
5. **Don't use generic error messages** (be specific)

### UX Recommendations

1. **Visual Feedback**
   - ✅ Green checkmark when valid
   - ❌ Red border/text when invalid
   - 🔄 Loading indicator during async validation

2. **Input Behavior**
   - Auto-format while typing (optional)
   - Auto-focus next field when complete
   - Clear formatting on paste

3. **Error Handling**
   - Show errors below input
   - Use consistent error styling
   - Clear errors when user corrects input

4. **Accessibility**
   - Add `accessibilityLabel` for screen readers
   - Use proper `accessibilityHint`
   - Ensure error messages are announced

### Example: Complete Implementation

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  validateMobileNumber,
  isMobileInputAllowed,
  cleanMobileNumber,
} from '../utils/mobileValidation';

export function MobileInputField() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleChange = (text: string) => {
    if (isMobileInputAllowed(text, mobile)) {
      const cleaned = cleanMobileNumber(text);
      setMobile(cleaned);
      
      // Clear error if user is correcting
      if (error && cleaned.length > 0) {
        const validation = validateMobileNumber(cleaned, { country: 'IN' });
        if (validation.isValid || cleaned.length < mobile.length) {
          setError(undefined);
        }
      }
      
      // Show error only after user has interacted
      if (touched && cleaned.length === 10) {
        const validation = validateMobileNumber(cleaned, { country: 'IN' });
        setError(validation.error);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validation = validateMobileNumber(mobile, { country: 'IN' });
    setError(validation.error);
  };

  const validation = validateMobileNumber(mobile, { country: 'IN' });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={mobile}
        onChangeText={handleChange}
        onBlur={handleBlur}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="Enter 10-digit mobile"
        accessibilityLabel="Mobile number input"
        accessibilityHint="Enter your 10-digit mobile number starting with 6, 7, 8, or 9"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {validation.isValid && !error && (
        <Text style={styles.success}>✓ Valid mobile number</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
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
```

---

## 📚 API Reference

### Functions

#### `validateMobileNumber(mobile, options?)`
Validates mobile number and returns result with error message.

**Parameters:**
- `mobile` (string): Mobile number to validate
- `options` (object, optional):
  - `country` ('IN' | 'US' | 'UK' | 'GENERIC'): Country code
  - `allowSpaces` (boolean): Allow spaces in input
  - `allowDashes` (boolean): Allow dashes in input
  - `allowPlus` (boolean): Allow plus sign and country code

**Returns:**
```typescript
{
  isValid: boolean;
  error?: string;
}
```

#### `cleanMobileNumber(mobile, options?)`
Removes spaces, dashes, and country codes from mobile number.

#### `formatMobileNumber(mobile, format?)`
Formats mobile number for display (spaced or dashed).

#### `isMobileInputAllowed(text, previousText?)`
Checks if input should be allowed (for real-time filtering).

---

## 🔗 Related Files

- `src/utils/mobileValidation.ts` - Main validation utility
- `src/utils/mobileValidation.example.tsx` - Usage examples
- `src/components/LoginScreen.tsx` - Implementation example
- `src/components/design-system/TextField.tsx` - TextField component

---

## 📝 Notes

- Default country is `'IN'` (India)
- All validation is case-insensitive
- Input is automatically cleaned before validation
- Country codes are automatically removed if present
