import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { razorpayClient } from '@/lib/razorpay-client';
import { authService } from '@/lib/auth';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  isProcessing: boolean;
  totalItems: number;
  totalPrice: number;
  checkoutStep: 'cart' | 'address' | 'payment';
  setCheckoutStep: (step: 'cart' | 'address' | 'payment') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment'>('cart');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Please log in to check out.");

      const razorpayResult = await razorpayClient.checkout(cart, {
        name: user.user_metadata?.full_name || 'AquaKart User',
        email: user.email || '',
        contact: user.phone || ''
      });

      if (razorpayResult.success && razorpayResult.orderId) {
        Alert.alert('Payment Successful!', 'Placing your order...');
        
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            id: razorpayResult.orderId,
            customer_id: user.id,
            total: totalPrice,
            status: 'payment_successful',
          })
          .select()
          .single();

        if (orderError) {
          throw new Error(`Failed to save order to database: ${orderError.message}`);
        }
        
        const productIds = cart.map(item => item.id);
        const { data: assignmentData, error: assignmentError } = await supabase.functions.invoke('assign-order-to-vendor', {
          body: { orderId: newOrder.id, productIds },
        });

        if (assignmentError) {
          throw new Error(`Order assignment failed: ${assignmentError.message}`);
        }

        Alert.alert('Order Assigned!', `Your order has been assigned to ${assignmentData.assignedVendor.name}. You can track it in your orders.`);
        clearCart();
      } else {
        // This provides a more specific error if the payment is cancelled vs. failed
        if (razorpayResult.message && !razorpayResult.message.includes('cancelled')) {
           Alert.alert('Payment Failed', razorpayResult.message);
        }
      }
    } catch (error: any) {
      // This will now show the SPECIFIC error message from the Edge Function
      Alert.alert('Checkout Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart, 
      checkout, 
      isProcessing, 
      totalItems, 
      totalPrice,
      checkoutStep,
      setCheckoutStep
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};