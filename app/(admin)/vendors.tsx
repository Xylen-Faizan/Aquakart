import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MoveVertical as MoreVertical, MapPin, Star, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, X } from 'lucide-react-native';

export default function AdminVendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  const filterOptions = [
    { id: 'all', label: 'All Vendors', count: 125 },
    { id: 'active', label: 'Active', count: 85 },
    { id: 'pending', label: 'Pending', count: 12 },
    { id: 'suspended', label: 'Suspended', count: 28 },
  ];

  const vendors = [
    {
      id: 1,
      name: 'Raj Kumar',
      email: 'raj.kumar@email.com',
      phone: '+91 9876543210',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Gurgaon',
      area: 'Sector 14',
      joinDate: '2023-01-15',
      totalDeliveries: 1250,
      totalEarnings: 85000,
      rating: 4.8,
      status: 'active',
      lastActive: '2 hours ago',
      avgDeliveryTime: 12,
      completionRate: 96,
      brands: ['Bisleri', 'Aquafina', 'Himalayan'],
    },
    {
      id: 2,
      name: 'Suresh Sharma',
      email: 'suresh.sharma@email.com',
      phone: '+91 9876543211',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Delhi',
      area: 'Connaught Place',
      joinDate: '2023-02-20',
      totalDeliveries: 980,
      totalEarnings: 68000,
      rating: 4.6,
      status: 'active',
      lastActive: '1 hour ago',
      avgDeliveryTime: 14,
      completionRate: 94,
      brands: ['Bisleri', 'Kinley'],
    },
    {
      id: 3,
      name: 'Amit Singh',
      email: 'amit.singh@email.com',
      phone: '+91 9876543212',
      avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Mumbai',
      area: 'Andheri',
      joinDate: '2023-03-10',
      totalDeliveries: 750,
      totalEarnings: 52000,
      rating: 4.5,
      status: 'pending',
      lastActive: '5 days ago',
      avgDeliveryTime: 16,
      completionRate: 89,
      brands: ['Aquafina', 'Himalayan'],
    },
    {
      id: 4,
      name: 'Vikram Patel',
      email: 'vikram.patel@email.com',
      phone: '+91 9876543213',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Bangalore',
      area: 'Koramangala',
      joinDate: '2023-04-05',
      totalDeliveries: 650,
      totalEarnings: 45000,
      rating: 4.7,
      status: 'suspended',
      lastActive: '1 week ago',
      avgDeliveryTime: 18,
      completionRate: 87,
      brands: ['Bisleri', 'Kinley', 'Himalayan'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'pending': return '#F59E0B';
      case 'suspended': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'suspended': return X;
      default: return AlertCircle;
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.phone.includes(searchQuery) ||
                         vendor.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || vendor.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (vendorId: number) => {
    console.log('Approve vendor:', vendorId);
  };

  const handleReject = (vendorId: number) => {
    console.log('Reject vendor:', vendorId);
  };

  const handleSuspend = (vendorId: number) => {
    console.log('Suspend vendor:', vendorId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Management</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                filterType === option.id && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(option.id as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === option.id && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.filterChipCount,
                  filterType === option.id && styles.filterChipCountActive,
                ]}
              >
                {option.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.vendorsContainer}>
          {filteredVendors.map((vendor) => {
            const StatusIcon = getStatusIcon(vendor.status);
            return (
              <View key={vendor.id} style={styles.vendorCard}>
                <View style={styles.vendorHeader}>
                  <Image source={{ uri: vendor.avatar }} style={styles.vendorAvatar} />
                  <View style={styles.vendorInfo}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    <Text style={styles.vendorEmail}>{vendor.email}</Text>
                    <Text style={styles.vendorPhone}>{vendor.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.vendorStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{vendor.totalDeliveries}</Text>
                    <Text style={styles.statLabel}>Deliveries</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>₹{vendor.totalEarnings.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Earnings</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.ratingContainer}>
                      <Star size={14} color="#F59E0B" />
                      <Text style={styles.statValue}>{vendor.rating}</Text>
                    </View>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{vendor.completionRate}%</Text>
                    <Text style={styles.statLabel}>Completion</Text>
                  </View>
                </View>

                <View style={styles.vendorMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.metaText}>{vendor.area}, {vendor.city}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color="#64748B" />
                    <Text style={styles.metaText}>Avg: {vendor.avgDeliveryTime}m</Text>
                  </View>
                </View>

                <View style={styles.brandsContainer}>
                  <Text style={styles.brandsLabel}>Brands:</Text>
                  <View style={styles.brandsList}>
                    {vendor.brands.map((brand, index) => (
                      <View key={index} style={styles.brandChip}>
                        <Text style={styles.brandText}>{brand}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.vendorFooter}>
                  <View style={styles.statusContainer}>
                    <StatusIcon size={16} color={getStatusColor(vendor.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(vendor.status) }]}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.lastActiveText}>Last active: {vendor.lastActive}</Text>
                </View>

                <View style={styles.vendorActions}>
                  {vendor.status === 'pending' ? (
                    <>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleReject(vendor.id)}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApprove(vendor.id)}
                      >
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>View Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Message</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.suspendButton]}
                        onPress={() => handleSuspend(vendor.id)}
                      >
                        <Text style={[styles.actionButtonText, styles.suspendButtonText]}>
                          {vendor.status === 'active' ? 'Suspend' : 'Activate'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: '#EA580C',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  filterChipCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterChipCountActive: {
    color: '#FFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  vendorsContainer: {
    padding: 20,
    gap: 16,
  },
  vendorCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  vendorEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  vendorPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  moreButton: {
    padding: 4,
  },
  vendorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  brandsContainer: {
    marginBottom: 12,
  },
  brandsLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  brandsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  brandChip: {
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  brandText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  vendorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastActiveText: {
    fontSize: 12,
    color: '#64748B',
  },
  vendorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  suspendButton: {
    backgroundColor: '#FEF2F2',
  },
  suspendButtonText: {
    color: '#EF4444',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});