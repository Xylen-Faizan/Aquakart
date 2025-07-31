import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, MapPin, DollarSign, Clock, Bell, Shield, Database, Cloud, Activity, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Zap } from 'lucide-react-native';

export default function AdminSystem() {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    vendorApproval: true,
    orderNotifications: true,
    autoDispatch: true,
    emergencyMode: false,
  });

  const [pricingSettings, setPricingSettings] = useState({
    deliveryFee: 10,
    serviceFee: 5,
    platformCommission: 15,
    minimumOrder: 20,
  });

  const systemHealth = [
    { 
      service: 'Database', 
      status: 'healthy', 
      uptime: '99.9%', 
      icon: Database,
      color: '#059669' 
    },
    { 
      service: 'Cloud Storage', 
      status: 'healthy', 
      uptime: '99.8%', 
      icon: Cloud,
      color: '#059669' 
    },
    { 
      service: 'Payment Gateway', 
      status: 'warning', 
      uptime: '98.5%', 
      icon: DollarSign,
      color: '#F59E0B' 
    },
    { 
      service: 'Notifications', 
      status: 'healthy', 
      uptime: '99.7%', 
      icon: Bell,
      color: '#059669' 
    },
    { 
      service: 'Maps & Routing', 
      status: 'healthy', 
      uptime: '99.9%', 
      icon: MapPin,
      color: '#059669' 
    },
    { 
      service: 'Authentication', 
      status: 'healthy', 
      uptime: '99.9%', 
      icon: Shield,
      color: '#059669' 
    },
  ];

  const citySettings = [
    { city: 'Gurgaon', active: true, deliveryRadius: 25, minDeliveryTime: 10 },
    { city: 'Delhi', active: true, deliveryRadius: 30, minDeliveryTime: 12 },
    { city: 'Mumbai', active: true, deliveryRadius: 28, minDeliveryTime: 15 },
    { city: 'Bangalore', active: false, deliveryRadius: 20, minDeliveryTime: 18 },
  ];

  const handleSystemSettingChange = (key: string) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePricingChange = (key: string, value: string) => {
    setPricingSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Configuration</Text>
        <Text style={styles.subtitle}>Manage platform settings and configurations</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthContainer}>
            {systemHealth.map((item, index) => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <View key={index} style={styles.healthItem}>
                  <View style={styles.healthInfo}>
                    <item.icon size={20} color={item.color} />
                    <Text style={styles.healthService}>{item.service}</Text>
                  </View>
                  <View style={styles.healthStatus}>
                    <StatusIcon size={16} color={item.color} />
                    <Text style={[styles.healthStatusText, { color: item.color }]}>
                      {item.status}
                    </Text>
                    <Text style={styles.healthUptime}>({item.uptime})</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Settings size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Maintenance Mode</Text>
                  <Text style={styles.settingDescription}>
                    Enable to prevent new orders and limit access
                  </Text>
                </View>
              </View>
              <Switch
                value={systemSettings.maintenanceMode}
                onValueChange={() => handleSystemSettingChange('maintenanceMode')}
                trackColor={{ false: '#E5E7EB', true: '#FEE2E2' }}
                thumbColor={systemSettings.maintenanceMode ? '#EF4444' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Shield size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>New User Registration</Text>
                  <Text style={styles.settingDescription}>
                    Allow new customers to register
                  </Text>
                </View>
              </View>
              <Switch
                value={systemSettings.newUserRegistration}
                onValueChange={() => handleSystemSettingChange('newUserRegistration')}
                trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
                thumbColor={systemSettings.newUserRegistration ? '#059669' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <CheckCircle size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Vendor Auto-Approval</Text>
                  <Text style={styles.settingDescription}>
                    Automatically approve verified vendors
                  </Text>
                </View>
              </View>
              <Switch
                value={systemSettings.vendorApproval}
                onValueChange={() => handleSystemSettingChange('vendorApproval')}
                trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
                thumbColor={systemSettings.vendorApproval ? '#2563EB' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Order Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Send push notifications for order updates
                  </Text>
                </View>
              </View>
              <Switch
                value={systemSettings.orderNotifications}
                onValueChange={() => handleSystemSettingChange('orderNotifications')}
                trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
                thumbColor={systemSettings.orderNotifications ? '#2563EB' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Zap size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Auto-Dispatch</Text>
                  <Text style={styles.settingDescription}>
                    Automatically assign orders to nearest vendors
                  </Text>
                </View>
              </View>
              <Switch
                value={systemSettings.autoDispatch}
                onValueChange={() => handleSystemSettingChange('autoDispatch')}
                trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
                thumbColor={systemSettings.autoDispatch ? '#059669' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <AlertTriangle size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Emergency Mode</Text>
                  <Text style={styles.settingDescription}>
                    Enable emergency protocols and priority routing
                  </Text>
                </View>
              </View>
              <Switch
                value={systemSettings.emergencyMode}
                onValueChange={() => handleSystemSettingChange('emergencyMode')}
                trackColor={{ false: '#E5E7EB', true: '#FEE2E2' }}
                thumbColor={systemSettings.emergencyMode ? '#EF4444' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Pricing Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Configuration</Text>
          <View style={styles.pricingContainer}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Delivery Fee (₹)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricingSettings.deliveryFee.toString()}
                onChangeText={(value) => handlePricingChange('deliveryFee', value)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Service Fee (₹)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricingSettings.serviceFee.toString()}
                onChangeText={(value) => handlePricingChange('serviceFee', value)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Platform Commission (%)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricingSettings.platformCommission.toString()}
                onChangeText={(value) => handlePricingChange('platformCommission', value)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Minimum Order (₹)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricingSettings.minimumOrder.toString()}
                onChangeText={(value) => handlePricingChange('minimumOrder', value)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* City Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>City Management</Text>
          <View style={styles.cityContainer}>
            {citySettings.map((city, index) => (
              <View key={index} style={styles.cityRow}>
                <View style={styles.cityInfo}>
                  <MapPin size={20} color="#2563EB" />
                  <Text style={styles.cityName}>{city.city}</Text>
                </View>
                <View style={styles.citySettings}>
                  <Text style={styles.citySettingText}>
                    {city.deliveryRadius}km • {city.minDeliveryTime}min
                  </Text>
                  <View style={[
                    styles.cityStatus,
                    { backgroundColor: city.active ? '#DCFCE7' : '#FEE2E2' }
                  ]}>
                    <Text style={[
                      styles.cityStatusText,
                      { color: city.active ? '#059669' : '#EF4444' }
                    ]}>
                      {city.active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* System Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Database size={20} color="#2563EB" />
              <Text style={styles.actionButtonText}>Backup Database</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Cloud size={20} color="#059669" />
              <Text style={styles.actionButtonText}>Sync Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Activity size={20} color="#F59E0B" />
              <Text style={styles.actionButtonText}>Clear Cache</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Reset System
              </Text>
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
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  healthContainer: {
    gap: 12,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  healthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthService: {
    fontSize: 16,
    color: '#1E293B',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthStatusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  healthUptime: {
    fontSize: 12,
    color: '#64748B',
  },
  settingsContainer: {
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  pricingContainer: {
    gap: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  pricingInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1E293B',
    width: 80,
    textAlign: 'center',
  },
  cityContainer: {
    gap: 12,
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  citySettings: {
    alignItems: 'flex-end',
  },
  citySettingText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  cityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cityStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    width: '48%',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
  },
  dangerButtonText: {
    color: '#EF4444',
  },
});