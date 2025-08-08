import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/src/design-system';
import Button from '@/components/ui/Button';
import { useCart, CartItem } from '@/contexts/CartContext';

interface CartProps {
  onCheckout: () => void;
  onClose?: () => void;
  isProcessing?: boolean;
}

export default function Cart({ 
  onCheckout,
  onClose,
  isProcessing = false
}: CartProps) {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCart();
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <ShoppingBag size={48} color={colors.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyDescription}>
          Add some water bottles to get started with your order
        </Text>
        <Button
          title="Start Shopping"
          onPress={onClose || (() => {})}
          variant="primary"
          size="large"
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.itemCount}>{totalItems} items</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      <ScrollView 
        style={styles.itemsContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cart.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.itemImage} 
              defaultSource={{ uri: 'https://via.placeholder.com/100x100/EBF4FF/3B82F6' }}
            />
            
            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity 
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.itemDescription}>{item.description}</Text>
              
              <View style={styles.itemMeta}>
                <Text style={styles.itemSize}>{item.size}</Text>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
                </View>
              </View>
              
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} color={colors.primary} />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
        </View>
        
        <View style={styles.summaryItems}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'Free'}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <View style={styles.checkoutButton}>
          <Button
            title={isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            onPress={onCheckout}
            variant="primary"
            size="large"
            icon={isProcessing ? undefined : <ArrowRight size={20} color={colors.white} />}
            disabled={isProcessing}
            loading={isProcessing}
            style={{ width: '100%' }}
          />
        </View>
        
        <Text style={styles.deliveryNote}>
          Delivery in 10-15 minutes • Free delivery on orders above ₹100
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  itemCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.regular,
  },
  closeButton: {
    padding: spacing.sm,
  },
  itemsContainer: {
    flex: 1,
    padding: spacing.md,
    maxHeight: '60%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.md,
    ...shadows.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
  },
  itemDetails: {
    flex: 1,
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  removeButton: {
    padding: spacing.xs,
  },
  itemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSize: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily.regular,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deliveryTime: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    gap: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  quantityText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
    fontFamily: typography.fontFamily.semibold,
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  summaryHeader: {
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semibold,
  },
  summaryItems: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  summaryValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  checkoutButton: {
    marginBottom: spacing.md,
  },
  deliveryNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  emptyButton: {
    width: '100%',
  },
});
