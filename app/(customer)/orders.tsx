import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { useIsFocused } from '@react-navigation/native';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchOrders = async () => {
    const user = await authService.getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Fetch orders and join with the vendors table to get the vendor's name
    const { data, error } = await supabase
      .from('orders')
      .select('*, vendors ( name )') 
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  // Refetch orders whenever the screen comes into focus
  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchOrders();
    }
  }, [isFocused]);

  const renderStatus = (status: string) => {
    let color = '#64748B'; // Default color
    let text = status ? status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';

    switch (status) {
        case 'awaiting_acceptance':
            color = '#F59E0B'; // Amber
            break;
        case 'accepted':
        case 'out_for_delivery':
            color = '#3B82F6'; // Blue
            break;
        case 'delivered':
            color = '#16A34A'; // Green
            break;
        case 'assignment_failed':
        case 'rejected':
            color = '#EF4444'; // Red
            break;
    }
    
    return (
        <View style={[styles.statusBadge, { backgroundColor: color }]}>
            <Text style={styles.statusText}>{text}</Text>
        </View>
    );
  }

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.substring(0, 8)}...</Text>
        <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.orderDetails}>
        {renderStatus(item.status)}
        <Text style={styles.assignedVendor}>
          Supplier: {item.vendors?.name || 'Pending Assignment...'}
        </Text>
        {/* You would list order items here */}
        <Text style={styles.orderTotal}>Total: ₹{item.total}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.loadingIndicator} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>You have no orders yet.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  orderCard: { 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderId: { fontWeight: 'bold', color: '#334155' },
  orderDate: { color: '#64748B' },
  orderDetails: {
    gap: 8,
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 999, // Pill shape
    alignSelf: 'flex-start',
  },
  statusText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: 'bold',
  },
  assignedVendor: { 
    fontSize: 14,
    color: '#475569',
  },
  orderTotal: { 
    fontWeight: 'bold', 
    marginTop: 8, 
    textAlign: 'right',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  }
});