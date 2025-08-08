import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Clock, Plus, Minus, Heart } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Product } from '@/app/(customer)'; // Assuming Product type is exported
import { useCart } from '@/contexts/CartContext';

interface SupplierCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string, isCurrentlyFavorite: boolean) => void;
  index: number;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ product, isFavorite, onToggleFavorite, index }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <TouchableOpacity style={styles.card}>
        <Image 
          source={{ uri: product.image_url || 'https://placehold.co/400x400/EBF4FF/3B82F6?text=Image' }}
          style={styles.image}
        />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => onToggleFavorite(product.id, isFavorite)}
        >
          <Heart size={20} color={isFavorite ? '#EF4444' : '#94A3B8'} fill={isFavorite ? '#EF4444' : 'white'}/>
        </TouchableOpacity>
        
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{product.description}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.infoText}>{product.rating || '4.5'}</Text>
            </View>
            <View style={styles.infoChip}>
              <Clock size={12} color="#3B82F6" />
              <Text style={styles.infoText}>{product.delivery_time || '30 min'}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {quantity === 0 ? (
              <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product)}>
                <Plus size={16} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity onPress={() => updateQuantity(product.id, quantity - 1)} style={styles.quantityButton}>
                  <Minus size={16} color="#3B82F6" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(product.id, quantity + 1)} style={styles.quantityButton}>
                  <Plus size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8FAFC',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: 16,
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#2563EB',
    padding: 8,
    borderRadius: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    minWidth: 24,
    textAlign: 'center',
  },
});

export default SupplierCard;