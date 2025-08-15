import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  LogOut,
  ChevronRight,
  MapPin,
  Heart,
  CreditCard,
  Star,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react-native';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, commonStyles } from '@/src/design-system';

// Define the Profile type based on the customers table
interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Define the User type for auth
interface AuthUser {
  id: string;
  email?: string;
}

// --- SELF-CONTAINED COMPONENT FOR PENDING REVIEWS ---
interface PendingReview {
  order_id: string;
  vendor_id: string;
  vendor_name: string;
  order_date: string;
}

const PendingReviewsSection = ({ profile }: { profile: Profile | null }) => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchPendingReviews();
    }
  }, [profile?.id]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      // This is a mock implementation. In a real app, you would fetch this from your API.
      const mockReviews: PendingReview[] = [
        {
          order_id: 'ORD12345',
          vendor_id: 'V001',
          vendor_name: 'Fresh Grocery Store',
          order_date: '2023-05-15',
        },
        {
          order_id: 'ORD12346',
          vendor_id: 'V002',
          vendor_name: 'Organic Market',
          order_date: '2023-05-10',
        },
      ];
      setPendingReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      Alert.alert('Error', 'Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPress = (review: PendingReview) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReview || !reviewText.trim()) return;
    
    setSubmitting(true);
    try {
      // Simulate API call to submit review
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingReviews(prev => 
        prev.filter(r => r.order_id !== selectedReview.order_id)
      );
      
      Alert.alert('Success', 'Thank you for your review!');
      setModalVisible(false);
      setReviewText('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (pendingReviews.length === 0) {
    return null; // Don't show the section if there are no pending reviews
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Pending Reviews</Text>
      <View style={styles.reviewsContainer}>
        {pendingReviews.map((review) => (
          <TouchableOpacity
            key={review.order_id}
            style={styles.reviewItem}
            onPress={() => handleReviewPress(review)}
          >
            <View style={styles.reviewContent}>
              <Text style={styles.reviewVendor}>{review.vendor_name}</Text>
              <Text style={styles.reviewDate}>
                Order #{review.order_id} • {review.order_date}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate your order</Text>
            <Text style={styles.modalSubtitle}>
              How was your experience with {selectedReview?.vendor_name}?
            </Text>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={32}
                    color={star <= rating ? colors.warning : colors.border}
                    fill={star <= rating ? colors.warning : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.reviewInput}
              placeholder="Share details about your experience..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmitReview}
                disabled={!reviewText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- MAIN ACCOUNT SCREEN COMPONENT ---
export default function AccountScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // This is a mock implementation
        const mockProfile: Profile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'John Doe',
          email: user.email || 'john.doe@example.com',
          phone_number: '+1234567890',
          avatar_url: user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
          created_at: '2023-01-01',
          updated_at: '2023-05-01',
        };
        setProfile(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authService.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile?.avatar_url }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || 'Guest User'}
            </Text>
            <Text style={styles.profileEmail}>
              {profile?.email || 'guest@example.com'}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(customer)/edit-profile')}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {profile && <PendingReviewsSection profile={profile} />}

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/addresses')}
          >
            <View style={styles.menuIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>My Addresses</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/favorites')}
          >
            <View style={styles.menuIcon}>
              <Heart size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>My Favorites</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/orders')}
          >
            <View style={styles.menuIcon}>
              <ShoppingBag size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>My Orders</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/payment-methods')}
          >
            <View style={styles.menuIcon}>
              <CreditCard size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Payment Methods</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/rate-us')}
          >
            <View style={styles.menuIcon}>
              <Star size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Rate Us</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(customer)/support')}
          >
            <View style={styles.menuIcon}>
              <MessageSquare size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <LogOut size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.surfaceSecondary 
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  profileName: {
    ...commonStyles.text.h4,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    ...commonStyles.text.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    ...commonStyles.text.body,
    color: colors.textPrimary,
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    ...commonStyles.text.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  versionText: {
    ...commonStyles.text.caption,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...commonStyles.text.h4,
    color: colors.textPrimary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  reviewsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewContent: {
    flex: 1,
  },
  reviewVendor: {
    ...commonStyles.text.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  reviewDate: {
    ...commonStyles.text.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...commonStyles.text.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  starButton: {
    marginHorizontal: spacing.xs,
  },
  reviewInput: {
    ...commonStyles.input,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceSecondary,
    marginRight: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    ...commonStyles.text.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  submitButtonText: {
    ...commonStyles.text.body,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
  },
});