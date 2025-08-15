// Colors
export const colors = {
  // Primary
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E64A4A',
  
  // Secondary
  secondary: '#4ECDC4',
  secondaryLight: '#7FFFD4',
  secondaryDark: '#3D9E96',
  
  // Background & Surface
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  surfaceTertiary: '#E9ECEF',
  
  // Text
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#212529',
  
  // Status
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Other
  border: '#DEE2E6',
  divider: '#E9ECEF',
  disabled: '#E9ECEF',
  white: '#FFFFFF',
  black: '#000000',
};

// Spacing
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
};

// Border Radius
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Re-export other design system modules
export * from './typography';
export * from './common-styles';
