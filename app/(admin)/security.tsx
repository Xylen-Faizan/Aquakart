import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, TriangleAlert as AlertTriangle, Eye, Lock, Key, UserX, Activity, Clock, MapPin, Phone, Mail, CreditCard } from 'lucide-react-native';

export default function AdminSecurity() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    fraudDetection: true,
    locationTracking: true,
    paymentMonitoring: true,
    suspiciousActivityAlerts: true,
    dataEncryption: true,
  });

  const securityAlerts = [
    {
      id: 1,
      type: 'high',
      title: 'Multiple Failed Login Attempts',
      description: 'User john.doe@email.com has 5 failed login attempts in 10 minutes',
      time: '5 mins ago',
      icon: Lock,
      action: 'Block User',
    },
    {
      id: 2,
      type: 'medium',
      title: 'Suspicious Order Pattern',
      description: 'Vendor ID #1234 has unusual order acceptance rate (98% in last hour)',
      time: '15 mins ago',
      icon: AlertTriangle,
      action: 'Investigate',
    },
    {
      id: 3,
      type: 'low',
      title: 'New Device Login',
      description: 'Admin user logged in from new device (IP: 192.168.1.100)',
      time: '1 hour ago',
      icon: Shield,
      action: 'Verify',
    },
    {
      id: 4,
      type: 'high',
      title: 'Payment Anomaly Detected',
      description: 'Multiple payment failures from same card in different locations',
      time: '2 hours ago',
      icon: CreditCard,
      action: 'Block Card',
    },
  ];

  const auditLogs = [
    {
      id: 1,
      action: 'User Suspended',
      user: 'admin@aquaflow.com',
      target: 'john.doe@email.com',
      timestamp: '2024-01-15 14:30:25',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      action: 'Vendor Approved',
      user: 'admin@aquaflow.com',
      target: 'Raj Kumar (Vendor)',
      timestamp: '2024-01-15 14:25:10',
      ip: '192.168.1.100',
    },
    {
      id: 3,
      action: 'System Settings Changed',
      user: 'admin@aquaflow.com',
      target: 'Maintenance Mode Enabled',
      timestamp: '2024-01-15 14:20:45',
      ip: '192.168.1.100',
    },
    {
      id: 4,
      action: 'Data Export',
      user: 'admin@aquaflow.com',
      target: 'User Analytics Report',
      timestamp: '2024-01-15 14:15:30',
      ip: '192.168.1.100',
    },
  ];

  const blockedUsers = [
    {
      id: 1,
      name: 'Suspicious User 1',
      email: 'fake@email.com',
      reason: 'Multiple fake orders',
      blockedDate: '2024-01-10',
      icon: UserX,
    },
    {
      id: 2,
      name: 'Spam Vendor',
      email: 'spam@vendor.com',
      reason: 'Fraudulent documents',
      blockedDate: '2024-01-08',
      icon: UserX,
    },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#2563EB';
      default: return '#6B7280';
    }
  };

  const handleSecuritySettingChange = (key: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAlertAction = (alertId: number, action: string) => {
    console.log(`Action: ${action} for alert: ${alertId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security & Monitoring</Text>
        <Text style={styles.subtitle}>Monitor system security and manage threats</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Alerts</Text>
          <View style={styles.alertsContainer}>
            {securityAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={styles.alertInfo}>
                    <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.type) + '20' }]}>
                      <alert.icon size={20} color={getAlertColor(alert.type)} />
                    </View>
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={styles.alertDescription}>{alert.description}</Text>
                      <Text style={styles.alertTime}>{alert.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.alertBadge, { backgroundColor: getAlertColor(alert.type) }]}>
                    <Text style={styles.alertBadgeText}>{alert.type.toUpperCase()}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.alertAction, { backgroundColor: getAlertColor(alert.type) }]}
                  onPress={() => handleAlertAction(alert.id, alert.action)}
                >
                  <Text style={styles.alertActionText}>{alert.action}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Key size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>
                    Require 2FA for admin accounts
                  </Text>
                </View>
              </View>
              <Switch
                value={securitySettings.twoFactorAuth}
                onValueChange={() => handleSecuritySettingChange('twoFactorAuth')}
                trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
                thumbColor={securitySettings.twoFactorAuth ? '#059669' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <AlertTriangle size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Fraud Detection</Text>
                  <Text style={styles.settingDescription}>
                    AI-powered fraud detection system
                  </Text>
                </View>
              </View>
              <Switch
                value={securitySettings.fraudDetection}
                onValueChange={() => handleSecuritySettingChange('fraudDetection')}
                trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
                thumbColor={securitySettings.fraudDetection ? '#2563EB' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MapPin size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Location Tracking</Text>
                  <Text style={styles.settingDescription}>
                    Track vendor and delivery locations
                  </Text>
                </View>
              </View>
              <Switch
                value={securitySettings.locationTracking}
                onValueChange={() => handleSecuritySettingChange('locationTracking')}
                trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
                thumbColor={securitySettings.locationTracking ? '#059669' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <CreditCard size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Payment Monitoring</Text>
                  <Text style={styles.settingDescription}>
                    Monitor suspicious payment activities
                  </Text>
                </View>
              </View>
              <Switch
                value={securitySettings.paymentMonitoring}
                onValueChange={() => handleSecuritySettingChange('paymentMonitoring')}
                trackColor={{ false: '#E5E7EB', true: '#FEF3C7' }}
                thumbColor={securitySettings.paymentMonitoring ? '#F59E0B' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Activity size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Suspicious Activity Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Real-time alerts for unusual patterns
                  </Text>
                </View>
              </View>
              <Switch
                value={securitySettings.suspiciousActivityAlerts}
                onValueChange={() => handleSecuritySettingChange('suspiciousActivityAlerts')}
                trackColor={{ false: '#E5E7EB', true: '#FEE2E2' }}
                thumbColor={securitySettings.suspiciousActivityAlerts ? '#EF4444' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Shield size={20} color="#64748B" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Data Encryption</Text>
                  <Text style={styles.settingDescription}>
                    End-to-end encryption for sensitive data
                  </Text>
                </View>
              </View>
              <Switch
                value={securitySettings.dataEncryption}
                onValueChange={() => handleSecuritySettingChange('dataEncryption')}
                trackColor={{ false: '#E5E7EB', true: '#DCFCE7' }}
                thumbColor={securitySettings.dataEncryption ? '#059669' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Blocked Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blocked Users</Text>
          <View style={styles.blockedContainer}>
            {blockedUsers.map((user) => (
              <View key={user.id} style={styles.blockedCard}>
                <View style={styles.blockedInfo}>
                  <user.icon size={20} color="#EF4444" />
                  <View style={styles.blockedText}>
                    <Text style={styles.blockedName}>{user.name}</Text>
                    <Text style={styles.blockedEmail}>{user.email}</Text>
                    <Text style={styles.blockedReason}>Reason: {user.reason}</Text>
                    <Text style={styles.blockedDate}>Blocked: {user.blockedDate}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.unblockButton}>
                  <Text style={styles.unblockButtonText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Audit Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Logs</Text>
          <View style={styles.auditContainer}>
            {auditLogs.map((log) => (
              <View key={log.id} style={styles.auditRow}>
                <View style={styles.auditInfo}>
                  <Text style={styles.auditAction}>{log.action}</Text>
                  <Text style={styles.auditDetails}>
                    by {log.user} → {log.target}
                  </Text>
                </View>
                <View style={styles.auditMeta}>
                  <Text style={styles.auditTimestamp}>{log.timestamp}</Text>
                  <Text style={styles.auditIp}>IP: {log.ip}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Security Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Eye size={20} color="#2563EB" />
              <Text style={styles.actionButtonText}>View All Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Lock size={20} color="#F59E0B" />
              <Text style={styles.actionButtonText}>Force Password Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Shield size={20} color="#059669" />
              <Text style={styles.actionButtonText}>Security Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Emergency Lockdown
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
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  alertAction: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  alertActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
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
  blockedContainer: {
    gap: 12,
  },
  blockedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
  },
  blockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  blockedText: {
    flex: 1,
  },
  blockedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  blockedEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  blockedReason: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  blockedDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  unblockButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  unblockButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  auditContainer: {
    gap: 12,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  auditInfo: {
    flex: 1,
  },
  auditAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  auditDetails: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  auditMeta: {
    alignItems: 'flex-end',
  },
  auditTimestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  auditIp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
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