import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Crown, CircleAlert as AlertCircle } from 'lucide-react-native';
import { stripeService } from '@/lib/stripe-client';
import { getProductByPriceId } from '@/src/stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stripeService.getUserSubscription();
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AlertCircle size={20} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load subscription</Text>
      </View>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <View style={styles.container}>
        <Text style={styles.noSubscriptionText}>No active subscription - Purchase water bottles individually</Text>
      </View>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = ['active', 'trialing'].includes(subscription.subscription_status);

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <Crown size={20} color={isActive ? '#F59E0B' : '#64748B'} />
      <View style={styles.subscriptionInfo}>
        <Text style={[styles.planName, isActive && styles.activePlanName]}>
          {product?.name || 'Unknown Plan'}
        </Text>
        <Text style={styles.status}>
          Status: {typeof subscription.subscription_status === 'string' ? subscription.subscription_status.replace('_', ' ') : 'Not Active'}
        </Text>
        {subscription.current_period_end && (
          <Text style={styles.periodEnd}>
            {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
            {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  activeContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  subscriptionInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  activePlanName: {
    color: '#92400E',
  },
  status: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
  },
  periodEnd: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  noSubscriptionText: {
    fontSize: 14,
    color: '#64748B',
  },
});