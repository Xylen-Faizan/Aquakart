import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '@/types'; // Import Product type
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { useIsFocused } from '@react-navigation/native';

export default function FavoritesScreen() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const { totalItems } = useCart();
  const isFocused = useIsFocused(); // Hook to refetch when screen is viewed

  const fetchFavorites = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setFavoriteProducts([]);
        return;
      };

      const { data, error } = await supabase
        .from('favorites')
        .select('products(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // --- FIX START ---
      // This is a safer way to process the nested data from Supabase
      // and avoids the TypeScript errors.
      if (data) {
        const validProducts: Product[] = [];
        for (const item of data) {
          // Check if 'products' exists, is an object, and not an array
          if (item.products && typeof item.products === 'object' && !Array.isArray(item.products)) {
            validProducts.push(item.products as Product);
          }
        }
        setFavoriteProducts(validProducts);
      }
      // --- FIX END ---

    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      fetchFavorites();
    }
  }, [isFocused]);

  const handleToggleFavorite = async (productId: string) => {
    const user = await authService.getCurrentUser();
    if (!user) return;
    
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
    await supabase.from('favorites').delete().match({ user_id: user.id, product_id: productId });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Favorites</Text>
          <TouchableOpacity style={styles.cartIconContainer} onPress={() => setIsCartVisible(true)}>
            {totalItems > 0 && (
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems}</Text></View>
            )}
            <ShoppingCart size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <ActivityIndicator style={{flex: 1}} size="large" color="#EF4444" />
      ) : favoriteProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={48} color="#E5E7EB" />
          <Text style={styles.emptyStateText}>No favorites yet.</Text>
          <Text style={styles.emptyStateSubtext}>Tap the heart on a product to save it here.</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFavorites} />}
        >
          <View style={styles.productsGrid}>
            {favoriteProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </View>
        </ScrollView>
      )}
      
      {/* Cart Modal */}
      <Modal visible={isCartVisible} transparent={true} animationType="slide" onRequestClose={() => setIsCartVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsCartVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
             <Cart onClose={() => setIsCartVisible(false)} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  cartIconContainer: { padding: 4 },
  cartBadge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#FFF', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#EF4444' },
  cartBadgeText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  productsGrid: { gap: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#64748B', textAlign: 'center', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', },
  modalContent: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', paddingTop: 8, },
});
