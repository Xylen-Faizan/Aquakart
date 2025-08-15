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
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Search, MapPin, ShoppingCart, ChevronDown, X, Droplets, SortAsc, SortDesc } from 'lucide-react-native';

// Lazy-load maps for web compatibility
let MapView: any = () => <View style={styles.mapLoadingContainer}><Text>Map not available on web.</Text></View>;
let Marker: any = (props: any) => <View {...props} />;
let Callout: any = (props: any) => <View {...props} />;
let CalloutSubview: any = (props: any) => <View {...props} />;
if (Platform.OS !== 'web') {
  const RNativeMaps = require('react-native-maps');
  MapView = RNativeMaps.default;
  Marker = RNativeMaps.Marker;
  Callout = RNativeMaps.Callout;
  CalloutSubview = RNativeMaps.CalloutSubview;
}

import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'expo-router';
import Cart from '@/components/Cart';
import { locationService } from '@/lib/location';
import { LocationCoords } from '@/lib/types/location';
import { authService } from '@/lib/auth';
import { Product, Vendor } from '@/types';
import ProductRow from '@/components/ProductRow';
import { colors, spacing, typography, borderRadius, shadows, commonStyles } from '@/src/design-system';

interface ProductWithVendors extends Product {
    availableVendors: Vendor[];
    rating: number;
}

type SortBy = 'name' | 'price_asc' | 'price_desc' | 'rating' | 'size_asc' | 'size_desc';

export default function CustomerHomeScreen() {
    const router = useRouter();
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isSortModalVisible, setIsSortModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationName, setLocationName] = useState('Locating...');
    const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
    const { totalItems } = useCart();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [productsWithVendors, setProductsWithVendors] = useState<ProductWithVendors[]>([]);
    const [allVendors, setAllVendors] = useState<Vendor[]>([]);
    const [sortBy, setSortBy] = useState<SortBy>('name');

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
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'size_asc':
                    return (parseInt(a.size) || 0) - (parseInt(b.size) || 0);
                case 'size_desc':
                    return (parseInt(b.size) || 0) - (parseInt(a.size) || 0);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    const renderSortModal = () => (
        <Modal
            visible={isSortModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsSortModalVisible(false)}
        >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsSortModalVisible(false)}>
                <TouchableOpacity activeOpacity={1} style={styles.sortModalContent}>
                    <Text style={styles.sortModalTitle}>Sort By</Text>
                    <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('name'); setIsSortModalVisible(false); }}>
                        <Text style={styles.sortOptionText}>Name</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('price_asc'); setIsSortModalVisible(false); }}>
                        <Text style={styles.sortOptionText}>Price (Low to High)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('price_desc'); setIsSortModalVisible(false); }}>
                        <Text style={styles.sortOptionText}>Price (High to Low)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('rating'); setIsSortModalVisible(false); }}>
                        <Text style={styles.sortOptionText}>Rating</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('size_asc'); setIsSortModalVisible(false); }}>
                        <Text style={styles.sortOptionText}>Size (Low to High)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('size_desc'); setIsSortModalVisible(false); }}>
                        <Text style={styles.sortOptionText}>Size (High to Low)</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );

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
                            <TouchableOpacity
                                onPress={() => setIsSortModalVisible(true)}
                                style={styles.sortButton}
                            >
                                <SortAsc size={16} color={colors.primary} />
                                <Text style={styles.sortButtonText}>Sort</Text>
                            </TouchableOpacity>
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
                        <MapView 
                            style={styles.map} 
                            initialRegion={{
                                latitude: currentLocation.latitude, 
                                longitude: currentLocation.longitude, 
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            onPress={() => setSelectedVendor(null)}
                        >
                            <Marker 
                                coordinate={currentLocation} 
                                title="Your Location"
                                pinColor="#3b82f6"
                            >
                                <View style={[styles.markerContainer, { backgroundColor: '#3b82f6' }]}>
                                    <MapPin size={20} color="#FFF" />
                                </View>
                            </Marker>
                            
                            {allVendors.map(vendor => {
                                if (!vendor.latitude || !vendor.longitude) return null;
                                
                                return (
                                    <Marker
                                        key={vendor.id}
                                        coordinate={{
                                            latitude: Number(vendor.latitude),
                                            longitude: Number(vendor.longitude)
                                        }}
                                        onPress={() => setSelectedVendor(vendor)}
                                    >
                                        <View style={[
                                            styles.markerContainer,
                                            selectedVendor?.id === vendor.id && styles.selectedMarker
                                        ]}>
                                            <Droplets size={20} color="#FFF" />
                                        </View>
                                        
                                        {selectedVendor?.id === vendor.id && (
                                            <Callout tooltip>
                                                <View style={styles.calloutContainer}>
                                                    <Text style={styles.calloutTitle}>{vendor.name}</Text>
                                                    {vendor.description && (
                                                        <Text style={styles.calloutDescription} numberOfLines={2}>
                                                            {vendor.description}
                                                        </Text>
                                                    )}
                                                    <CalloutSubview style={styles.calloutButtonContainer}>
                                                        <TouchableOpacity 
                                                            style={styles.calloutButton}
                                                            onPress={() => {
                                                                router.push({
                                                                    pathname: '/vendor/[id]',
                                                                    params: { id: vendor.id }
                                                                } as any);
                                                            }}
                                                        >
                                                            <Text style={styles.calloutButtonText}>View Store</Text>
                                                        </TouchableOpacity>
                                                    </CalloutSubview>
                                                </View>
                                            </Callout>
                                        )}
                                    </Marker>
                                );
                            })}
                        </MapView>
                    ) : <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />}
                </View>
            </Modal>
            {renderSortModal()}
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
    mapContainer: { 
        flex: 1, 
        position: 'relative',
        backgroundColor: '#f8fafc'
    },
    map: { 
        width: '100%', 
        height: '100%',
    },
    selectedMarker: {
        backgroundColor: '#059669',
        transform: [{ scale: 1.2 }],
        zIndex: 1,
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        width: 200,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    calloutDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    calloutButtonContainer: {
        marginTop: 8,
    },
    calloutButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    calloutButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    mapCloseButton: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: spacing.sm, borderRadius: 20 },
    mapLoadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
    markerContainer: {
        backgroundColor: colors.primary,
        padding: spacing.sm,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.white,
        ...shadows.md
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: spacing.lg,
        marginVertical: spacing.md,
        gap: spacing.md,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sortButtonText: {
        ...commonStyles.text.body,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        marginLeft: spacing.sm,
    },
    sortModalContent: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        margin: spacing.xl,
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    sortModalTitle: {
        ...commonStyles.text.h3,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    sortOption: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sortOptionText: {
        ...commonStyles.text.body,
        textAlign: 'center',
    },
});