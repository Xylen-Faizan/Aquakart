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
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// FIX: Import Animated from reanimated
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, MapPin, ShoppingCart, ChevronDown, X, Droplets } from 'lucide-react-native';

// Lazy-load maps for web compatibility
let MapView: any = () => <View style={styles.mapLoadingContainer}><Text>Map not available on web.</Text></View>;
let Marker: any = (props: any) => <View {...props} />;
if (Platform.OS !== 'web') {
  const RNativeMaps = require('react-native-maps');
  MapView = RNativeMaps.default;
  Marker = RNativeMaps.Marker;
}

import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';
import { locationService } from '@/lib/location';
import { LocationCoords } from '@/lib/types/location';
import { authService } from '@/lib/auth';
import { Product, Vendor } from '@/types';
import ProductRow from '@/components/ProductRow';
// FIX: Import your design system tokens, including commonStyles
import { colors, spacing, typography, borderRadius, shadows, commonStyles } from '@/src/design-system';

// FIX: Update interface to correctly handle the optional 'rating' property
interface ProductWithVendors extends Product {
    availableVendors: Vendor[];
    rating: number;
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
    const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('name');

    const fetchData = async () => {
        try {
            const [productRes, vendorRes, vendorProductRes, locationData] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('vendors').select('*'),
                supabase.from('vendor_products').select('vendor_id, product_id'),
                locationService.getCurrentLocation()
            ]);

            const products = (productRes.data as Product[]) || [];
            const vendors = (vendorRes.data as Vendor[]) || [];
            const vendorProducts = vendorProductRes.data || [];
            setAllVendors(vendors);

            const vendorMap = new Map(vendors.map(v => [v.id, v]));

            const combinedData: ProductWithVendors[] = products.map(product => {
                const vendorIds = vendorProducts.filter(vp => vp.product_id === product.id).map(vp => vp.vendor_id);
                const availableVendors = vendorIds.map(vid => vendorMap.get(vid)).filter((v): v is Vendor => v !== undefined);
                const rating = Math.random() * (5 - 3.5) + 3.5;
                return { ...product, availableVendors, rating: parseFloat(rating.toFixed(1)) };
            }).filter(p => p.availableVendors.length > 0);

            setProductsWithVendors(combinedData);

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
        // ... (this function remains the same)
    };
  
    const sortedAndFilteredProducts = productsWithVendors
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    const renderSortButton = (title: string, value: 'price' | 'rating' | 'name') => {
        const isActive = sortBy === value;
        return (
            <TouchableOpacity 
                onPress={() => setSortBy(value)} 
                style={[styles.filterButton, isActive && styles.activeFilter]}
            >
                <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topHeader}>
                <TouchableOpacity style={styles.locationContainer} onPress={() => setIsMapVisible(true)}>
                    <MapPin size={20} color={colors.textSecondary} />
                    <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
                    <ChevronDown size={16} color={colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartIconContainer} onPress={() => setIsCartVisible(true)}>
                    {totalItems > 0 && (<View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>)}
                    <ShoppingCart size={28} color={colors.textPrimary} />
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
                                <Search style={styles.searchIcon} color={colors.textTertiary} size={20} />
                                <TextInput
                                    placeholder="Search for a water brand..."
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    style={styles.searchInput}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>
                        </Animated.View>
                        
                        <View style={styles.filterContainer}>
                            {renderSortButton('Name', 'name')}
                            {renderSortButton('Price', 'price')}
                            {renderSortButton('Rating', 'rating')}
                        </View>

                        <View style={styles.mainContent}>
                            <Text style={styles.resultsTitle}>Available Products</Text>
                        </View>
                    </>
                }
                data={sortedAndFilteredProducts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => {
                    // FIX: Ensure the product passed to ProductRow matches the expected type
                    const productForRender: Product = {
                        ...item,
                        rating: item.rating || 0,
                    };
                    return (
                        <ProductRow
                            product={productForRender}
                            availableVendors={item.availableVendors}
                            isFavorite={favorites.includes(item.id)}
                            onToggleFavorite={handleToggleFavorite}
                            index={index}
                        />
                    );
                }}
                ListEmptyComponent={!isLoading ? 
                    <View style={styles.emptyContainer}>
                        <Search size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>No Products Found</Text>
                    </View> 
                : null}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
            />
      
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
    container: { flex: 1, backgroundColor: colors.background },
    topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    locationText: { ...commonStyles.text.body, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    cartIconContainer: { padding: spacing.sm },
    cartBadge: { position: 'absolute', right: -4, top: -4, backgroundColor: colors.error, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.background, zIndex: 1 },
    cartBadgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
    header: { padding: spacing.lg, paddingTop: spacing.sm, alignItems: 'center' },
    title: { ...commonStyles.text.h2, color: colors.textPrimary },
    titleHighlight: { color: colors.primary },
    searchSection: { paddingHorizontal: spacing.lg, marginVertical: spacing.sm },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.xl, ...shadows.md },
    searchIcon: { position: 'absolute', left: spacing.lg, zIndex: 1 },
    searchInput: { flex: 1, ...commonStyles.input, borderWidth: 0, paddingLeft: spacing.xl + spacing.lg, backgroundColor: 'transparent' },
    mainContent: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
    resultsTitle: { ...commonStyles.text.h4, color: colors.textPrimary, marginBottom: spacing.sm },
    listContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyText: { ...commonStyles.text.body, color: colors.textSecondary, marginTop: spacing.md },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'], height: '85%', paddingTop: spacing.sm },
    mapContainer: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    mapCloseButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: spacing.sm, borderRadius: 20 },
    mapLoadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
    markerContainer: { backgroundColor: colors.primary, padding: spacing.sm, borderRadius: 20, borderColor: colors.white, borderWidth: 2, ...shadows.md },
    
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: spacing.lg,
        marginVertical: spacing.md,
        gap: spacing.md,
    },
    filterButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        ...shadows.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeFilter: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
    },
    filterText: {
        ...commonStyles.text.body,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
    },
    activeFilterText: {
        color: colors.white,
    },
});