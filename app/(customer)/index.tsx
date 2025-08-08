import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps'; // Import map components
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  ChevronDown,
  X // Import X for the close button
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { locationService } from '@/lib/location';
import { LocationCoords } from '@/lib/types/location'; // Import LocationCoords
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import WaterScore from '@/components/WaterScore';
import { authService } from '@/lib/auth';

// Define and export types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  vendor_id: string;
  size: string;
  rating: number;
  delivery_time: string;
  inStock?: boolean;
}

const CustomerHomeScreen = () => {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false); // State for map modal
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null); // State to hold coordinates
  const [locationName, setLocationName] = useState('Getting location...');
  const { totalItems } = useCart();
  const [waterScore, setWaterScore] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      // Fetch products first
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*');
      if (productError) throw productError;
      setProducts(productData || []);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // Fetch favorites and customer data
        const [favoritesResponse, customerResponse] = await Promise.all([
          supabase.from('favorites').select('product_id').eq('user_id', currentUser.id),
          supabase.from('customers').select('water_score').eq('id', currentUser.id).single()
        ]);
        
        if (favoritesResponse.data) {
          setFavorites(favoritesResponse.data.map(fav => fav.product_id));
        }
        if (customerResponse.data) {
          setWaterScore(customerResponse.data.water_score || 0);
        }
      }
      
      // Get location
      const { location } = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location); // Save the coordinates
        const { address } = await locationService.reverseGeocode(location);
        setLocationName(address ? address.split(',')[0] : 'Current Location');
      } else {
        setLocationName('Location not found');
      }

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAllData();
  }, []);
  
  const handleToggleFavorite = async (productId: string, isCurrentlyFavorite: boolean) => {
    const user = await authService.getCurrentUser();
    if (!user) return;
    
    if (isCurrentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== productId));
      await supabase.from('favorites').delete().match({ user_id: user.id, product_id: productId });
    } else {
      setFavorites(prev => [...prev, productId]);
      await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.locationContainer} 
            onPress={() => setIsMapVisible(true)} // This now correctly opens the map modal
          >
            <MapPin size={20} color="#FFF" />
            <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
            <ChevronDown size={16} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cartIconContainer} 
            onPress={() => setIsCartVisible(true)}
          >
            {totalItems > 0 && (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>
            )}
            <ShoppingCart size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput style={styles.searchInput} placeholder="Search water brands..."/>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAllData} />}
      >
        <View style={styles.waterScoreContainer}><WaterScore score={waterScore} /></View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <View style={styles.brandsGrid}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Cart Modal */}
      <Modal visible={isCartVisible} transparent={true} animationType="slide" onRequestClose={() => setIsCartVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsCartVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
             <Cart onClose={() => setIsCartVisible(false)} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Map Modal - RESTORED */}
      <Modal
        animationType="slide"
        visible={isMapVisible}
        onRequestClose={() => setIsMapVisible(false)}
      >
        <View style={styles.mapContainer}>
          <TouchableOpacity style={styles.mapCloseButton} onPress={() => setIsMapVisible(false)}>
            <X size={24} color="#333" />
          </TouchableOpacity>
          {currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <Marker
                coordinate={currentLocation}
                title="Your Location"
                description="You are here"
              />
            </MapView>
          ) : (
            <View style={styles.mapLoadingContainer}>
              <ActivityIndicator size="large" />
              <Text>Fetching your location...</Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 16 },
  locationText: { fontSize: 14, color: '#FFF', fontWeight: '500', maxWidth: '85%' },
  cartIconContainer: { padding: 4 },
  cartBadge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#4F46E5' },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12, },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B', padding: 0, },
  scrollView: { flex: 1 },
  waterScoreContainer: { paddingHorizontal: 20, paddingTop: 16 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  brandsGrid: { gap: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', },
  modalContent: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', paddingTop: 8, },
  
  // Styles for Map Modal
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapCloseButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 20,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomerHomeScreen;