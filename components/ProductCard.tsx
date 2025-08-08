import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';

// Define the structure for the Product prop for type safety
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  vendor_id: string;
  size?: string;
  deliveryTime?: string;
  inStock?: boolean;
};

type ProductCardProps = {
  product: Product;
  quantity?: number;
  onUpdateQuantity?: (productId: string, newQuantity: number) => void;
};

/**
 * A visually appealing card to display a single product.
 * Includes product image, name, price, and an 'Add to Cart' button.
 */
export default function ProductCard({ product, quantity = 0, onUpdateQuantity }: ProductCardProps) {
  // Handle image loading with better error handling
  const [imageError, setImageError] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(() => {
    // Use image_url with fallback to placeholder
    return product.image_url || `https://via.placeholder.com/400x400/EBF4FF/3B82F6?text=${encodeURIComponent(product.name || 'Product')}`;
  });

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // Fallback to placeholder with product name
      setImageUrl(`https://via.placeholder.com/400x400/EBF4FF/3B82F6?text=${encodeURIComponent(product.name || 'Product')}`);
    }
  };

  const handleAddToCart = () => {
    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
          onError={handleImageError}
          onLoadStart={() => console.log('Loading image:', imageUrl)}
          onLoadEnd={() => console.log('Image loaded:', imageUrl)}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{product.price.toFixed(2)}</Text>
          {quantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => onUpdateQuantity && onUpdateQuantity(product.id, Math.max(0, quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => onUpdateQuantity && onUpdateQuantity(product.id, quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
              <Plus size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 8,
    width: '45%',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  infoContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 20,
    textAlign: 'center',
  },
});
