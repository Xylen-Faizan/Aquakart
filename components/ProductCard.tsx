import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '@/app/(customer)';
import { Star, Clock, Plus, Minus, Trash2, Heart } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string, isCurrentlyFavorite: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite, onToggleFavorite }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <View style={styles.card}>
      <View>
        <Image 
          source={{ uri: product.image_url || 'https://placehold.co/400x400/EBF4FF/3B82F6?text=Image' }} 
          style={styles.image} 
        />
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => onToggleFavorite(product.id, isFavorite)}
        >
          <Heart size={20} color={isFavorite ? '#EF4444' : '#94A3B8'} fill={isFavorite ? '#EF4444' : 'none'}/>
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.deliveryTimeContainer}>
          <Clock size={14} color="#3B82F6" />
          <Text style={styles.deliveryTime}>{product.delivery_time || '30 min'}</Text>
        </View>

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.size}</Text>
        
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>₹{product.price}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{product.rating || '4.5'}</Text>
            </View>
          </View>
          
          {quantity === 0 ? (
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product)}>
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControl}>
              <TouchableOpacity onPress={() => updateQuantity(product.id, quantity - 1)} style={styles.quantityButton}>
                {quantity === 1 ? <Trash2 size={16} color="#EF4444" /> : <Minus size={16} color="#3B82F6" />}
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(product.id, quantity + 1)} style={styles.quantityButton}>
                <Plus size={16} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Add the new favoriteButton style
const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, flexDirection: 'row', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden', },
  image: { width: 80, height: 80, borderRadius: 8, resizeMode: 'contain', backgroundColor: '#F8FAFC', },
  favoriteButton: { position: 'absolute', top: -4, right: -4, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 6, borderRadius: 16 },
  detailsContainer: { flex: 1, marginLeft: 12, justifyContent: 'space-between', },
  deliveryTimeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', },
  deliveryTime: { fontSize: 10, fontWeight: '600', color: '#3B82F6', },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginTop: 4, },
  description: { fontSize: 12, color: '#64748B', marginTop: 2, },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, },
  price: { fontSize: 16, fontWeight: '700', color: '#111827', },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, },
  rating: { fontSize: 12, color: '#64748B', fontWeight: '500', },
  addButton: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 8, },
  addButtonText: { color: '#16A34A', fontWeight: '600', fontSize: 14, },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 8, },
  quantityButton: { padding: 8, },
  quantityText: { fontSize: 16, fontWeight: '600', color: '#16A34A', minWidth: 20, textAlign: 'center', },
});

export default ProductCard;