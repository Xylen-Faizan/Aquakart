import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, DollarSign, Clock, TriangleAlert as AlertTriangle, Star, Package, Settings, CircleCheck as CheckCircle, X } from 'lucide-react-native';

export default function VendorNotifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    paymentUpdates: true,
    lowStock: true,
    customerRatings: false,
    systemUpdates: true,
  });

  const notifications = [
    {
      id: 1,
      type: 'new_order',
      title: 'New Order Received',
      message: 'You have a new order from John Doe for 2x Bisleri 20L',
      time: '2 mins ago',
      icon: Package,
      color: '#2563EB',
      unread: true,
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₹50 received for order #12345',
      time: '10 mins ago',
      icon: DollarSign,
      color: '#059669',
      unread: true,
    },
    {
      id: 3,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Bisleri 20L is running low (3 bottles remaining)',
      time: '1 hour ago',
      icon: AlertTriangle,
      color: '#EF4444',
      unread: true,
    },
    {
      id: 4,
      type: 'rating',
      title: 'New Customer Rating',
      message: 'Sarah Wilson rated your service 5 stars',
      time: '2 hours ago',
      icon: Star,
      color: '#F59E0B',
      unread: false,
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2-4 AM',
      time: '3 hours ago',
      icon: Settings,
      color: '#64748B',
      unread: false,
    },
    {
      id: 6,
      type: 'delivery',
      title: 'Delivery Completed',
      message: 'Order #12344 delivered successfully to Mike Johnson',
      time: '4 hours ago',
      icon: CheckCircle,
      color: '#059669',
      unread: false,
    },
  ];

  const handleNotificationToggle = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const clearAllNotifications = () => {
    console.log('Clear all notifications');
  };

  const markAsRead = (id: number) => {
    console.log('Mark as read:', id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.clearAllButton} onPress={clearAllNotifications}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Package size={20} color="#2563EB" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>New Orders</Text>
                  <Text style={styles.settingDescription}>Get notified when you receive new orders</Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.newOrders}
                onValueChange={() => handleNotificationToggle('newOrders')}
                trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
                thumbColor={notificationSettings.newOrders ? '#2563EB' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <DollarSign size={20} color="#059669" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Payment Updates</Text>
                  <Text style={styles.settingDescription}>Updates about payments and earnings</Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.paymentUpdates}
                onValueChange={() => handleNotificationToggle('paymentUpdates')}
                trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
                thumbColor={notificationSettings.paymentUpdates ? '#059669' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <AlertTriangle size={20} color="#EF4444" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Low Stock Alerts</Text>
                  <Text style={styles.settingDescription}>Alerts when inventory is running low</Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.lowStock}
                onValueChange={() => handleNotificationToggle('lowStock')}
                trackColor={{ false: '#E5E7EB', true: '#FEE2E2' }}
                thumbColor={notificationSettings.lowStock ? '#EF4444' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Star size={20} color="#F59E0B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Customer Ratings</Text>
                  <Text style={styles.settingDescription}>Notifications about customer reviews</Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.customerRatings}
                onValueChange={() => handleNotificationToggle('customerRatings')}
                trackColor={{ false: '#E5E7EB', true: '#FEF3C7' }}
                thumbColor={notificationSettings.customerRatings ? '#F59E0B' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Settings size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>System Updates</Text>
                  <Text style={styles.settingDescription}>Important system and policy updates</Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.systemUpdates}
                onValueChange={() => handleNotificationToggle('systemUpdates')}
                trackColor={{ false: '#E5E7EB', true: '#F1F5F9' }}
                thumbColor={notificationSettings.systemUpdates ? '#64748B' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.unread && styles.unreadNotification,
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.notificationIcon, { backgroundColor: notification.color + '20' }]}>
                    <notification.icon size={20} color={notification.color} />
                  </View>
                  
                  <View style={styles.notificationText}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {notification.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </View>
                
                {notification.unread && (
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <X size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.actionCard}>
              <Bell size={24} color="#2563EB" />
              <Text style={styles.actionTitle}>Test Notifications</Text>
              <Text style={styles.actionDescription}>Send a test notification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.actionTitle}>Quiet Hours</Text>
              <Text style={styles.actionDescription}>Set do not disturb times</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  settingsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dismissButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});