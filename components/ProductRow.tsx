import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Product, Vendor } from '@/types';
import { Star, Clock, Plus, Minus, Heart, Zap, Award, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import Animated, { FadeInUp, Layout, Easing } from 'react-native-reanimated';

// A small card to show a supplier for a specific product
const SupplierChoice = ({ vendor, product }: { vendor: Vendor, product: Product }) => {
    const { cart, addToCart, updateQuantity } = useCart();
    const cartItem = cart.find(item => item.id === product.id && item.vendor_id === vendor.id);
    const quantity = cartItem?.quantity || 0;
    
    // Add product with the selected vendor_id to the cart
    const handleAddToCart = () => {
        addToCart({ ...product, vendor_id: vendor.id });
    };

    return (
        <View style={styles.supplierCard}>
            <Image source={{ uri: vendor.logo_url || 'https://via.placeholder.com/40' }} style={styles.supplierLogo} />
            <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{vendor.name}</Text>
                <View style={styles.supplierTags}>
                    <View style={styles.tag}><Star size={12} color="#F59E0B"/><Text style={styles.tagText}>{vendor.rating || 'N/A'}</Text></View>
                    <View style={styles.tag}><Clock size={12} color="#3B82F6"/><Text style={styles.tagText}>{vendor.delivery_time_range || 'N/A'}</Text></View>
                    <View style={styles.tag}><Award size={12} color="#16A34A"/><Text style={styles.tagText}>{(vendor as any).purity_score || '100'}% Pure</Text></View>
                </View>
            </View>
            {quantity === 0 ? (
              <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                <Text style={styles.addButtonText}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity onPress={() => updateQuantity(product.id, quantity - 1)} style={styles.quantityButton}><Minus size={16} color="#3B82F6" /></TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(product.id, quantity + 1)} style={styles.quantityButton}><Plus size={16} color="#3B82F6" /></TouchableOpacity>
              </View>
            )}
        </View>
    );
};

interface ProductRowProps {
  product: Product;
  availableVendors: Vendor[];
  isFavorite: boolean;
  onToggleFavorite: (productId: string, isCurrentlyFavorite: boolean) => void;
  index: number;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, availableVendors, isFavorite, onToggleFavorite, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Default to the fastest supplier
    const defaultSupplier = availableVendors.sort((a, b) => 
        (a.delivery_time_range?.split('-')[0] || '0') > (b.delivery_time_range?.split('-')[0] || '0') ? 1 : -1
    )[0];

    return (
        <Animated.View 
            style={styles.container} 
            entering={FadeInUp.delay(index * 100).duration(400)}
            layout={Layout.easing(Easing.inOut(Easing.ease))}
        >
            <View style={styles.mainRow}>
                <Image source={{ uri: product.image_url || 'https://via.placeholder.com/64' }} style={styles.productImage} />
                <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSize}>{product.size}</Text>
                    <Text style={styles.productPrice}>₹{product.price}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton} onPress={() => onToggleFavorite(product.id, isFavorite)}>
                    <Heart size={20} color={isFavorite ? "#EF4444" : "#94A3B8"} fill={isFavorite ? "#EF4444" : "none"} />
                </TouchableOpacity>
            </View>
            
            {/* Default Supplier View */}
            {defaultSupplier && <SupplierChoice vendor={defaultSupplier} product={product} />}
            
            {/* Expander to see more suppliers */}
            {availableVendors.length > 1 && (
                <TouchableOpacity style={styles.expander} onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.expanderText}>
                        {isExpanded ? 'Show less' : `See ${availableVendors.length - 1} more suppliers`}
                    </Text>
                    {isExpanded ? <ChevronUp size={16} color="#3B82F6" /> : <ChevronDown size={16} color="#3B82F6" />}
                </TouchableOpacity>
            )}
            
            {/* Expanded List of other suppliers */}
            {isExpanded && availableVendors.slice(1).map(vendor => (
                <SupplierChoice key={vendor.id} vendor={vendor} product={product} />
            ))}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        marginBottom: 16, 
        padding: 12, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 4, 
        elevation: 2 
    },
    mainRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    productImage: { 
        width: 64, 
        height: 64, 
        borderRadius: 8, 
        resizeMode: 'contain' 
    },
    productDetails: { 
        flex: 1, 
        marginLeft: 12 
    },
    productName: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1E293B' 
    },
    productSize: { 
        fontSize: 14, 
        color: '#64748B' 
    },
    productPrice: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E293B', 
        marginTop: 4 
    },
    favoriteButton: { 
        padding: 8 
    },
    supplierCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F8FAFC', 
        borderRadius: 8, 
        padding: 8, 
        marginTop: 12 
    },
    supplierLogo: { 
        width: 40, 
        height: 40, 
        borderRadius: 20 
    },
    supplierInfo: { 
        flex: 1, 
        marginLeft: 8 
    },
    supplierName: { 
        fontSize: 14, 
        fontWeight: '600' 
    },
    supplierTags: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 6, 
        marginTop: 4 
    },
    tag: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 2 
    },
    tagText: { 
        fontSize: 11, 
        color: '#475569' 
    },
    addButton: { 
        backgroundColor: '#2563EB', 
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderRadius: 8 
    },
    addButtonText: { 
        color: '#FFF', 
        fontWeight: 'bold' 
    },
    quantityControl: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#EFF6FF', 
        borderRadius: 8 
    },
    quantityButton: { 
        padding: 8 
    },
    quantityText: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#1E3A8A', 
        minWidth: 24, 
        textAlign: 'center' 
    },
    expander: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 4, 
        paddingTop: 12 
    },
    expanderText: { 
        color: '#3B82F6', 
        fontWeight: '500' 
    },
});

export default ProductRow;
