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
  ShoppingBag, // Using a different icon for My Orders
} from 'lucide-react-native';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { commonStyles, colors, spacing, typography, borderRadius } from '@/src/design-system';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';

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
interface User {
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

const PendingReviewsSection: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      const { data, error } = await supabase.rpc('get_pending_reviews', {
        p_customer_id: profile.id,
      });

      if (error) {
        console.error('Error fetching pending reviews:', error);
      } else {
        setPendingReviews(data || []);
      }
      setLoadingReviews(false);
    };

    fetchReviews();
  }, [profile.id]);

  const handleOpenReviewModal = (review: PendingReview) => {
    setSelectedReview(review);
    setRating(0);
    setComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (!profile || !selectedReview) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: profile.id,
        order_id: selectedReview.order_id,
        vendor_id: selectedReview.vendor_id,
        rating,
        comment: comment.trim(),
      });

      if (error) throw error;

      setPendingReviews(reviews => reviews.filter(r => r.order_id !== selectedReview.order_id));
      setReviewModalVisible(false);
      Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not submit your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Reviews</Text>
        {loadingReviews ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : pendingReviews.length > 0 ? (
          <FlatList
            data={pendingReviews}
            keyExtractor={(item) => item.order_id}
            renderItem={({ item }) => (
              <View style={styles.reviewItem}>
                <View style={styles.reviewItemDetails}>
                  <Text style={styles.reviewVendorName}>{item.vendor_name}</Text>
                  <Text style={styles.reviewDate}>
                    Ordered on {new Date(item.order_date).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => handleOpenReviewModal(item)}
                >
                  <Star size={18} color={colors.primary} />
                  <Text style={styles.rateButtonText}>Rate</Text>
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noReviewsText}>You have no pending reviews. Great job!</Text>
        )}
      </View>

      <Modal
        visible={isReviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Order</Text>
            <Text style={styles.modalVendorName}>
              How was your experience with {selectedReview?.vendor_name}?
            </Text>
            <View style={styles.starContainer}>
              <StarRating rating={rating} onStarPress={setRating} starSize={40} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Add a comment (optional)"
              multiline
              value={comment}
              onChangeText={setComment}
              placeholderTextColor={colors.textTertiary}
            />
            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Review'}
              onPress={handleSubmitReview}
              disabled={isSubmitting}
              variant="primary"
            />
            <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- MAIN ACCOUNT SCREEN COMPONENT ---
export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Fetch profile data from customers table
          const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const menuItems = [
    { title: 'My Orders', icon: ShoppingBag, screen: '/(customer)/orders' },
    { title: 'Saved Addresses', icon: MapPin, screen: '/(customer)/addresses' },
    { title: 'Favorites', icon: Heart, screen: '/(customer)/favorites' },
    { title: 'Payment Methods', icon: CreditCard, screen: '/(customer)/payment-methods' },
    { title: 'Support', icon: MessageSquare, screen: '/(customer)/support' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          style={styles.profileHeader}
          onPress={() => router.push('/(customer)/edit-profile')}
        >
          <Image
            source={
              profile?.avatar_url
                ? { uri: profile.avatar_url }
                : require('@/assets/images/default-avatar.png')
            }
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || 'AquaKart User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <ChevronRight color={colors.textTertiary} size={24} />
        </TouchableOpacity>

        {profile && <PendingReviewsSection profile={profile} />}

        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.screen as any)}
            >
              <item.icon color={colors.primary} size={24} />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <ChevronRight color={colors.textTertiary} size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <LogOut color={colors.error} size={24} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { ...commonStyles.container, backgroundColor: colors.surfaceSecondary },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.borderLight, // Added a background color for the placeholder
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  profileName: {
    ...commonStyles.text.h4,
    fontWeight: typography.fontWeight.bold,
  },
  profileEmail: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    ...commonStyles.text.h4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  menuItemText: { ...commonStyles.text.body, flex: 1 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  signOutText: { ...commonStyles.text.body, color: colors.error, fontWeight: 'bold' },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  reviewItemDetails: { flex: 1 },
  reviewVendorName: { ...commonStyles.text.body, fontWeight: typography.fontWeight.medium },
  reviewDate: { ...commonStyles.text.caption, color: colors.textSecondary },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  rateButtonText: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  noReviewsText: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalTitle: { ...commonStyles.text.h3, marginBottom: spacing.sm },
  modalVendorName: { ...commonStyles.text.body, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' },
  starContainer: { marginVertical: spacing.lg },
  input: {
    ...commonStyles.input,
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  cancelText: {
    ...commonStyles.text.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
});