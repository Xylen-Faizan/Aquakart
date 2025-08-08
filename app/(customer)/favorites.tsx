import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star as StarIcon, Clock, Zap, Droplets, ShoppingCart, X, Heart, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import { Product, CartItem } from './index';
import { razorpayClient } from '@/lib/razorpay-client';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Mock favorite products data
const favoriteProducts: Product[] = [
  {
    id: '1',
    name: 'Aquafina',
    description: '20L Can',
    price: 65,
    size: '20L',
    rating: 4.5,
    deliveryTime: '12 mins',
    image_url: 'https://everydaysure.in/water/assets/media/aquafina-20ltr.jpg',
    inStock: true,
    vendor_id: 'vendor1'
  },
  {
    id: '2',
    name: 'Bisleri',
    description: '20L Can',
    price: 85,
    size: '20L',
    rating: 4.3,
    deliveryTime: '15 mins',
    image_url: 'https://www.bisleri.com/on/demandware.static/-/Sites-Bis-Catalog/default/dwff6a45f6/Product%20Images_Desktop/Bisleri/Bisleri20Litre/PDP/TwentyLiterFrontPage.png',
    inStock: true,
    vendor_id: 'vendor2'
  },
];

export default function FavoritesScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [favorites, setFavorites] = useState<Product[]>(favoriteProducts);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'All', icon: Droplets },
    { id: 'popular', name: 'Popular', icon: StarIcon },
    { id: 'premium', name: 'Premium', icon: Zap },
  ];

  // Cart functions
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === productId);
      if (existing) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      // product not yet in cart – find product details from favorites
      const prod = favorites.find(p => p.id === productId);
      if (!prod) return prevCart; // safety
      return [...prevCart, { ...prod, quantity: newQuantity }];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await razorpayClient.checkout(cart);
      
      if (result.success) {
        // Clear cart on successful payment
        setCart([]);
        
        // Show success message
        Alert.alert(
          'Order Placed!',
          `Your order #${result.orderId} has been placed successfully. Payment ID: ${result.paymentId}`,
          [
            {
              text: 'View Orders',
              onPress: () => router.push('/orders'),
              style: 'default',
            },
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', result.message || 'There was an issue processing your payment. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Error',
        'An error occurred while processing your payment. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
      setIsCartVisible(false);
    }
  };

  const filteredFavorites = favorites.filter(product => 
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.description.toLowerCase().includes(searchText.toLowerCase())
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Heart size={48} color="#E5E7EB" />
        <Text style={styles.emptyStateText}>
          You don't have any favorites yet. Tap the heart icon to add some!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <View>
              <View style={styles.locationContainer}>
                <MapPin size={18} color="#FFF" />
                <Text style={styles.locationText}>Delivering to</Text>
              </View>
              <Text style={styles.addressText}>123 Main Street, City</Text>
            </View>
            <TouchableOpacity 
              style={styles.cartIconContainer} 
              onPress={() => setIsCartVisible(true)}
            >
              <ShoppingCart size={28} color="#FFF" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search favorites..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <category.icon
                  size={24}
                  color={selectedCategory === category.id ? '#FFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Favorites List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Favorites</Text>
          <View style={styles.productsGrid}>
            {filteredFavorites.map((product) => (
              <View key={product.id} style={{ width: '48%' }}>
                <ProductCard 
                  product={product}
                  quantity={cart.find(item => item.id === product.id)?.quantity ?? 0}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Cart Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCartVisible}
        onRequestClose={() => setIsCartVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsCartVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Cart 
              onCheckout={handleCheckout}
              onClose={() => setIsCartVisible(false)}
              isProcessing={isProcessing}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 2,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    padding: 0,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    gap: 8,
  },
  categoryCardActive: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 280,
  },
});