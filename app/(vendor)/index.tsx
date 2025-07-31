import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Power, Clock, DollarSign, Package, TrendingUp, TriangleAlert as AlertTriangle, MapPin, Star, Bell } from 'lucide-react-native';

export default function VendorDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);

  const todayStats = {
    orders: 24,
    earnings: 1850,
    avgDeliveryTime: 12,
    rating: 4.7,
  };

  const quickStats = [
    { label: 'Orders Today', value: todayStats.orders, icon: Package, color: '#2563EB' },
    { label: 'Earnings', value: `₹${todayStats.earnings}`, icon: DollarSign, color: '#059669' },
    { label: 'Avg Time', value: `${todayStats.avgDeliveryTime}m`, icon: Clock, color: '#F59E0B' },
    { label: 'Rating', value: todayStats.rating, icon: Star, color: '#EC4899' },
  ];

  const recentOrders = [
    {
      id: 1,
      customer: 'John Doe',
      items: '1x Aquafina 20L Jar',
      amount: 65,
      address: 'Sector 14, Gurgaon',
      time: '2 mins ago',
      status: 'new',
    },
    {
      id: 2,
      customer: 'Sarah Wilson',
      items: '1x Bisleri 20L Jar',
      amount: 85,
      address: 'DLF Phase 1',
      time: '5 mins ago',
      status: 'accepted',
    },
    {
      id: 3,
      customer: 'Mike Johnson',
      items: '1x Aquafina 1L Bottle',
      amount: 22,
      address: 'Golf Course Road',
      time: '8 mins ago',
      status: 'delivering',
    },
  ];

  const inventory = [
    { brand: 'Aquafina 20L', stock: 5, lowStock: true },
    { brand: 'Aquafina 1L', stock: 12, lowStock: false },
    { brand: 'Bisleri 20L', stock: 3, lowStock: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#EF4444';
      case 'accepted': return '#F59E0B';
      case 'delivering': return '#2563EB';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'accepted': return 'Accepted';
      case 'delivering': return 'Delivering';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.vendorName}>Raj Kumar</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={24} color="#1E293B" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.onlineToggle}>
            <View style={styles.toggleInfo}>
              <Power size={20} color={isOnline ? '#059669' : '#6B7280'} />
              <Text style={styles.toggleText}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
              thumbColor={isOnline ? '#059669' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <LinearGradient
              key={index}
              colors={[stat.color, stat.color + '90']}
              style={styles.statCard}
            >
              <stat.icon size={24} color="#FFF" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <View style={styles.ordersList}>
            {recentOrders.map((order) => (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.customerName}>{order.customer}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.orderItems}>{order.items}</Text>
                
                <View style={styles.orderFooter}>
                  <View style={styles.addressContainer}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.orderAddress}>{order.address}</Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderAmount}>₹{order.amount}</Text>
                    <Text style={styles.orderTime}>{order.time}</Text>
                  </View>
                </View>
                
                {order.status === 'new' && (
                  <View style={styles.orderActions}>
                    <TouchableOpacity style={styles.rejectButton}>
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptButton}>
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Inventory Status */}
        <View style={styles.section}>
          <View style={styles.inventoryHeader}>
            <Text style={styles.sectionTitle}>Inventory Status</Text>
            <TouchableOpacity 
              style={styles.lowStockToggle}
              onPress={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle size={16} color="#EF4444" />
              <Text style={styles.lowStockText}>Low Stock</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inventoryGrid}>
            {inventory
              .filter(item => !showLowStock || item.lowStock)
              .map((item, index) => (
                <View key={index} style={styles.inventoryCard}>
                  <Text style={styles.brandName}>{item.brand}</Text>
                  <Text style={[
                    styles.stockCount,
                    item.lowStock && styles.lowStockCount
                  ]}>
                    {item.stock} bottles
                  </Text>
                  {item.lowStock && (
                    <View style={styles.lowStockBadge}>
                      <AlertTriangle size={12} color="#EF4444" />
                      <Text style={styles.lowStockLabel}>Low Stock</Text>
                    </View>
                  )}
                </View>
              ))}
          </View>
        </View>

        {/* Today's Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Orders Completed</Text>
              <Text style={styles.performanceValue}>18/24</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Average Rating</Text>
              <Text style={styles.performanceValue}>4.7 ⭐</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>On-Time Delivery</Text>
              <Text style={styles.performanceValue}>94%</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.performanceLabel}>Tips Earned</Text>
              <Text style={styles.performanceValue}>₹145</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
  },
  vendorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  onlineToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  orderItems: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  orderAddress: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  orderTime: {
    fontSize: 12,
    color: '#64748B',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lowStockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lowStockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inventoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  stockCount: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  lowStockCount: {
    color: '#EF4444',
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lowStockLabel: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
});