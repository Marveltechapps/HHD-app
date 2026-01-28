/**
 * Design System Tokens
 * 8pt grid scale, React Native-ready
 * For seamless Figma → React Native code generation
 */

export const spacing = {
  xxs: 2, // For very small spacing (2px)
  xs: 4,
  s: 8,
  sm: 12,
  m: 16,
  l: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const colors = {
  primary: '#6B46C1',
  success: '#48BB78',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  border: '#E2E8F0',
  borderLight: '#E0E0E0',
  grayLight: '#E8E8E8',
  grayMedium: '#E0E0E0',
  white: '#FFFFFF',
  // Category colors
  category: {
    fresh: '#48BB78',
    snacks: '#F59E0B',
    grocery: '#6B46C1',
    care: '#3B82F6',
  },
  // Priority colors
  priority: {
    high: '#F56565',
  },
} as const;

// Helper functions for colors with opacity
export const colorWithOpacity = {
  success: (opacity: number) => `rgba(72, 187, 120, ${opacity})`,
  primary: (opacity: number) => `rgba(107, 70, 193, ${opacity})`,
  error: (opacity: number) => `rgba(245, 101, 101, ${opacity})`,
  warning: (opacity: number) => `rgba(245, 158, 11, ${opacity})`,
  info: (opacity: number) => `rgba(59, 130, 246, ${opacity})`,
  white: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
  black: (opacity: number) => `rgba(0, 0, 0, ${opacity})`,
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    fontFamily: 'Arial', // Fallback, use Inter if available
  },
  h2: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '700' as const,
    fontFamily: 'Arial',
  },
  h3: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '600' as const,
    fontFamily: 'Arial',
  },
  h4: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600' as const,
    fontFamily: 'Arial',
  },
  b1: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  b2: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  c1: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    fontFamily: 'Arial',
  },
  c2: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  // Additional typography sizes from Figma
  bodyLarge: {
    fontSize: 17.5,
    lineHeight: 24.5, // 1.4em
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  bodyMedium: {
    fontSize: 15.75,
    lineHeight: 24.5, // 1.555em
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  bodySmall: {
    fontSize: 12.25,
    lineHeight: 17.5, // 1.428em
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  bodyTiny: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  headingSection: {
    fontSize: 21,
    lineHeight: 28, // 1.333em
    fontWeight: '700' as const,
    fontFamily: 'Arial',
  },
  // Additional sizes for specific use cases
  c3: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  c4: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '400' as const,
    fontFamily: 'Arial',
  },
  h5: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: 'Arial',
  },
} as const;

export const radius = {
  small: 8,
  medium: 12,
  large: 24,
} as const;

export const shadows = {
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 4,
  },
  button: {
    shadowColor: 'rgba(107, 70, 193, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const iconSize = {
  small: 16,
  medium: 24,
  large: 32,
} as const;

export const iconStroke = {
  default: 2,
  thin: 1.5,
  thick: 2.5,
} as const;

// Layout constants
export const layout = {
  statusBarHeight: 64,
  bottomNavHeight: 80,
  buttonHeight: 56,
  inputHeight: 56,
  cardPadding: spacing.l, // 20px
  cardGap: spacing.sm, // 12px
  screenPadding: spacing.m, // 16px
  sectionGap: spacing['2xl'], // 32px
} as const;

// Mobile specs
export const screen = {
  width: 390,
  height: 844,
} as const;

