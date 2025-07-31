import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, XCircle } from 'lucide-react-native';
import { CartItem } from '@/app/(customer)/index';
import { razorpayClient } from '@/lib/razorpay-client';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout?: () => void;
}

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out');
      return;
    }

    try {
      setPaymentStatus('processing');
      setErrorMessage('');
      
      // Process checkout with Razorpay
      const result = await razorpayClient.checkout(cart);
      
      if (result.success) {
        setPaymentStatus('success');
        // Call the onCheckout callback if payment was successful
        if (onCheckout) {
          onCheckout();
        }
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setPaymentStatus('idle');
        }, 3000);
      } else {
        setPaymentStatus('error');
        setErrorMessage(result.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );
    }
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.statusText}>Processing your payment...</Text>
          </View>
        );
      case 'success':
        return (
          <View style={[styles.statusContainer, styles.successContainer]}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={[styles.statusText, styles.successText]}>
              Payment successful! Your order is being processed.
            </Text>
          </View>
        );
      case 'error':
        return (
          <View style={[styles.statusContainer, styles.errorContainer]}>
            <XCircle size={20} color="#EF4444" />
            <Text style={[styles.statusText, styles.errorText]}>
              {errorMessage}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };
  const getTotal = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const isProcessing = paymentStatus === 'processing';

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingCart size={32} color="#9CA3AF" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping Cart</Text>
      <ScrollView style={styles.cartItemsContainer}>
        {cart.map((item: CartItem) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity - 1)} style={styles.quantityButton}>
                <Minus size={16} color="#3B82F6" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity + 1)} style={styles.quantityButton}>
                <Plus size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={[styles.quantityButton, styles.removeButton]}>
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {renderPaymentStatus()}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{getTotal()}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.checkoutButton, 
            (isProcessing || cart.length === 0) && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={isProcessing || cart.length === 0}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>
              {cart.length > 0 ? 'Proceed to Checkout' : 'Add Items to Cart'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  cartItemsContainer: {
    maxHeight: 200,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    padding: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  successText: {
    color: '#065F46',
  },
  errorText: {
    color: '#991B1B',
  },
  checkoutButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.8,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Cart;
