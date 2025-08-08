import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/app/(customer)'; // Make sure Product type is exported from your index
import { Alert } from 'react-native';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

      const result = await razorpayClient.checkout(cart, {
        name: user.user_metadata?.full_name || 'AquaKart User',
        email: user.email || '',
        contact: user.phone || ''
      });

      if (result.success) {
        Alert.alert('Order Processing', result.message || 'Your order is being processed.');
        clearCart();
      } else {
        // Don't show an alert if payment was just cancelled by the user
        if (result.message && !result.message.includes('cancelled')) {
           Alert.alert('Payment Failed', result.message);
        }
      }
    } catch (error: any) {
      Alert.alert('Checkout Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, checkout, isProcessing, totalItems, totalPrice }}>
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