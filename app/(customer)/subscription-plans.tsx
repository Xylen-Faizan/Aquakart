import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Crown, CircleCheck as CheckCircle, Calendar, Droplets, Zap, Star } from 'lucide-react-native';
import type { CartItem } from '../(customer)';
import { RazorpayService } from '@/src/services/razorpay';
import { razorpayClient } from '@/lib/razorpay-client';

const razorpayService = RazorpayService.getInstance();

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

export default function SubscriptionPlans() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Perfect for small families',
      price: 299,
      duration: 'per month',
      features: [
        '4 bottles per month',
        'Free delivery',
        'Basic customer support',
        'Standard water brands'
      ],
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      description: 'Most popular choice',
      price: 499,
      duration: 'per month',
      popular: true,
      savings: 'Save ₹100',
      features: [
        '8 bottles per month',
        'Free delivery',
        'Priority customer support',
        'Premium water brands',
        'Flexible delivery schedule',
        '10% discount on extra orders'
      ],
    },
    {
      id: 'family',
      name: 'Family Plan',
      description: 'Best value for large families',
      price: 799,
      duration: 'per month',
      savings: 'Save ₹200',
      features: [
        '15 bottles per month',
        'Free delivery',
        '24/7 customer support',
        'All premium brands',
        'Flexible delivery schedule',
        '15% discount on extra orders',
        'Free bottle maintenance',
        'Priority delivery slots'
      ],
    },
  ];

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  const loadCurrentSubscription = async () => {
    try {
      // In a real app, you would fetch the user's subscription from your backend
      // For now, we'll set it to null
      setCurrentSubscription(null);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSubscribing(plan.id);
    try {
      // Create a payment request for the subscription
      const paymentRequest = {
        amount: plan.price * 100, // Convert to paise
        currency: 'INR',
        notes: {
          type: 'subscription',
          planId: plan.id,
          planName: plan.name
        }
      };

      // Process payment with Razorpay
      const cartItem: CartItem = {
        id: parseInt(plan.id, 10) || 0, // Convert to number for Product ID
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        size: 'Subscription',
        rating: 5, // Default rating for subscription
        deliveryTime: 'Instant',
        image: '', // Empty string as we don't have an image for subscription
        inStock: true,
        quantity: 1
      };
      
      const result = await razorpayClient.checkout([cartItem]);

      if (result.success) {
        Alert.alert('Success', `Successfully subscribed to ${plan.name}!`);
        loadCurrentSubscription();
      } else {
        Alert.alert('Payment Failed', result.message || 'Failed to process payment');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      Alert.alert('Error', error.message || 'Failed to create subscription');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Subscription cancelled. You can continue using until the end of your billing period.');
            loadCurrentSubscription();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription Plans</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Subscription */}
        {currentSubscription && (
          <View style={styles.currentSubscription}>
            <View style={styles.currentHeader}>
              <Crown size={24} color="#F59E0B" />
              <Text style={styles.currentTitle}>Current Plan</Text>
            </View>
            <Text style={styles.currentPlan}>Premium Plan</Text>
            <Text style={styles.currentStatus}>Active until March 15, 2024</Text>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
            >
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plans List */}
        <View style={styles.plansList}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          
          {plans.map((plan) => (
            <View key={plan.id} style={[
              styles.planCard,
              plan.popular && styles.popularPlan
            ]}>
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Star size={16} color="#FFF" />
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{plan.price}</Text>
                  <Text style={styles.duration}>{plan.duration}</Text>
                </View>
                
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                )}
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <CheckCircle size={16} color="#059669" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  plan.popular && styles.subscribeButtonPopular,
                  subscribing === plan.id && styles.subscribeButtonDisabled
                ]}
                onPress={() => handleSubscribe(plan)}
                disabled={subscribing === plan.id}
              >
                {subscribing === plan.id ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[
                    styles.subscribeButtonText,
                    plan.popular && styles.subscribeButtonTextPopular
                  ]}>
                    Subscribe Now
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Subscribe?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Droplets size={20} color="#2563EB" />
              <Text style={styles.benefitText}>Guaranteed water supply</Text>
            </View>
            <View style={styles.benefitItem}>
              <Zap size={20} color="#F59E0B" />
              <Text style={styles.benefitText}>Priority delivery slots</Text>
            </View>
            <View style={styles.benefitItem}>
              <Calendar size={20} color="#059669" />
              <Text style={styles.benefitText}>Flexible scheduling</Text>
            </View>
            <View style={styles.benefitItem}>
              <Crown size={20} color="#EC4899" />
              <Text style={styles.benefitText}>Exclusive discounts</Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I change my plan anytime?</Text>
            <Text style={styles.faqAnswer}>Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens if I cancel?</Text>
            <Text style={styles.faqAnswer}>You can continue using your subscription until the end of your billing period. No refunds for partial months.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Are there any hidden charges?</Text>
            <Text style={styles.faqAnswer}>No hidden charges. The price you see is what you pay. Delivery is always free for subscribers.</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  currentSubscription: {
    backgroundColor: '#FEF3C7',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  currentPlan: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  currentStatus: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  plansList: {
    padding: 20,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  planHeader: {
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
  },
  duration: {
    fontSize: 16,
    color: '#64748B',
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subscribeButtonPopular: {
    backgroundColor: '#2563EB',
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  subscribeButtonTextPopular: {
    color: '#FFF',
  },
  benefitsSection: {
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
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
  },
  faqSection: {
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
  faqTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});