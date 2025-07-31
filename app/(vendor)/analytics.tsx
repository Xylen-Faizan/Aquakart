import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, TrendingUp, Clock, Star, DollarSign, Package } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function VendorAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const getAnalyticsData = () => {
    switch (selectedPeriod) {
      case 'today':
        return {
          earnings: 1850,
          orders: 24,
          avgDeliveryTime: 12,
          rating: 4.7,
          completionRate: 96,
          tips: 145,
        };
      case 'week':
        return {
          earnings: 12500,
          orders: 168,
          avgDeliveryTime: 13,
          rating: 4.6,
          completionRate: 94,
          tips: 980,
        };
      case 'month':
        return {
          earnings: 45000,
          orders: 620,
          avgDeliveryTime: 14,
          rating: 4.5,
          completionRate: 92,
          tips: 3200,
        };
      default:
        return {
          earnings: 1850,
          orders: 24,
          avgDeliveryTime: 12,
          rating: 4.7,
          completionRate: 96,
          tips: 145,
        };
    }
  };

  const data = getAnalyticsData();

  const statsCards = [
    { 
      title: 'Total Earnings', 
      value: `₹${data.earnings}`, 
      icon: DollarSign, 
      color: '#059669',
      change: '+12%' 
    },
    { 
      title: 'Orders Completed', 
      value: data.orders, 
      icon: Package, 
      color: '#2563EB',
      change: '+8%' 
    },
    { 
      title: 'Avg Delivery Time', 
      value: `${data.avgDeliveryTime}m`, 
      icon: Clock, 
      color: '#F59E0B',
      change: '-2m' 
    },
    { 
      title: 'Average Rating', 
      value: data.rating, 
      icon: Star, 
      color: '#EC4899',
      change: '+0.1' 
    },
  ];

  const performanceMetrics = [
    { label: 'Order Completion Rate', value: `${data.completionRate}%`, color: '#059669' },
    { label: 'Customer Rating', value: `${data.rating}/5`, color: '#F59E0B' },
    { label: 'Tips Earned', value: `₹${data.tips}`, color: '#2563EB' },
    { label: 'Repeat Customers', value: '68%', color: '#EC4899' },
  ];

  const timeSlotData = [
    { time: '9-12 AM', orders: 8, earnings: 580 },
    { time: '12-3 PM', orders: 12, earnings: 890 },
    { time: '3-6 PM', orders: 6, earnings: 420 },
    { time: '6-9 PM', orders: 10, earnings: 750 },
  ];

  const topCustomers = [
    { name: 'John Doe', orders: 12, amount: 840 },
    { name: 'Sarah Wilson', orders: 8, amount: 560 },
    { name: 'Mike Johnson', orders: 6, amount: 420 },
    { name: 'Lisa Chen', orders: 5, amount: 350 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsContainer}>
            {performanceMetrics.map((metric, index) => (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={[styles.metricValue, { color: metric.color }]}>
                    {metric.value}
                  </Text>
                </View>
                <View style={styles.metricBar}>
                  <View
                    style={[
                      styles.metricProgress,
                      { 
                        backgroundColor: metric.color,
                        width: metric.label === 'Order Completion Rate' ? '96%' :
                              metric.label === 'Customer Rating' ? '94%' :
                              metric.label === 'Tips Earned' ? '75%' : '68%'
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Time Slot Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peak Hours Analysis</Text>
          <View style={styles.timeSlotContainer}>
            {timeSlotData.map((slot, index) => (
              <View key={index} style={styles.timeSlotCard}>
                <Text style={styles.timeSlotTime}>{slot.time}</Text>
                <View style={styles.timeSlotStats}>
                  <View style={styles.timeSlotStat}>
                    <Text style={styles.timeSlotNumber}>{slot.orders}</Text>
                    <Text style={styles.timeSlotLabel}>Orders</Text>
                  </View>
                  <View style={styles.timeSlotStat}>
                    <Text style={styles.timeSlotNumber}>₹{slot.earnings}</Text>
                    <Text style={styles.timeSlotLabel}>Earnings</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Top Customers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Customers</Text>
          <View style={styles.customersContainer}>
            {topCustomers.map((customer, index) => (
              <View key={index} style={styles.customerRow}>
                <View style={styles.customerRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerStats}>
                    {customer.orders} orders • ₹{customer.amount}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.earningsContainer}>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Base Earnings</Text>
              <Text style={styles.earningsValue}>₹{data.earnings - data.tips}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Tips</Text>
              <Text style={styles.earningsValue}>₹{data.tips}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Bonus</Text>
              <Text style={styles.earningsValue}>₹0</Text>
            </View>
            <View style={[styles.earningsRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalValue}>₹{data.earnings}</Text>
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
    backgroundColor: '#2563EB',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
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
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
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
  metricsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricRow: {
    marginBottom: 16,
  },
  metricInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  metricProgress: {
    height: 6,
    borderRadius: 3,
  },
  timeSlotContainer: {
    gap: 12,
  },
  timeSlotCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  timeSlotStats: {
    flexDirection: 'row',
    gap: 24,
  },
  timeSlotStat: {
    alignItems: 'center',
  },
  timeSlotNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  timeSlotLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  customersContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customerRank: {
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
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  customerStats: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  earningsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
});