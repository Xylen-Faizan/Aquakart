import { Platform } from 'react-native';

// Color Palette - Aqua Blue Theme
export const colors = {
  // Primary Colors
  primary: '#00bfff', // Main aqua blue
  primaryLight: '#4dd2ff',
  primaryDark: '#0099cc',
  primaryGradient: ['#00bfff', '#0099cc'],
  
  // Secondary Colors
  secondary: '#20b2aa', // Teal accent
  secondaryLight: '#48cae4',
  secondaryDark: '#1e8a8a',
  
  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Status Colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  
  // Background Colors
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',
  
  // Text Colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textInverse: '#ffffff',
  
  // Border Colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  // Shadow Colors
  shadow: 'rgba(0, 191, 255, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.1)',
};

// Typography
export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'SF Pro Display-Medium',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'SF Pro Display-Semibold',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'SF Pro Display-Bold',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as const,
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  } as const,
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  } as const,
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  } as const,
};

// Layout
export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  buttonPadding: spacing.md,
  inputPadding: spacing.md,
};

// Animation
export const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Common Styles
export const commonStyles = {
  // Card Styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    ...shadows.md,
  },
  
  cardHover: {
    ...shadows.lg,
    transform: [{ scale: 1.02 }],
  },
  
  // Button Styles
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...shadows.sm,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  },
  
  // Input Styles
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    ...shadows.sm,
  },
  
  // Text Styles
  text: {
    h1: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
    },
    h2: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.bold,
    },
    h3: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.semibold,
    },
    h4: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.semibold,
    },
    body: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      color: colors.textPrimary,
      fontFamily: typography.fontFamily.regular,
    },
    bodySmall: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
      color: colors.textSecondary,
      fontFamily: typography.fontFamily.regular,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.normal,
      color: colors.textTertiary,
      fontFamily: typography.fontFamily.regular,
    },
  },
  
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  
  // Section Styles
  section: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  
  // Grid Styles
  grid: {
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    column: {
      flexDirection: 'column' as const,
    },
    center: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    spaceBetween: {
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
  },
};

// Status Colors for Orders
export const orderStatusColors = {
  pending: colors.warning,
  accepted: colors.info,
  preparing: colors.secondary,
  outForDelivery: colors.primary,
  delivered: colors.success,
  cancelled: colors.error,
};

// Rating Colors
export const ratingColors = {
  excellent: colors.success,
  good: colors.info,
  average: colors.warning,
  poor: colors.error,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  commonStyles,
  orderStatusColors,
  ratingColors,
}; 