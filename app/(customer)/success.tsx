import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle, Chrome as Home, Receipt } from 'lucide-react-native';
import { RazorpayService } from '@/src/services/razorpay';

const razorpayService = RazorpayService.getInstance();

interface OrderData {
  id: string;
  order_id: string;
  amount: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_date: string;
  items: any[];
  status: string;
  timestamp: string;
}

export default function SuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  
  const successUrl = 'exp://192.168.1.100:8081/--/(customer)/success';
  const cancelUrl = 'exp://192.168.1.100:8081/--/(customer)';

  useEffect(() => {
    loadLatestOrder();
  }, []);

  const loadLatestOrder = async () => {
    try {
      // In a real app, you would fetch the latest order from your backend
      // For now, we'll use a mock order
      const mockOrder: OrderData = {
        id: 'mock_order_123',
        order_id: 'order_' + Math.random().toString(36).substr(2, 9),
        amount: 0,
        amount_total: 0,
        currency: 'INR',
        payment_status: 'paid',
        order_date: new Date().toISOString(),
        status: 'success',
        items: [],
        timestamp: new Date().toISOString()
      };
      setOrderData(mockOrder);
    } catch (error) {
      console.error('Failed to load order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.replace('/(customer)');
  };

  const handleViewOrders = () => {
    router.push('/(customer)/orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <CheckCircle size={80} color="#059669" />
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase. Your order has been confirmed.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        ) : orderData ? (
          <View style={styles.orderDetails}>
            <Text style={styles.orderTitle}>Order Details</Text>
            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Order ID:</Text>
                <Text style={styles.orderValue}>#{orderData.order_id}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Amount:</Text>
                <Text style={styles.orderValue}>
                  {orderData.currency.toUpperCase()} {(orderData.amount_total / 100).toFixed(2)}
                </Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Status:</Text>
                <Text style={[styles.orderValue, styles.statusValue]}>
                  {orderData.payment_status}
                </Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Date:</Text>
                <Text style={styles.orderValue}>
                  {new Date(orderData.order_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noOrderContainer}>
            <Text style={styles.noOrderText}>
              Order details will be available shortly.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Home size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrders}>
            <Receipt size={20} color="#2563EB" />
            <Text style={styles.secondaryButtonText}>View All Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  orderDetails: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  orderInfo: {
    gap: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusValue: {
    color: '#059669',
    textTransform: 'capitalize',
  },
  noOrderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  noOrderText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});