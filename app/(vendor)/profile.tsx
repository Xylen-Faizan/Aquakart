import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, MapPin, Clock, Star, CreditCard as Edit, Camera, FileText, DollarSign, Package, Settings, LogOut } from 'lucide-react-native';

export default function VendorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Raj Kumar',
    phone: '+91 9876543210',
    email: 'raj.kumar@email.com',
    address: 'Sector 14, Gurgaon',
    serviceRadius: '5 km',
    workingHours: '9 AM - 9 PM',
    rating: 4.7,
    totalDeliveries: 1250,
    totalEarnings: 85000,
    joinDate: 'Jan 2023',
  });

  const vendorStats = [
    { label: 'Total Deliveries', value: profileData.totalDeliveries, icon: Package },
    { label: 'Total Earnings', value: `₹${profileData.totalEarnings}`, icon: DollarSign },
    { label: 'Average Rating', value: profileData.rating, icon: Star },
    { label: 'Service Radius', value: profileData.serviceRadius, icon: MapPin },
  ];

  const documents = [
    { name: 'Aadhar Card', status: 'Verified', color: '#059669' },
    { name: 'PAN Card', status: 'Verified', color: '#059669' },
    { name: 'Driving License', status: 'Pending', color: '#F59E0B' },
    { name: 'Water Quality Certificate', status: 'Verified', color: '#059669' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save profile data
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.vendorName}>{profileData.name}</Text>
            <Text style={styles.memberSince}>Member since {profileData.joinDate}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.rating}>{profileData.rating}</Text>
              <Text style={styles.ratingCount}>({profileData.totalDeliveries} deliveries)</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {vendorStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <stat.icon size={24} color="#2563EB" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <User size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.detailInput}
                    value={profileData.name}
                    onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  />
                ) : (
                  <Text style={styles.detailValue}>{profileData.name}</Text>
                )}
              </View>
            </View>

            <View style={styles.detailRow}>
              <Phone size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.detailInput}
                    value={profileData.phone}
                    onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                  />
                ) : (
                  <Text style={styles.detailValue}>{profileData.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.detailRow}>
              <Mail size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.detailInput}
                    value={profileData.email}
                    onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  />
                ) : (
                  <Text style={styles.detailValue}>{profileData.email}</Text>
                )}
              </View>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Address</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.detailInput}
                    value={profileData.address}
                    onChangeText={(text) => setProfileData({ ...profileData, address: text })}
                    multiline
                  />
                ) : (
                  <Text style={styles.detailValue}>{profileData.address}</Text>
                )}
              </View>
            </View>

            <View style={styles.detailRow}>
              <Clock size={20} color="#64748B" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Working Hours</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.detailInput}
                    value={profileData.workingHours}
                    onChangeText={(text) => setProfileData({ ...profileData, workingHours: text })}
                  />
                ) : (
                  <Text style={styles.detailValue}>{profileData.workingHours}</Text>
                )}
              </View>
            </View>
          </View>

          {isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.documentsContainer}>
            {documents.map((doc, index) => (
              <View key={index} style={styles.documentRow}>
                <FileText size={20} color="#64748B" />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={[styles.documentStatus, { color: doc.color }]}>
                    {doc.status}
                  </Text>
                </View>
                <TouchableOpacity style={styles.documentAction}>
                  <Text style={styles.documentActionText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingRow}>
              <Settings size={20} color="#64748B" />
              <Text style={styles.settingText}>Account Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <MapPin size={20} color="#64748B" />
              <Text style={styles.settingText}>Update Service Area</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <DollarSign size={20} color="#64748B" />
              <Text style={styles.settingText}>Payment Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 6,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  memberSince: {
    fontSize: 14,
    color: '#64748B',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748B',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
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
  detailsContainer: {
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1E293B',
  },
  detailInput: {
    fontSize: 16,
    color: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  documentsContainer: {
    gap: 16,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    color: '#1E293B',
  },
  documentStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  documentAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  documentActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  settingsContainer: {
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#1E293B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});