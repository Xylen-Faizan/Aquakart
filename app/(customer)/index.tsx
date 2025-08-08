import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, MapPin, ShoppingCart, ChevronDown, X, Droplets } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';
import { locationService } from '@/lib/location';
import { LocationCoords } from '@/lib/types/location';
import { Product, Vendor } from '@/types';
import ProductRow from '@/components/ProductRow';

// A type to hold the combined data
interface ProductWithVendors extends Product {
    availableVendors: Vendor[];
}

export default function CustomerHomeScreen() {
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationName, setLocationName] = useState('Locating...');
    const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
    const { totalItems } = useCart();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [productsWithVendors, setProductsWithVendors] = useState<ProductWithVendors[]>([]);
    const [allVendors, setAllVendors] = useState<Vendor[]>([]);

    const fetchData = async () => {
        try {
            // Fetch all required data in parallel
            const [productRes, vendorRes, vendorProductRes, locationData] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('vendors').select('*'),
                supabase.from('vendor_products').select('vendor_id, product_id'),
                locationService.getCurrentLocation()
            ]);

            const products = productRes.data || [];
            const vendors = vendorRes.data || [];
            const vendorProducts = vendorProductRes.data || [];
            setAllVendors(vendors);

            // Create a map for easy lookup
            const vendorMap = new Map(vendors.map(v => [v.id, v]));

            // Combine the data: for each product, find its available vendors
            const combinedData: ProductWithVendors[] = products.map(product => {
                const vendorIds = vendorProducts
                    .filter(vp => vp.product_id === product.id)
                    .map(vp => vp.vendor_id);
                
                const availableVendors = vendorIds
                    .map(vid => vendorMap.get(vid))
                    .filter((v): v is Vendor => v !== undefined);
                
                return { ...product, availableVendors };
            }).filter(p => p.availableVendors.length > 0); // Only show products that have at least one vendor

            setProductsWithVendors(combinedData);

            // Handle location
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
    
    const filteredProducts = productsWithVendors.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Location and Cart */}
            <View style={styles.topHeader}>
                <TouchableOpacity style={styles.locationContainer} onPress={() => setIsMapVisible(true)}>
                    <MapPin size={20} color="#475569" />
                    <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
                    <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartIconContainer} onPress={() => setIsCartVisible(true)}>
                    {totalItems > 0 && (<View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>)}
                    <ShoppingCart size={28} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                            <Text style={styles.title}>Pure Water, <Text style={styles.titleHighlight}>Delivered</Text></Text>
                        </Animated.View>
                        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.searchSection}>
                            <View style={styles.searchContainer}>
                                <Search style={styles.searchIcon} color="#94A3B8" size={20} />
                                <TextInput
                                    placeholder="Search for a water brand..."
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    style={styles.searchInput}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </Animated.View>
                        <View style={styles.mainContent}><Text style={styles.resultsTitle}>Available Products</Text></View>
                    </>
                }
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => (
                    <ProductRow
                        product={item}
                        availableVendors={item.availableVendors}
                        isFavorite={favorites.includes(item.id)}
                        onToggleFavorite={handleToggleFavorite}
                        index={index}
                    />
                )}
                ListEmptyComponent={!isLoading ? 
                    <View style={styles.emptyContainer}>
                        <Search size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No Products Found</Text>
                    </View> 
                : null}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
            />

            {/* Modals for Cart and Map */}
            <Modal visible={isCartVisible} transparent={true} animationType="slide" onRequestClose={() => setIsCartVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsCartVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalContent}><Cart onClose={() => setIsCartVisible(false)} /></TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            <Modal visible={isMapVisible} animationType="slide" onRequestClose={() => setIsMapVisible(false)}>
                <View style={styles.mapContainer}>
                    <TouchableOpacity style={styles.mapCloseButton} onPress={() => setIsMapVisible(false)}><X size={24} color="#333" /></TouchableOpacity>
                    {currentLocation ? (
                        <MapView style={styles.map} initialRegion={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>
                            <Marker coordinate={currentLocation} title="Your Location" pinColor="blue" />
                            {allVendors.map(vendor => (
                                vendor.latitude && vendor.longitude && (
                                    <Marker key={vendor.id} coordinate={{ latitude: Number(vendor.latitude), longitude: Number(vendor.longitude) }} title={vendor.name} description={vendor.description || ''}>
                                        <View style={styles.markerContainer}><Droplets size={24} color="#FFF" /></View>
                                    </Marker>
                                )
                            ))}
                        </MapView>
                    ) : <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    locationText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    cartIconContainer: { padding: 4 },
    cartBadge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F8FAFC', zIndex: 1 },
    cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    header: { padding: 16, paddingTop: 8, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
    titleHighlight: { color: '#2563EB' },
    searchSection: { paddingHorizontal: 16, marginVertical: 8 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, elevation: 3, shadowColor: '#1E293B' },
    searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
    searchInput: { flex: 1, padding: 16, paddingLeft: 48, fontSize: 16 },
    mainContent: { paddingHorizontal: 16, marginTop: 16 },
    resultsTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    listContainer: { paddingHorizontal: 16, paddingBottom: 32 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#64748B', marginTop: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', paddingTop: 8 },
    mapContainer: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    mapCloseButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 8, borderRadius: 20 },
    markerContainer: { backgroundColor: '#3B82F6', padding: 8, borderRadius: 20, borderColor: '#FFF', borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 5 },
});