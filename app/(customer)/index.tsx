import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, MapPin, Zap, ShoppingCart, ChevronDown, X } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';
import VendorCard, { Vendor } from '@/components/VendorCard';
import { locationService } from '@/lib/location';
import { LocationCoords } from '@/lib/types/location';
import SupplierCard from '@/components/SupplierCard'; // We need this for the type

// --- FIX: Ensure the Product interface is exported ---
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
}

export default function CustomerHomeScreen() {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationName, setLocationName] = useState('Locating...');
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const { totalItems } = useCart();
  // We will manage products locally for now until a supplier screen is built
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [vendorResponse, productResponse, locationData] = await Promise.all([
        supabase.from('vendors').select('*'),
        supabase.from('products').select('*'),
        locationService.getCurrentLocation()
      ]);

      const { data: vendorData, error: vendorError } = vendorResponse;
      if (vendorError) throw vendorError;
      setVendors(vendorData || []);
      
      const { data: productData, error: productError } = productResponse;
      if (productError) throw productError;
      setProducts(productData || []);

      if (locationData.location) {
        setCurrentLocation(locationData.location);
        const { address } = await locationService.reverseGeocode(locationData.location);
        setLocationName(address ? address.split(',')[0] : 'Current Location');
      } else {
        setLocationName('Location not found');
      }
      
      const user = await authService.getCurrentUser();
      if (user) {
        const { data: favData } = await supabase.from('favorites').select('product_id').eq('user_id', user.id);
        if (favData) setFavorites(favData.map(fav => fav.product_id));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.locationContainer} onPress={() => setIsMapVisible(true)}>
          <MapPin size={20} color="#475569" />
          <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
          <ChevronDown size={16} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartIconContainer} onPress={() => setIsCartVisible(true)}>
          {totalItems > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>
          )}
          <ShoppingCart size={28} color="#1E293B" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        ListHeaderComponent={
          <>
            <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
              <Text style={styles.title}>
                Find <Text style={styles.titleHighlight}>Water Suppliers</Text>
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Search style={styles.searchIcon} color="#94A3B8" size={20} />
                <TextInput
                  placeholder="Search products..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  style={styles.searchInput}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </Animated.View>
            <View style={styles.mainContent}>
              <Text style={styles.resultsTitle}>All Products</Text>
            </View>
          </>
        }
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <SupplierCard
              product={item}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={handleToggleFavorite}
              index={index}
            />
          </View>
        )}
        ListEmptyComponent={!isLoading ? <View style={styles.emptyContainer}><Text>No products found.</Text></View> : null}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
      />

      <Modal visible={isCartVisible} transparent={true} animationType="slide" onRequestClose={() => setIsCartVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsCartVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Cart onClose={() => setIsCartVisible(false)} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={isMapVisible} animationType="slide" onRequestClose={() => setIsMapVisible(false)}>
        <View style={styles.mapContainer}>
          <TouchableOpacity style={styles.mapCloseButton} onPress={() => setIsMapVisible(false)}><X size={24} color="#333" /></TouchableOpacity>
          {currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              showsMyLocationButton
            >
              <Marker coordinate={currentLocation} title="Your Location" />
            </MapView>
          ) : (
            <View style={styles.mapLoadingContainer}><ActivityIndicator size="large" color="#2563EB" /></View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
// Add all the styles from the previous turn here...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    topHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    locationText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1E293B',
    },
    cartIconContainer: {
      padding: 4,
    },
    cartBadge: {
      position: 'absolute',
      right: -4,
      top: -4,
      backgroundColor: '#EF4444',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#F8FAFC',
      zIndex: 1,
    },
    cartBadgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    header: { padding: 16, paddingTop: 8, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
    titleHighlight: { color: '#2563EB' },
    searchSection: { paddingHorizontal: 16, marginVertical: 8 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, },
    searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
    searchInput: { flex: 1, padding: 16, paddingLeft: 48, fontSize: 16 },
    mainContent: { paddingHorizontal: 16, marginTop: 16 },
    resultsTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    gridContainer: { paddingHorizontal: 8 },
    row: { flex: 1, justifyContent: "space-around" },
    cardContainer: { width: '50%', padding: 8 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50, },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', },
    modalContent: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', paddingTop: 8, },
    mapContainer: { flex: 1, },
    map: { ...StyleSheet.absoluteFillObject, },
    mapCloseButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 8, borderRadius: 20, },
    mapLoadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  });