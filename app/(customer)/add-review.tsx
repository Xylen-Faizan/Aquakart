import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { commonStyles, colors, spacing, typography } from '@/src/design-system';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';

export default function AddReviewScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    
    getUser();
  }, []);
  // We'll pass order_id and vendor_id as params from the order history page
  const { order_id, vendor_id, vendor_name } = useLocalSearchParams<{
    order_id: string;
    vendor_id: string;
    vendor_name: string;
  }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (!user || !order_id || !vendor_id) {
      Alert.alert('Error', 'Missing required information to submit a review.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        order_id,
        vendor_id,
        rating,
        comment: comment.trim(),
      });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Your review has been submitted. Thank you!');
      // Navigate back to the order history or home screen
      router.back();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Could not submit your review.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Leave a Review</Text>
        <Text style={styles.vendorName}>
          How was your experience with {vendor_name || 'the vendor'}?
        </Text>

        <View style={styles.ratingContainer}>
          <StarRating rating={rating} onStarPress={setRating} starSize={40} />
        </View>

        <Text style={styles.label}>Add a comment (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us more about your experience..."
          multiline
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
          placeholderTextColor={colors.textTertiary}
        />

        <Button
          title={isLoading ? 'Submitting...' : 'Submit Review'}
          onPress={handleSubmitReview}
          disabled={isLoading}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    backgroundColor: colors.surfaceSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...commonStyles.text.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  vendorName: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    ...commonStyles.text.body,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    ...commonStyles.input,
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
});
