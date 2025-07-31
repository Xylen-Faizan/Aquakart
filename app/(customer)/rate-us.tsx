import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Send, Heart, ThumbsUp } from 'lucide-react-native';

export default function RateUs() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: 'delivery', label: 'Delivery Speed', icon: '🚚' },
    { id: 'quality', label: 'Water Quality', icon: '💧' },
    { id: 'service', label: 'Customer Service', icon: '🎧' },
    { id: 'app', label: 'App Experience', icon: '📱' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'overall', label: 'Overall Experience', icon: '⭐' },
  ];

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    if (!category) {
      Alert.alert('Category Required', 'Please select a category for your feedback');
      return;
    }

    setSubmitting(true);
    try {
      // In real app, submit to backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input!',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity
        key={index}
        style={styles.starButton}
        onPress={() => setRating(index + 1)}
      >
        <Star
          size={40}
          color={index < rating ? '#F59E0B' : '#E5E7EB'}
          fill={index < rating ? '#F59E0B' : 'transparent'}
        />
      </TouchableOpacity>
    ));
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap to rate';
    }
  };

  const getRatingColor = () => {
    if (rating <= 2) return '#EF4444';
    if (rating <= 3) return '#F59E0B';
    return '#059669';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Rate Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Heart size={48} color="#EC4899" />
          <Text style={styles.heroTitle}>We'd Love Your Feedback!</Text>
          <Text style={styles.heroSubtitle}>
            Your opinion helps us improve our service and deliver better experiences
          </Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>How would you rate AquaFlow?</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          <Text style={[styles.ratingText, { color: getRatingColor() }]}>
            {getRatingText()}
          </Text>
        </View>

        {/* Category Selection */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>What would you like to rate?</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.id && styles.categoryCardSelected
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  category === cat.id && styles.categoryLabelSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Tell us more (Optional)</Text>
          <TextInput
            style={styles.feedbackInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Share your thoughts, suggestions, or any issues you faced..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Send size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Alternative Actions */}
        <View style={styles.alternativeActions}>
          <Text style={styles.alternativeTitle}>Other Ways to Help</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <ThumbsUp size={24} color="#2563EB" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Rate on App Store</Text>
              <Text style={styles.actionDescription}>Help others discover AquaFlow</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Heart size={24} color="#EC4899" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Follow Us on Social Media</Text>
              <Text style={styles.actionDescription}>Stay updated with latest features</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Thank You Note */}
        <View style={styles.thankYouSection}>
          <Text style={styles.thankYouText}>
            Thank you for being a valued customer! Your feedback helps us serve you better.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  ratingSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  categorySection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    backgroundColor: '#EBF4FF',
    borderColor: '#2563EB',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#2563EB',
  },
  feedbackSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  feedbackInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  alternativeActions: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alternativeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 12,
    gap: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  thankYouSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thankYouText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});