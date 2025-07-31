import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CircleCheck as CheckCircle, Truck, MapPin, Phone, Star } from 'lucide-react-native';

export default function CustomerOrders() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const activeOrders = [
    {
      id: 1,
      brandName: 'Aquafina',
      quantity: 1,
      size: '20L',
      price: 65,
      status: 'On the way',
      deliveryTime: '8 mins',
      vendorName: 'Raj Kumar',
      vendorPhone: '+91 9876543210',
      orderTime: '2:30 PM',
      image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const completedOrders = [
    {
      id: 2,
      brandName: 'Bisleri',
      quantity: 1,
      size: '20L',
      price: 85,
      status: 'Delivered',
      deliveryTime: '12 mins',
      vendorName: 'Suresh Sharma',
      orderTime: 'Yesterday, 4:15 PM',
      rating: 4.5,
      image: 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      id: 3,
      brandName: 'Aquafina',
      quantity: 1,
      size: '1L',
      price: 22,
      status: 'Delivered',
      deliveryTime: '15 mins',
      vendorName: 'Amit Singh',
      orderTime: '2 days ago',
      rating: 5.0,
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On the way':
        return <Truck size={20} color="#F59E0B" />;
      case 'Delivered':
        return <CheckCircle size={20} color="#059669" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On the way':
        return '#F59E0B';
      case 'Delivered':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        
        <View style={styles.tabContainer}>
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
        {activeTab === 'active' ? (
          <View style={styles.ordersContainer}>
            {activeOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderStatus}>
                    {getStatusIcon(order.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status}
                    </Text>
                  </View>
                  <Text style={styles.orderTime}>{order.orderTime}</Text>
                </View>

                <View style={styles.orderContent}>
                  <Image source={{ uri: order.image }} style={styles.orderImage} />
                  <View style={styles.orderDetails}>
                    <Text style={styles.brandName}>{order.brandName}</Text>
                    <Text style={styles.orderInfo}>
                      {order.quantity} x {order.size}
                    </Text>
                    <Text style={styles.price}>₹{order.price}</Text>
                    
                    <View style={styles.deliveryInfo}>
                      <Clock size={16} color="#059669" />
                      <Text style={styles.deliveryTime}>ETA: {order.deliveryTime}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.vendorInfo}>
                  <View style={styles.vendorDetails}>
                    <Text style={styles.vendorName}>{order.vendorName}</Text>
                    <Text style={styles.vendorLabel}>Delivery Partner</Text>
                  </View>
                  <TouchableOpacity style={styles.callButton}>
                    <Phone size={16} color="#FFF" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.trackButton}>
                  <MapPin size={16} color="#FFF" />
                  <Text style={styles.trackButtonText}>Track Order</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {completedOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderStatus}>
                    {getStatusIcon(order.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status}
                    </Text>
                  </View>
                  <Text style={styles.orderTime}>{order.orderTime}</Text>
                </View>

                <View style={styles.orderContent}>
                  <Image source={{ uri: order.image }} style={styles.orderImage} />
                  <View style={styles.orderDetails}>
                    <Text style={styles.brandName}>{order.brandName}</Text>
                    <Text style={styles.orderInfo}>
                      {order.quantity} x {order.size}
                    </Text>
                    <Text style={styles.price}>₹{order.price}</Text>
                    
                    <View style={styles.deliveryInfo}>
                      <Text style={styles.deliveryTime}>Delivered by {order.vendorName}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.ratingContainer}>
                  <View style={styles.ratingInfo}>
                    <Star size={16} color="#F59E0B" />
                    <Text style={styles.ratingText}>{order.rating}</Text>
                  </View>
                  <TouchableOpacity style={styles.reorderButton}>
                    <Text style={styles.reorderButtonText}>Reorder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    backgroundColor: '#2563EB',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderTime: {
    fontSize: 12,
    color: '#64748B',
  },
  orderContent: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderDetails: {
    flex: 1,
    gap: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  orderInfo: {
    fontSize: 14,
    color: '#64748B',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  vendorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorDetails: {
    gap: 2,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  vendorLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reorderButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reorderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});