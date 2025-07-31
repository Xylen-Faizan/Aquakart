import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CreditCard, Plus, ArrowLeft, Trash2, Star, Smartphone } from 'lucide-react-native';
import { stripeService } from '@/lib/stripe-client';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  upiId?: string;
  walletType?: string;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      // Mock data for now - in real app, fetch from Stripe/backend
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
        },
        {
          id: '2',
          type: 'upi',
          upiId: 'user@paytm',
          isDefault: false,
        },
        {
          id: '3',
          type: 'wallet',
          walletType: 'Paytm',
          isDefault: false,
        },
      ];
      
      setPaymentMethods(mockMethods);
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose payment method type',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit/Debit Card', onPress: () => addCard() },
        { text: 'UPI', onPress: () => addUPI() },
        { text: 'Wallet', onPress: () => addWallet() },
      ]
    );
  };

  const addCard = () => {
    // In real app, integrate with Stripe Elements or similar
    Alert.alert('Add Card', 'This would open Stripe card setup flow');
  };

  const addUPI = () => {
    Alert.alert('Add UPI', 'This would open UPI ID input form');
  };

  const addWallet = () => {
    Alert.alert('Add Wallet', 'This would show wallet options');
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete this ${method.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
            Alert.alert('Success', 'Payment method deleted');
          }
        }
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    Alert.alert('Success', 'Default payment method updated');
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return CreditCard;
      case 'upi': return Smartphone;
      case 'wallet': return CreditCard;
      default: return CreditCard;
    }
  };

  const getMethodTitle = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `${method.brand?.toUpperCase()} •••• ${method.last4}`;
      case 'upi':
        return method.upiId;
      case 'wallet':
        return `${method.walletType} Wallet`;
      default:
        return 'Unknown';
    }
  };

  const getMethodSubtitle = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `Expires ${method.expiryMonth}/${method.expiryYear}`;
      case 'upi':
        return 'UPI Payment';
      case 'wallet':
        return 'Digital Wallet';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
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
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.methodsList}>
          {paymentMethods.map((method) => {
            const IconComponent = getMethodIcon(method.type);
            return (
              <View key={method.id} style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <View style={styles.methodIcon}>
                      <IconComponent size={24} color="#2563EB" />
                    </View>
                    <View style={styles.methodDetails}>
                      <View style={styles.methodTitleRow}>
                        <Text style={styles.methodTitle}>{getMethodTitle(method)}</Text>
                        {method.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Star size={12} color="#F59E0B" />
                            <Text style={styles.defaultText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.methodSubtitle}>{getMethodSubtitle(method)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteMethod(method)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {!method.isDefault && (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {paymentMethods.length === 0 && (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No payment methods</Text>
              <Text style={styles.emptySubtitle}>Add a payment method to make ordering easier</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={handleAddPaymentMethod}
              >
                <Plus size={20} color="#FFF" />
                <Text style={styles.addFirstButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>Payment Security</Text>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
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
  addButton: {
    padding: 4,
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
  methodsList: {
    padding: 20,
    gap: 16,
  },
  methodCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  deleteButton: {
    padding: 8,
  },
  setDefaultButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  addFirstButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  securityInfo: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});