import { StyleSheet } from 'react-native';

const fontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

const fontSize = {
  // Base sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  // Component-specific sizes
  h1: 40,
  h2: 32,
  h3: 28,
  h4: 24,
  h5: 20,
  h6: 18,
  subtitle1: 16,
  subtitle2: 14,
  button: 14,
  caption: 12,
  overline: 10,
};

const lineHeight = {
  // Base line heights
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 48,
  // Component-specific line heights
  h1: 48,
  h2: 40,
  h3: 36,
  h4: 32,
  h5: 28,
  h6: 24,
  subtitle1: 24,
  subtitle2: 20,
  button: 20,
  caption: 16,
  overline: 12,
};

const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Typography styles
export const typography = StyleSheet.create({
  // Text styles
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    color: '#212529',
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: '#6C757D',
  },
  
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
    color: '#212529',
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
    color: '#212529',
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
    color: '#212529',
  },
  h4: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
    color: '#212529',
  },
  h5: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.h5,
    lineHeight: lineHeight.h5,
    color: '#212529',
  },
  h6: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.h6,
    lineHeight: lineHeight.h6,
    color: '#212529',
  },
  heading4: { // Alias for h4 for backward compatibility
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
    color: '#212529',
  },
  
  // Subtitles
  subtitle1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.subtitle1,
    lineHeight: lineHeight.subtitle1,
    color: '#6C757D',
  },
  subtitle2: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.subtitle2,
    lineHeight: lineHeight.subtitle2,
    color: '#6C757D',
  },
  
  // Buttons
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.button,
    lineHeight: lineHeight.button,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  
  // Caption
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  
  // Overline
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.overline,
    lineHeight: lineHeight.overline,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
});

// Export font family and size constants for reference
export { fontFamily, fontSize, lineHeight, fontWeight };
