import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar, 
  FlatList, 
  Modal, 
  Pressable, 
  Platform, 
  Animated, 
  Easing,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Clock, Zap, Droplets, ShoppingCart, ChevronDown } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import LocationMap from '@/components/LocationMap';
import { useRouter } from 'expo-router';
import ProductCard from '@/components/ProductCard';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import Cart from '@/components/Cart';
import Chatbot from '@/components/Chatbot';

// Define a consistent Product type
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  size: string;
  rating: number;
  deliveryTime: string;
  image: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export default function CustomerHome() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [location, setLocation] = useState<{
    address: string;
    loading: boolean;
    error: string | null;
    coords?: {
      latitude: number;
      longitude: number;
    };
  }>({ address: 'Fetching location...', loading: true, error: null });
  
  const [showMap, setShowMap] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Check if location permission is already granted
        let { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          // If not granted, request permission
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          status = newStatus;
          
          if (status !== 'granted') {
            setLocation({
              address: 'Location permission denied',
              loading: false,
              error: 'Permission to access location was denied',
            });
            return;
          }
        }

        // Get current position
        const position = await Location.getCurrentPositionAsync({});
        
        // Update location with coordinates
        setLocation(prev => ({
          ...prev,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
        
        // Reverse geocode to get address
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          const formattedAddress = [
            address.name,
            address.street,
            address.city,
            address.region,
            address.postalCode,
          ]
            .filter(Boolean)
            .join(', ');

          setLocation({
            address: formattedAddress || 'Current location',
            loading: false,
            error: null,
          });
        } else {
          setLocation({
            address: 'Current location',
            loading: false,
            error: 'Could not get address',
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocation({
          address: 'Error getting location',
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })();
  }, []);

  const handleLocationPress = () => {
    if (location.error) {
      // If there was an error, try again
      setLocation({ ...location, loading: true, error: null });
      // Re-run the location effect
      // (This is a simplified approach; in a real app, you might want to extract the logic to a separate function)
      // @ts-ignore - This is a hack to force a re-render and re-run the effect
      setLocation(prev => ({ ...prev, loading: true }));
    } else {
      // Show the map with current location
      setShowMap(true);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Droplets },
    { id: 'popular', name: 'Popular', icon: Star },
    { id: 'premium', name: 'Premium', icon: Zap },
    { id: 'eco', name: 'Eco-Friendly', icon: Droplets },
  ];

  const waterBrands: Product[] = [
    {
      id: 1,
      name: 'Aquafina',
      description: '20L Can',
      price: 65,
      size: '20L',
      rating: 4.5,
      deliveryTime: '10-15 min',
      image: 'https://example.com/bisleri.jpg',
      inStock: true,
    },
    {
      id: 2,
      name: 'Kinley',
      description: 'Sparkling water',
      price: 25,
      size: '1L',
      rating: 4.2,
      deliveryTime: '10-15 min',
      image: 'https://example.com/kinley.jpg',
      inStock: true,
    },
    {
      id: 3,
      name: 'Aquafina',
      description: 'Purified drinking water',
      price: 22,
      size: '1L',
      rating: 4.3,
      deliveryTime: '10-15 min',
      image: 'https://example.com/aquafina.jpg',
      inStock: true,
    },
  ];

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
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
      // product not yet in cart – find product details from catalogue
      const prod = waterBrands.find(p => p.id === productId);
      if (!prod) return prevCart; // safety
      return [...prevCart, { ...prod, quantity: newQuantity }];
    });
  };

  const handleRemoveItem = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const quickReorders = [
    { id: 1, name: 'Aquafina 20L', lastOrdered: '2 days ago' },
    { id: 2, name: 'Aquafina 20L', lastOrdered: '5 days ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
      <LocationMap
        visible={showMap}
        onClose={() => setShowMap(false)}
        initialRegion={location.coords ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : undefined}
      />
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={handleLocationPress} style={styles.locationButton}>
              <View style={styles.locationContainer}>
                <MapPin size={18} color="#FFF" />
                <Text style={styles.locationText}>Delivering to</Text>
              </View>
              <View style={styles.addressRow}>
                <Text 
                  style={[
                    styles.addressText,
                    location.loading && styles.loadingText,
                    location.error && styles.errorText
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {location.address}
                </Text>
                <ChevronDown size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartIconContainer} onPress={() => setIsCartVisible(true)}>
              <ShoppingCart size={28} color="#FFF" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search water brands..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* Quick Reorder Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Reorder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickReorders.map((item) => (
              <TouchableOpacity key={item.id} style={styles.reorderCard}>
                <View style={styles.reorderIcon}>
                  <Zap size={24} color="#2563EB" />
                </View>
                <Text style={styles.reorderName}>{item.name}</Text>
                <Text style={styles.reorderTime}>{item.lastOrdered}</Text>
                <TouchableOpacity style={styles.reorderButton}>
                  <Text style={styles.reorderButtonText}>Reorder</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedCategory;
              return (
                <TouchableOpacity
                  style={getCategoryChipStyle(isSelected)}
                  onPress={() => setSelectedCategory(item.id)}
                >
                  <item.icon
                    size={24}
                    color={isSelected ? '#FFF' : '#64748B'}
                  />
                  <Text style={getCategoryTextStyle(isSelected)}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Water Brands -> Renamed to Available Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Products</Text>
          <View style={styles.brandsGrid}>
            {waterBrands.map((brand) => (
              <ProductCard key={brand.id}
                product={brand}
                quantity={cart.find(item => item.id === brand.id)?.quantity ?? 0}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </View>
        </View>
      </ScrollView>

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
            <Cart 
              cart={cart} 
              onUpdateQuantity={handleUpdateQuantity} 
              onRemoveItem={handleRemoveItem}
              onCheckout={() => {
                // Close the cart modal after successful checkout
                setIsCartVisible(false);
                // You can add any additional logic here, like showing a success message
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Chatbot Button */}
      <Chatbot />
    </SafeAreaView>
  );
}

// Define style types to ensure type safety
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

// Style functions (moved outside StyleSheet.create)
const getCategoryChipStyle = (selected: boolean): ViewStyle => ({
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: selected ? '#4F46E5' : '#F1F5F9',
  marginRight: 8,
});

const getCategoryTextStyle = (selected: boolean): TextStyle => ({
  color: selected ? '#FFFFFF' : '#64748B',
  fontSize: 14,
  fontWeight: '500',
});

// Helper function to clean unsupported style properties
const cleanStyle = <T extends Record<string, any>>(style: T): T => {
  const cleaned = { ...style };
  // Remove unsupported properties in React Native
  const unsupportedProps = ['cursor', 'userSelect', 'outline'];
  unsupportedProps.forEach(prop => {
    if (prop in cleaned) delete (cleaned as any)[prop];
  });
  return cleaned;
};

// Base styles
const styles = StyleSheet.create({
  container: cleanStyle({
    flex: 1,
    backgroundColor: '#F8FAFC',
  }),
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#334155',
  },
  searchContainer: cleanStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  }),
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#334155',
  },
  categoriesContainer: {
    marginVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  productsContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748B',
  },
  productDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748B',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cartContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // cartBadge style removed as it's redefined below with more properties
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  // modalContent style removed as it's redefined below with different properties
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  removeButton: {
    padding: 4,
  },
  cartFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  checkoutButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#4F46E5',
  } as ViewStyle,
  headerContent: {
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40, // For safe area
  },
  locationButton: {
    flex: 1,
    marginRight: 16,
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
  } as TextStyle,
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginRight: 4,
    maxWidth: '90%',
  },
  loadingText: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  errorText: {
    color: '#FECACA',
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
  } as TextStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  } as TextStyle,
  reorderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reorderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  reorderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  reorderTime: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  reorderButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reorderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardActive: {
    backgroundColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  brandsGrid: {
    gap: 16,
  },
  brandCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  brandImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  brandInfo: {
    gap: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  brandSize: {
    fontSize: 14,
    color: '#64748B',
  },
  brandMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});