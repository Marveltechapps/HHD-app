/**
 * Mobile Number Validation Utility
 * Supports Indian mobile numbers (10 digits, starting with 6-9)
 */

export interface MobileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface MobileValidationOptions {
  country?: 'IN' | 'US' | 'UK' | 'GENERIC';
  allowSpaces?: boolean;
  allowDashes?: boolean;
  allowPlus?: boolean;
}

/**
 * Mobile number validation rules by country
 */
export const MOBILE_RULES = {
  IN: {
    length: 10,
    startsWith: [6, 7, 8, 9],
    regex: /^[6-9]\d{9}$/,
    description: '10 digits starting with 6, 7, 8, or 9',
  },
  US: {
    length: 10,
    startsWith: null,
    regex: /^\d{10}$/,
    description: '10 digits',
  },
  UK: {
    length: 10,
    startsWith: null,
    regex: /^[1-9]\d{9}$/,
    description: '10 digits, cannot start with 0',
  },
  GENERIC: {
    length: 10,
    startsWith: null,
    regex: /^\d{10}$/,
    description: '10 digits',
  },
} as const;

/**
 * Regex patterns for different formats
 */
export const MOBILE_REGEX = {
  // Indian mobile: 10 digits starting with 6-9
  IN_STRICT: /^[6-9]\d{9}$/,
  
  // Indian mobile: allows spaces/dashes (cleaned before validation)
  IN_FORMATTED: /^[6-9][\d\s-]{8,9}\d$/,
  
  // Generic: 10 digits only
  GENERIC_STRICT: /^\d{10}$/,
  
  // Generic: allows spaces/dashes
  GENERIC_FORMATTED: /^[\d\s-]{10,14}$/,
  
  // Digits only (for cleaning)
  DIGITS_ONLY: /^\d+$/,
} as const;

/**
 * Error messages for validation failures
 */
export const MOBILE_ERRORS = {
  EMPTY: 'Mobile number is required',
  TOO_SHORT: 'Mobile number must be 10 digits',
  TOO_LONG: 'Mobile number cannot exceed 10 digits',
  INVALID_START: 'Mobile number must start with 6, 7, 8, or 9',
  INVALID_FORMAT: 'Mobile number must contain only digits',
  INVALID_LENGTH: 'Mobile number must be exactly 10 digits',
  INVALID_PATTERN: 'Please enter a valid mobile number',
  ALL_SAME_DIGITS: 'Mobile number cannot have all digits the same',
} as const;

/**
 * Check if all digits in the mobile number are the same
 */
export function areAllDigitsSame(mobile: string): boolean {
  if (mobile.length === 0) return false;
  const firstDigit = mobile[0];
  return mobile.split('').every(digit => digit === firstDigit);
}

/**
 * Clean mobile number by removing spaces, dashes, and plus signs
 */
export function cleanMobileNumber(
  mobile: string,
  options: MobileValidationOptions = {}
): string {
  let cleaned = mobile.trim();
  
  // Remove spaces if not allowed
  if (!options.allowSpaces) {
    cleaned = cleaned.replace(/\s/g, '');
  }
  
  // Remove dashes if not allowed
  if (!options.allowDashes) {
    cleaned = cleaned.replace(/-/g, '');
  }
  
  // Remove plus sign and country code if present
  if (!options.allowPlus) {
    cleaned = cleaned.replace(/^\+91\s?/, ''); // Remove +91 (India)
    cleaned = cleaned.replace(/^\+1\s?/, ''); // Remove +1 (US)
    cleaned = cleaned.replace(/^\+44\s?/, ''); // Remove +44 (UK)
    cleaned = cleaned.replace(/^\+\d{1,3}\s?/, ''); // Remove any country code
  }
  
  return cleaned;
}

/**
 * Validate mobile number based on country rules
 */
export function validateMobileNumber(
  mobile: string,
  options: MobileValidationOptions = { country: 'IN' }
): MobileValidationResult {
  const country = options.country || 'IN';
  const rules = MOBILE_RULES[country];
  
  // Clean the mobile number
  const cleaned = cleanMobileNumber(mobile, options);
  
  // Check if empty
  if (!cleaned || cleaned.length === 0) {
    return {
      isValid: false,
      error: MOBILE_ERRORS.EMPTY,
    };
  }
  
  // Check if contains only digits
  if (!MOBILE_REGEX.DIGITS_ONLY.test(cleaned)) {
    return {
      isValid: false,
      error: MOBILE_ERRORS.INVALID_FORMAT,
    };
  }
  
  // Check length
  if (cleaned.length < rules.length) {
    return {
      isValid: false,
      error: MOBILE_ERRORS.TOO_SHORT,
    };
  }
  
  if (cleaned.length > rules.length) {
    return {
      isValid: false,
      error: MOBILE_ERRORS.TOO_LONG,
    };
  }
  
  // Check starting digit (for India)
  if (country === 'IN' && rules.startsWith) {
    const firstDigit = parseInt(cleaned[0], 10);
    if (!rules.startsWith.includes(firstDigit)) {
      return {
        isValid: false,
        error: MOBILE_ERRORS.INVALID_START,
      };
    }
  }
  
  // Final regex validation
  if (!rules.regex.test(cleaned)) {
    return {
      isValid: false,
      error: MOBILE_ERRORS.INVALID_PATTERN,
    };
  }
  
  // Check if all digits are the same (e.g., 9999999999, 1111111111)
  if (areAllDigitsSame(cleaned)) {
    return {
      isValid: false,
      error: MOBILE_ERRORS.ALL_SAME_DIGITS,
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Format mobile number for display (e.g., 9876543210 -> 98765 43210)
 */
export function formatMobileNumber(
  mobile: string,
  format: 'spaced' | 'dashed' | 'none' = 'none'
): string {
  const cleaned = cleanMobileNumber(mobile);
  
  if (format === 'spaced' && cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  if (format === 'dashed' && cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return cleaned;
}

/**
 * Check if mobile number input should be allowed (for real-time validation)
 */
export function isMobileInputAllowed(
  text: string,
  previousText: string = ''
): boolean {
  // Allow backspace/delete
  if (text.length < previousText.length) {
    return true;
  }
  
  // Only allow digits
  const lastChar = text[text.length - 1];
  if (lastChar && !/^\d$/.test(lastChar)) {
    return false;
  }
  
  // Limit to 10 digits
  const cleaned = cleanMobileNumber(text);
  if (cleaned.length > 10) {
    return false;
  }
  
  return true;
}
