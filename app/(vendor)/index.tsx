import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Power, 
  Clock, 
  DollarSign, 
  Package, 
  TrendingUp, 
  TriangleAlert as AlertTriangle, 
  MapPin, 
  Star, 
  Bell,
  Droplets,
  Users,
  Truck,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react-native';
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '@/src/design-system';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
    { label: 'Orders Today', value: todayStats.orders, icon: Package, color: colors.primary, change: '+12%' },
    { label: 'Earnings', value: `₹${todayStats.earnings}`, icon: DollarSign, color: colors.success, change: '+8%' },
    { label: 'Avg Time', value: `${todayStats.avgDeliveryTime}m`, icon: Clock, color: colors.warning, change: '-2m' },
    { label: 'Rating', value: todayStats.rating, icon: Star, color: colors.info, change: '+0.2' },
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
    { brand: 'Aquafina 20L', stock: 5, lowStock: true, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100' },
    { brand: 'Aquafina 1L', stock: 12, lowStock: false, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100' },
    { brand: 'Bisleri 20L', stock: 3, lowStock: true, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.error;
      case 'accepted': return colors.warning;
      case 'delivering': return colors.primary;
      default: return colors.textTertiary;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return AlertTriangle;
      case 'accepted': return Clock;
      case 'delivering': return Truck;
      default: return Package;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={colors.primaryGradient as [string, string]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Good Morning!</Text>
                <Text style={styles.vendorName}>Raj Kumar</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={24} color={colors.white} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.onlineToggle}>
              <View style={styles.toggleInfo}>
                <Power size={20} color={isOnline ? colors.success : colors.textTertiary} />
                <Text style={styles.toggleText}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: colors.gray300, true: colors.successLight }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <Card key={index} variant="default" style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.statChange, { color: stat.change.startsWith('+') ? colors.success : colors.error }]}>
                    {stat.change}
                  </Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.ordersList}>
            {recentOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <Card key={order.id} variant="default" style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.customerName}>{order.customer}</Text>
                      <Text style={styles.orderItems}>{order.items}</Text>
                      <View style={styles.orderMeta}>
                        <MapPin size={14} color={colors.textSecondary} />
                        <Text style={styles.orderAddress}>{order.address}</Text>
                      </View>
                    </View>
                    <View style={styles.orderActions}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                        <StatusIcon size={14} color={getStatusColor(order.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                      <Text style={styles.orderAmount}>₹{order.amount}</Text>
                      <Text style={styles.orderTime}>{order.time}</Text>
                    </View>
                  </View>
                  
                  {order.status === 'new' && (
                    <View style={styles.orderActions}>
                      <Button
                        title="Accept"
                        onPress={() => {}}
                        variant="primary"
                        size="small"
                        icon={<CheckCircle size={16} color={colors.white} />}
                        style={styles.acceptButton}
                      />
                      <Button
                        title="Reject"
                        onPress={() => {}}
                        variant="outline"
                        size="small"
                        icon={<XCircle size={16} color={colors.error} />}
                        style={styles.rejectButton}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </View>

        {/* Inventory Alert */}
        {showLowStock && (
          <View style={styles.section}>
            <Card variant="elevated" style={styles.inventoryAlert}>
              <View style={styles.alertHeader}>
                <AlertTriangle size={20} color={colors.warning} />
                <Text style={styles.alertTitle}>Low Stock Alert</Text>
              </View>
              <Text style={styles.alertDescription}>
                Some items are running low on stock. Consider restocking soon.
              </Text>
              
              <View style={styles.inventoryList}>
                {inventory.filter(item => item.lowStock).map((item, index) => (
                  <View key={index} style={styles.inventoryItem}>
                    <View style={styles.inventoryInfo}>
                      <Text style={styles.inventoryBrand}>{item.brand}</Text>
                      <Text style={styles.inventoryStock}>Only {item.stock} left</Text>
                    </View>
                    <Button
                      title="Restock"
                      onPress={() => {}}
                      variant="primary"
                      size="small"
                    />
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Users size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Manage Orders</Text>
              <ArrowRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Droplets size={24} color={colors.secondary} />
              </View>
              <Text style={styles.actionTitle}>Inventory</Text>
              <ArrowRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <TrendingUp size={24} color={colors.success} />
              </View>
              <Text style={styles.actionTitle}>Analytics</Text>
              <ArrowRight size={16} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Truck size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionTitle}>Deliveries</Text>
              <ArrowRight size={16} color={colors.textTertiary} />
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.lg,
  },
  headerContent: {
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.9,
    fontFamily: typography.fontFamily.regular,
  },
  vendorName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.bold,
  },
  onlineToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleText: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  statsContainer: {
    padding: spacing.lg,
    marginTop: -spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  ordersList: {
    gap: spacing.md,
  },
  orderCard: {
    gap: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  customerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semibold,
  },
  orderItems: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orderAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily.regular,
  },
  orderActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.medium,
  },
  orderAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  orderTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontFamily: typography.fontFamily.regular,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    borderColor: colors.error,
  },
  inventoryAlert: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semibold,
  },
  alertDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.regular,
  },
  inventoryList: {
    gap: spacing.sm,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  inventoryInfo: {
    gap: spacing.xs,
  },
  inventoryBrand: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  inventoryStock: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontFamily: typography.fontFamily.regular,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
  },
});