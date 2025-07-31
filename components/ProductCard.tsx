import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ShoppingCart, Plus, Minus } from 'lucide-react-native';
import { Product } from '@/app/(customer)/index';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
}

export default function ProductCard({ product, quantity, onUpdateQuantity }: ProductCardProps) {
  

  const handleAddToCart = () => {
    if (quantity === 0) {
      onUpdateQuantity(product.id, 1);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
        
        <View style={styles.actionsContainer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => onUpdateQuantity(product.id, Math.max(0, quantity - 1))}
            >
              <Minus size={16} color="#3B82F6" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => onUpdateQuantity(product.id, quantity + 1)}
            >
              <Plus size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart size={16} color="#FFF" />
            <Text style={styles.addToCartButtonText}>{quantity === 0 ? 'Add to Cart' : 'Added'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'contain',
    backgroundColor: '#F8FAFC',
  },
  detailsContainer: {
    width: '100%',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});