import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Store, ShoppingCart, DollarSign, TrendingUp, TriangleAlert as AlertTriangle, Clock, MapPin, Star, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const getSystemStats = () => {
    switch (selectedPeriod) {
      case 'today':
        return {
          totalUsers: 12450,
          activeVendors: 85,
          totalOrders: 1280,
          revenue: 89500,
          avgDeliveryTime: 13,
          customerSatisfaction: 4.6,
        };
      case 'week':
        return {
          totalUsers: 12450,
          activeVendors: 85,
          totalOrders: 8960,
          revenue: 625000,
          avgDeliveryTime: 14,
          customerSatisfaction: 4.5,
        };
      case 'month':
        return {
          totalUsers: 12450,
          activeVendors: 85,
          totalOrders: 38400,
          revenue: 2680000,
          avgDeliveryTime: 15,
          customerSatisfaction: 4.4,
        };
      default:
        return {
          totalUsers: 12450,
          activeVendors: 85,
          totalOrders: 1280,
          revenue: 89500,
          avgDeliveryTime: 13,
          customerSatisfaction: 4.6,
        };
    }
  };

  const stats = getSystemStats();

  const statsCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users, 
      color: '#2563EB',
      change: '+245 today' 
    },
    { 
      title: 'Active Vendors', 
      value: stats.activeVendors, 
      icon: Store, 
      color: '#059669',
      change: '92% online' 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      icon: ShoppingCart, 
      color: '#F59E0B',
      change: '+12% vs yesterday' 
    },
    { 
      title: 'Revenue', 
      value: `₹${stats.revenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: '#EC4899',
      change: '+18% growth' 
    },
  ];

  const cityData = [
    { name: 'Gurgaon', users: 4500, vendors: 28, orders: 520 },
    { name: 'Delhi', users: 3200, vendors: 22, orders: 380 },
    { name: 'Mumbai', users: 2800, vendors: 18, orders: 340 },
    { name: 'Bangalore', users: 1950, vendors: 17, orders: 240 },
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'High order volume in Gurgaon - consider adding more vendors',
      time: '5 mins ago',
      icon: AlertTriangle,
      color: '#F59E0B',
    },
    {
      id: 2,
      type: 'info',
      message: 'New vendor application from Delhi requires approval',
      time: '12 mins ago',
      icon: Store,
      color: '#2563EB',
    },
    {
      id: 3,
      type: 'error',
      message: 'Payment gateway issue reported - investigating',
      time: '25 mins ago',
      icon: DollarSign,
      color: '#EF4444',
    },
  ];

  const topPerformers = [
    { name: 'Raj Kumar', city: 'Gurgaon', rating: 4.9, orders: 45 },
    { name: 'Suresh Sharma', city: 'Delhi', rating: 4.8, orders: 38 },
    { name: 'Amit Singh', city: 'Mumbai', rating: 4.7, orders: 32 },
    { name: 'Vikram Patel', city: 'Bangalore', rating: 4.6, orders: 28 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>AquaFlow Operations Center</Text>
          </View>
          
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.id as any)}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period.id && styles.periodTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsCards.map((stat, index) => (
            <LinearGradient
              key={index}
              colors={[stat.color, stat.color + '90']}
              style={styles.statCard}
            >
              <View style={styles.statHeader}>
                <stat.icon size={24} color="#FFF" />
                <Text style={styles.statChange}>{stat.change}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthContainer}>
            <View style={styles.healthRow}>
              <Activity size={20} color="#059669" />
              <Text style={styles.healthLabel}>System Status</Text>
              <Text style={styles.healthValue}>All Systems Operational</Text>
            </View>
            <View style={styles.healthRow}>
              <Clock size={20} color="#F59E0B" />
              <Text style={styles.healthLabel}>Avg Delivery Time</Text>
              <Text style={styles.healthValue}>{stats.avgDeliveryTime} minutes</Text>
            </View>
            <View style={styles.healthRow}>
              <Star size={20} color="#EC4899" />
              <Text style={styles.healthLabel}>Customer Satisfaction</Text>
              <Text style={styles.healthValue}>{stats.customerSatisfaction}/5</Text>
            </View>
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Alerts</Text>
          <View style={styles.alertsContainer}>
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={[styles.alertIcon, { backgroundColor: alert.color + '20' }]}>
                  <alert.icon size={20} color={alert.color} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* City Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>City Performance</Text>
          <View style={styles.cityContainer}>
            {cityData.map((city, index) => (
              <View key={index} style={styles.cityCard}>
                <View style={styles.cityHeader}>
                  <MapPin size={20} color="#2563EB" />
                  <Text style={styles.cityName}>{city.name}</Text>
                </View>
                <View style={styles.cityStats}>
                  <View style={styles.cityStat}>
                    <Text style={styles.cityStatValue}>{city.users}</Text>
                    <Text style={styles.cityStatLabel}>Users</Text>
                  </View>
                  <View style={styles.cityStat}>
                    <Text style={styles.cityStatValue}>{city.vendors}</Text>
                    <Text style={styles.cityStatLabel}>Vendors</Text>
                  </View>
                  <View style={styles.cityStat}>
                    <Text style={styles.cityStatValue}>{city.orders}</Text>
                    <Text style={styles.cityStatLabel}>Orders</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Vendors</Text>
          <View style={styles.performersContainer}>
            {topPerformers.map((performer, index) => (
              <View key={index} style={styles.performerCard}>
                <View style={styles.performerRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{performer.name}</Text>
                  <Text style={styles.performerCity}>{performer.city}</Text>
                </View>
                <View style={styles.performerStats}>
                  <View style={styles.performerStat}>
                    <Star size={14} color="#F59E0B" />
                    <Text style={styles.performerRating}>{performer.rating}</Text>
                  </View>
                  <Text style={styles.performerOrders}>{performer.orders} orders</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.actionCard}>
              <Users size={24} color="#2563EB" />
              <Text style={styles.actionTitle}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Store size={24} color="#059669" />
              <Text style={styles.actionTitle}>Approve Vendors</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={24} color="#F59E0B" />
              <Text style={styles.actionTitle}>View Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <AlertTriangle size={24} color="#EF4444" />
              <Text style={styles.actionTitle}>System Alerts</Text>
            </TouchableOpacity>
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
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#EA580C',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statChange: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  statTitle: {
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
  healthContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  healthLabel: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
    flex: 1,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#64748B',
  },
  cityContainer: {
    gap: 12,
  },
  cityCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  cityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cityStat: {
    alignItems: 'center',
  },
  cityStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  cityStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  performersContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  performerCity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  performerStats: {
    alignItems: 'flex-end',
  },
  performerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performerRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  performerOrders: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
});