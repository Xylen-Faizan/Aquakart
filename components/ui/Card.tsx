import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '@/src/design-system';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...getPaddingStyle(),
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.lg,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          ...baseStyle,
          ...shadows.md,
        };
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: spacing.sm };
      case 'large':
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
}); 