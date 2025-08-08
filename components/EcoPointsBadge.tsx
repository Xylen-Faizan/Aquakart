import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/src/design-system';
import { supabase } from '@/lib/supabase';
import EcoPointsService from '@/src/services/eco-points';

interface EcoPointsBadgeProps {
  userId?: string;
  onPress?: () => void;
  showPoints?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function EcoPointsBadge({ 
  userId, 
  onPress, 
  showPoints = true, 
  size = 'medium' 
}: EcoPointsBadgeProps) {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadEcoPoints();
    }
  }, [userId]);

  const loadEcoPoints = async () => {
    try {
      setLoading(true);
      const stats = await EcoPointsService.getUserEcoStats(userId!);
      setPoints(stats.totalPoints);
    } catch (error) {
      console.error('Error loading eco points:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
          icon: 16,
          text: typography.fontSize.xs,
        };
      case 'large':
        return {
          container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
          icon: 24,
          text: typography.fontSize.base,
        };
      default:
        return {
          container: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
          icon: 20,
          text: typography.fontSize.sm,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (loading) {
    return (
      <View style={[styles.container, sizeStyles.container, styles.loading]}>
        <Leaf size={sizeStyles.icon} color={colors.success} />
        {showPoints && (
          <Text style={[styles.pointsText, { fontSize: sizeStyles.text }]}>...</Text>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, sizeStyles.container]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <Leaf size={sizeStyles.icon} color={colors.success} />
      {showPoints && (
        <Text style={[styles.pointsText, { fontSize: sizeStyles.text }]}>
          {points.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  loading: {
    opacity: 0.7,
  },
  pointsText: {
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
    fontFamily: typography.fontFamily.semibold,
  },
}); 