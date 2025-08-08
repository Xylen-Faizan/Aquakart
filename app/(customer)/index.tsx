import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Modal,
  ImageBackground,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  MapPin, 
  Star, 
  Zap, 
  Droplets, 
  ShoppingCart, 
  ChevronDown, 
  Clock,
  Flame,
  Gift,
  ArrowRight,
  X,
  Navigation,
  Plus,
  Minus
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
// Using authService directly instead of useAuth
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import WaterScore from '@/components/WaterScore';
import { useCart } from '@/contexts/CartContext';
import { authService } from '@/lib/auth';
import { locationService } from '@/lib/location';
import { LocationCoords } from '@/lib/types/location';
// LocationCoords type is now imported from authService

// Define types
// Product type definition
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  vendor_id: string;
  size: string;
  rating: number;
  deliveryTime: string;
  inStock?: boolean;
  image?: string;
}

// Cart item type definition
export interface CartItem extends Omit<Product, 'id'> {
  id: string;
  quantity: number;
}

// Order item type definition
type OrderItem = {
  product_id: string;
  quantity: number;
  product: Product;
};

// Order type definition
type Order = {
  id: string;
  created_at: string;
  items: OrderItem[];
  status: string;
  total: number;
};

const CustomerHomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [locationName, setLocationName] = useState('Getting location...');
  const { cart, addToCart, updateQuantity, removeFromCart, getTotalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [waterScore, setWaterScore] = useState(0);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      setUser(currentUser);
      
      try {
        setIsLoading(true);
        
        // Fetch user data including water score
        const { data: userData, error: userError } = await supabase
          .from('customers')
          .select('water_score, created_at')
          .eq('id', currentUser.id) // Use currentUser instead of user state
          .single();
          
        if (userError) throw userError;
        
        if (userData) {
          setWaterScore(userData.water_score || 0);
          
          // Check if user is new (created within last 7 days)
          if (userData.created_at) {
            const userCreatedAt = new Date(userData.created_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            setIsNewUser(userCreatedAt > sevenDaysAgo);
          }
        }
        
        // Fetch order history
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total,
            order_items (
              product_id,
              quantity,
              products (
                id,
                name,
                description,
                price,
                image_url,
                vendor_id,
                size,
                rating,
                delivery_time
              )
            )
          `)
          .eq('customer_id', currentUser.id) // Use currentUser instead of user state
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        if (orders) {
          // Transform the data to match our Order interface
          const formattedOrders = orders.map(order => ({
            id: order.id,
            created_at: order.created_at,
            status: order.status,
            total: order.total,
            items: (order.order_items || []).map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              product: item.products ? {
                ...item.products,
                deliveryTime: item.products.delivery_time || '30-45 min',
                inStock: true
              } : null
            })).filter((item: any) => item.product !== null) // Filter out any null products
          }));
          
          setOrderHistory(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  useEffect(() => {
    // Get current location on component mount
    const getLocation = async () => {
      try {
        const { location, error } = await locationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
          // Try to get address from coordinates
          const { address } = await locationService.reverseGeocode(location);
          if (address) {
            setLocationName(address);
          }
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationName('Location not available');
      }
    };

    getLocation();
  }, []);

  // Get the last ordered product for Smart Reorder
  const lastOrder = orderHistory[0];
  const lastOrderedProduct = lastOrder?.items?.[0]?.product ? {
    ...lastOrder.items[0].product,
    image_url: lastOrder.items[0].product.image_url || `https://placehold.co/400x400/EBF4FF/3B82F6?text=${encodeURIComponent(lastOrder.items[0].product.name)}`
  } : null;

  // Get the most frequently ordered product
  const getMostOrderedProduct = (): Product | null => {
    const productCounts: Record<string, { count: number; product: Product }> = {};
    
    orderHistory.forEach(order => {
      if (!order.items) return;
      
      order.items.forEach(item => {
        if (!item.product) return;
        
        if (!productCounts[item.product_id]) {
          productCounts[item.product_id] = {
            count: 0,
            product: item.product
          };
        }
        productCounts[item.product_id].count += item.quantity;
      });
    });
    
    const sortedProducts = Object.values(productCounts).sort((a, b) => b.count - a.count);
    return sortedProducts[0]?.product || null;
  };

  const mostOrderedProduct = getMostOrderedProduct();

  // Sample product data with working image URLs
  const waterBrands: Product[] = [
    {
      id: '1',
      name: 'Bisleri',
      description: 'Mineral Water',
      price: 20,
      image_url: 'https://www.bisleri.com/on/demandware.static/-/Sites-Bis-Catalog/default/dwd845673d/Product%20Images_Desktop/Bisleri/Bisleri1Litre/PDP/1LiterFront.png',
      vendor_id: 'vendor1',
      size: '1L',
      rating: 4.5,
      deliveryTime: '30-45 min',
      inStock: true
    },
    {
      id: '2',
      name: 'Aquafina',
      description: 'Purified Drinking Water',
      price: 25,
      image_url: 'https://www.bbassets.com/media/uploads/p/l/265894_8-aquafina-packaged-drinking-water.jpg',
      vendor_id: 'vendor2',
      size: '1L',
      rating: 4.8,
      deliveryTime: '45-60 min',
      inStock: true
    },
    {
      id: '3',
      name: 'Kinley',
      description: 'Mineral Water',
      price: 22,
      image_url: 'https://www.bbassets.com/media/uploads/p/l/265686_9-kinley-drinking-water-with-added-minerals.jpg',
      vendor_id: 'vendor1',
      size: '1L',
      rating: 4.3,
      deliveryTime: '45-60 min',
      inStock: true
    },
    {
      id: '4',
      name: 'Himalayan',
      description: 'Natural Spring Water',
      price: 35,
      image_url: 'https://www.bbassets.com/media/uploads/p/l/253557_12-himalayan-natural-mineral-water.jpg',
      vendor_id: 'vendor2',
      size: '1L',
      rating: 4.8,
      deliveryTime: '45-60 min',
      inStock: true
    },
    {
      id: '5',
      name: 'Bailley',
      description: 'Packaged Drinking Water',
      price: 20,
      image_url: 'https://m.media-amazon.com/images/I/31nTkxyMW8L._PIbundle-12,TopRight,0,0_SX500SY455SH20_.jpg',
      vendor_id: 'vendor1',
      size: '1L',
      rating: 4.4,
      deliveryTime: '30-45 min',
      inStock: true
    },
    {
      id: '6',
      name: 'Evian',
      description: 'Natural Spring Water',
      price: 50,
      image_url: 'https://www.bbassets.com/media/uploads/p/l/175165_2-evian-natural-mineral-water.jpg',
      vendor_id: 'vendor2',
      size: '1L',
      rating: 4.9,
      deliveryTime: '60-75 min',
      inStock: true
    }
  ];

  const newArrivals = [...waterBrands]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
    .map(product => ({
      ...product,
      image_url: product.image_url || `https://placehold.co/400x400/EBF4FF/3B82F6?text=${encodeURIComponent(product.name)}`
    }));

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    console.log('Updating quantity for product:', productId, 'New quantity:', newQuantity);
    if (newQuantity < 0) return;
    
    const product = waterBrands.find(p => p.id === productId);
    if (!product) {
      console.log('Product not found:', productId);
      return;
    }
    
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      // Check if item is already in cart
      const existingItem = cart.find(item => item.id === productId);
      
      if (!existingItem) {
        // Item not in cart, use addToCart to add it
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          size: product.size,
          deliveryTime: product.deliveryTime,
          description: product.description
        });
      } else {
        // Item exists, update its quantity
        updateQuantity(productId, newQuantity);
      }
    }
  };
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: product.size,
      deliveryTime: product.deliveryTime,
      description: product.description
    });
  };

  const renderSmartReorder = () => {
    if (isLoading) {
      return <View style={styles.smartReorderSkeleton} />;
    }

    if (isNewUser) {
      return (
        <View style={styles.smartReorder}>
          <View style={styles.smartReorderContent}>
            <Gift size={24} color="#F59E0B" />
            <View style={styles.smartReorderText}>
              <Text style={styles.smartReorderTitle}>Welcome! 🎉</Text>
              <Text style={styles.smartReorderDescription}>
                Enjoy 20% off your first order with code: WELCOME20
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (lastOrderedProduct) {
      const lastOrderDate = new Date(lastOrder.created_at);
      const daysAgo = Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return (
        <TouchableOpacity 
          style={styles.smartReorder}
          onPress={() => handleUpdateQuantity(lastOrderedProduct.id, 1)}
        >
          <View style={styles.smartReorderContent}>
            <Clock size={24} color="#3B82F6" />
            <View style={styles.smartReorderText}>
              <Text style={styles.smartReorderTitle}>Time to reorder!</Text>
              <Text style={styles.smartReorderDescription}>
                It's been {daysAgo} {daysAgo === 1 ? 'day' : 'days'} since your last order of {lastOrderedProduct.name}
              </Text>
            </View>
            <ArrowRight size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderProductCarousel = (title: string, products: Product[], icon: React.ReactNode) => (
    <View style={styles.carouselContainer}>
      <View style={styles.carouselHeader}>
        <View style={styles.carouselTitleContainer}>
          {icon}
          <Text style={styles.carouselTitle}>{title}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {products.map((product) => {
          const cartItem = cart.find(item => item.id === product.id);
          const quantity = cartItem ? cartItem.quantity : 0;
          
          return (
            <ProductCard 
              key={product.id}
              product={product}
              quantity={quantity}
              onUpdateQuantity={handleUpdateQuantity}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  // Handle location press
  const handleLocationPress = () => {
    if (currentLocation) {
      setIsMapVisible(true);
    } else {
      // Try to get location if not available
      locationService.getCurrentLocation().then(({ location }) => {
        if (location) {
          setCurrentLocation(location);
          setIsMapVisible(true);
        }
      });
    }
  };

  const totalItems = getTotalItems();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={handleLocationPress}
          >
            <MapPin size={20} color="#3B82F6" />
            <Text 
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationName}
            </Text>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cartIconContainer} 
            onPress={() => setIsCartVisible(true)}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
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
            placeholder="Search water brands..."
            placeholderTextColor="#6B7280"
          />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Water Score */}
        <View style={styles.waterScoreContainer}>
          <WaterScore score={waterScore} />
        </View>

        {/* Smart Reorder */}
        {renderSmartReorder()}

        {/* Personalized Carousels */}
        {mostOrderedProduct && (
          renderProductCarousel(
            'Your Usual Order', 
            [mostOrderedProduct, ...waterBrands.filter(p => p.id !== mostOrderedProduct.id).slice(0, 3)],
            <Flame size={20} color="#EF4444" style={styles.carouselIcon} />
          )
        )}

        {renderProductCarousel(
          'New Arrivals', 
          newArrivals,
          <Zap size={20} color="#F59E0B" style={styles.carouselIcon} />
        )}

        {/* All Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brandsGrid}>
            {waterBrands.map((brand) => (
              <ProductCard 
                key={brand.id}
                product={brand}
                quantity={cart.find(item => item.id === brand.id)?.quantity ?? 0}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isMapVisible}
        animationType="slide"
        onRequestClose={() => setIsMapVisible(false)}
      >
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Your Location"
              />
            </MapView>
          )}
          <View style={styles.mapHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setIsMapVisible(false)}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Your Location</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.mapFooter}>
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={async () => {
                const { location } = await locationService.getCurrentLocation();
                if (location) {
                  setCurrentLocation(location);
                }
              }}
            >
              <Navigation size={20} color="#3B82F6" />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              onCheckout={() => {
                setIsCartVisible(false);
                // Add any additional checkout logic here
              }}
              onClose={() => setIsCartVisible(false)}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  mapHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapFooter: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  currentLocationText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20, // Adjust for status bar
    paddingBottom: 20,
  },
  waterScoreContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  smartReorder: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  smartReorderSkeleton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    height: 100,
  },
  smartReorderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smartReorderText: {
    flex: 1,
    marginLeft: 12,
  },
  smartReorderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  smartReorderDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  carouselContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carouselTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselIcon: {
    marginRight: 8,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    color: '#4F46E5',
    fontWeight: '500',
    fontSize: 14,
  },
  carouselContent: {
    paddingRight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    maxWidth: '80%',
  },
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
  cartIconContainer: {
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
    borderColor: '#4F46E5',
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  brandsGrid: {
    gap: 16,
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
    paddingBottom: 40,
    maxHeight: '90%',
    minHeight: '50%',
  },
});

// Export the screen component with a named export for testing
// and a default export for the router
export { CustomerHomeScreen };
export default CustomerHomeScreen;