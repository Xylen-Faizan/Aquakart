import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/src/design-system';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  starSize?: number;
  onStarPress?: (rating: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  starSize = 24,
  onStarPress,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starNumber = index + 1;
        const isSelected = starNumber <= rating;

        return (
          <TouchableOpacity
            key={starNumber}
            disabled={disabled || !onStarPress}
            onPress={() => onStarPress && onStarPress(starNumber)}
          >
            <Star
              size={starSize}
              color={isSelected ? colors.warning : colors.gray300}
              fill={isSelected ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default StarRating;
