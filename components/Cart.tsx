import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react-native';

const Cart: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { cart, updateQuantity, totalPrice, checkout, isProcessing } = useCart();
  const deliveryFee = totalPrice > 0 ? 30 : 0; // Example delivery fee
  const grandTotal = totalPrice + deliveryFee;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some items to get started!</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
            {cart.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <Image 
                  source={{ uri: item.image_url || 'https://placehold.co/400x400/EBF4FF/3B82F6?text=Image' }} 
                  style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.quantityButton}>
                    <Minus size={14} color="#3B82F6" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.quantityButton}>
                    <Plus size={14} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Bill Details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>₹{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>To Pay</Text>
              <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, (isProcessing || grandTotal === 0) && styles.disabledButton]}
            onPress={checkout}
            disabled={isProcessing || grandTotal === 0}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#475569', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#94A3B8', marginTop: 8 },
  itemList: { flex: 1 },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
  itemImage: { width: 48, height: 48, borderRadius: 8, resizeMode: 'contain', backgroundColor: '#F8FAFC' },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#334155' },
  itemPrice: { fontSize: 12, color: '#64748B', marginTop: 4 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8 },
  quantityButton: { padding: 8 },
  quantityText: { fontSize: 14, fontWeight: '600', color: '#1E293B', paddingHorizontal: 8 },
  summaryContainer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#475569' },
  summaryValue: { fontSize: 14, color: '#475569', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  grandTotalRow: { marginTop: 8 },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  grandTotalValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  checkoutButton: { backgroundColor: '#2563EB', padding: 16, margin: 16, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#94A3B8' },
  checkoutButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});

export default Cart;