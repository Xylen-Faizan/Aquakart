import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, Clock, CircleCheck as CheckCircle, Truck, Navigation } from 'lucide-react-native';

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');

  const pendingOrders = [
    {
      id: 1,
      customer: 'John Doe',
      phone: '+91 9876543210',
      items: [{ name: 'Aquafina', quantity: 1, size: '20L' }],
      amount: 65,
      address: '123 Main Street, Sector 14, Gurgaon',
      orderTime: '2:30 PM',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      id: 2,
      customer: 'Sarah Wilson',
      phone: '+91 9876543211',
      items: [{ name: 'Bisleri', quantity: 1, size: '20L' }],
      amount: 85,
      address: '456 Oak Avenue, DLF Phase 1, Gurgaon',
      orderTime: '2:45 PM',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const activeOrders = [
    {
      id: 3,
      customer: 'Mike Johnson',
      phone: '+91 9876543212',
      items: [{ name: 'Aquafina', quantity: 1, size: '1L' }],
      amount: 22,
      address: '789 Pine Road, Golf Course Road, Gurgaon',
      orderTime: '1:15 PM',
      acceptedTime: '1:18 PM',
      avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const completedOrders = [
    {
      id: 4,
      customer: 'Lisa Chen',
      phone: '+91 9876543213',
      items: [{ name: 'Aquafina', quantity: 1, size: '20L' }],
      amount: 65,
      address: '321 Elm Street, Cyber City, Gurgaon',
      orderTime: '12:00 PM',
      deliveredTime: '12:15 PM',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const handleAcceptOrder = (orderId: number) => {
    console.log('Accept order', orderId);
  };

  const handleRejectOrder = (orderId: number) => {
    console.log('Reject order', orderId);
  };

  const handleMarkDelivered = (orderId: number) => {
    console.log('Mark as delivered', orderId);
  };

  const renderPendingOrder = (order: any) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: order.avatar }} style={styles.customerAvatar} />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customer}</Text>
          <Text style={styles.orderTime}>Ordered at {order.orderTime}</Text>
        </View>
        <TouchableOpacity style={styles.phoneButton}>
          <Phone size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.orderDetails}>
        {order.items.map((item: any, index: number) => (
          <Text key={index} style={styles.orderItem}>
            {item.quantity}x {item.name} {item.size}
          </Text>
        ))}
      </View>

      <View style={styles.addressContainer}>
        <MapPin size={16} color="#64748B" />
        <Text style={styles.address}>{order.address}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{order.amount}</Text>
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectOrder(order.id)}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptOrder(order.id)}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderActiveOrder = (order: any) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: order.avatar }} style={styles.customerAvatar} />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customer}</Text>
          <Text style={styles.orderTime}>Accepted at {order.acceptedTime}</Text>
        </View>
        <TouchableOpacity style={styles.phoneButton}>
          <Phone size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.orderDetails}>
        {order.items.map((item: any, index: number) => (
          <Text key={index} style={styles.orderItem}>
            {item.quantity}x {item.name} {item.size}
          </Text>
        ))}
      </View>

      <View style={styles.addressContainer}>
        <MapPin size={16} color="#64748B" />
        <Text style={styles.address}>{order.address}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{order.amount}</Text>
        <View style={styles.activeOrderActions}>
          <TouchableOpacity style={styles.navigateButton}>
            <Navigation size={16} color="#FFF" />
            <Text style={styles.navigateText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deliveredButton}
            onPress={() => handleMarkDelivered(order.id)}
          >
            <CheckCircle size={16} color="#FFF" />
            <Text style={styles.deliveredText}>Mark Delivered</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCompletedOrder = (order: any) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: order.avatar }} style={styles.customerAvatar} />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customer}</Text>
          <Text style={styles.orderTime}>Delivered at {order.deliveredTime}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {order.rating}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        {order.items.map((item: any, index: number) => (
          <Text key={index} style={styles.orderItem}>
            {item.quantity}x {item.name} {item.size}
          </Text>
        ))}
      </View>

      <View style={styles.addressContainer}>
        <MapPin size={16} color="#64748B" />
        <Text style={styles.address}>{order.address}</Text>
      </View>

      <View style={styles.completedFooter}>
        <Text style={styles.orderAmount}>₹{order.amount}</Text>
        <View style={styles.completedBadge}>
          <CheckCircle size={16} color="#059669" />
          <Text style={styles.completedText}>Delivered</Text>
        </View>
      </View>
    </View>
  );

  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'active':
        return activeOrders;
      case 'completed':
        return completedOrders;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending ({pendingOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Completed ({completedOrders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ordersContainer}>
          {activeTab === 'pending' && getCurrentOrders().map(renderPendingOrder)}
          {activeTab === 'active' && getCurrentOrders().map(renderActiveOrder)}
          {activeTab === 'completed' && getCurrentOrders().map(renderCompletedOrder)}
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
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  ordersContainer: {
    padding: 20,
    gap: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  phoneButton: {
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 8,
  },
  ratingContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  activeOrderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  navigateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  deliveredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  deliveredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  completedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});