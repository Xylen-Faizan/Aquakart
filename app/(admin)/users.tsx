import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MoveVertical as MoreVertical, MapPin, Star, ShoppingCart, Calendar } from 'lucide-react-native';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive' | 'premium'>('all');

  const filterOptions = [
    { id: 'all', label: 'All Users', count: 12450 },
    { id: 'active', label: 'Active', count: 8920 },
    { id: 'inactive', label: 'Inactive', count: 3530 },
    { id: 'premium', label: 'Premium', count: 2100 },
  ];

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+91 9876543210',
      avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Gurgaon',
      joinDate: '2023-01-15',
      totalOrders: 45,
      totalSpent: 2250,
      rating: 4.8,
      status: 'active',
      lastOrder: '2 days ago',
      tier: 'Gold',
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+91 9876543211',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Delhi',
      joinDate: '2023-02-20',
      totalOrders: 32,
      totalSpent: 1680,
      rating: 4.6,
      status: 'active',
      lastOrder: '1 day ago',
      tier: 'Silver',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+91 9876543212',
      avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Mumbai',
      joinDate: '2023-03-10',
      totalOrders: 28,
      totalSpent: 1540,
      rating: 4.5,
      status: 'inactive',
      lastOrder: '2 weeks ago',
      tier: 'Bronze',
    },
    {
      id: 4,
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      phone: '+91 9876543213',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Bangalore',
      joinDate: '2023-04-05',
      totalOrders: 52,
      totalSpent: 2890,
      rating: 4.9,
      status: 'active',
      lastOrder: '1 day ago',
      tier: 'Platinum',
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+91 9876543214',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200',
      city: 'Gurgaon',
      joinDate: '2023-05-12',
      totalOrders: 18,
      totalSpent: 945,
      rating: 4.3,
      status: 'active',
      lastOrder: '3 days ago',
      tier: 'Bronze',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return '#6366F1';
      case 'Gold': return '#F59E0B';
      case 'Silver': return '#6B7280';
      case 'Bronze': return '#92400E';
      default: return '#6B7280';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && user.status === 'active') ||
                         (filterType === 'inactive' && user.status === 'inactive') ||
                         (filterType === 'premium' && ['Gold', 'Platinum'].includes(user.tier));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
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
        <View style={styles.usersContainer}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={[styles.tierBadge, { backgroundColor: getTierColor(user.tier) }]}>
                      <Text style={styles.tierText}>{user.tier}</Text>
                    </View>
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <ShoppingCart size={16} color="#2563EB" />
                    <Text style={styles.statLabel}>Orders</Text>
                  </View>
                  <Text style={styles.statValue}>{user.totalOrders}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statLabel}>Spent</Text>
                  </View>
                  <Text style={styles.statValue}>₹{user.totalSpent}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <Star size={16} color="#F59E0B" />
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <Text style={styles.statValue}>{user.rating}</Text>
                </View>
              </View>

              <View style={styles.userMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#64748B" />
                  <Text style={styles.metaText}>{user.city}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#64748B" />
                  <Text style={styles.metaText}>Joined {user.joinDate}</Text>
                </View>
              </View>

              <View style={styles.userFooter}>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.lastOrderText}>Last order: {user.lastOrder}</Text>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.suspendButton]}>
                  <Text style={[styles.actionButtonText, styles.suspendButtonText]}>
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  usersContainer: {
    padding: 20,
    gap: 16,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  moreButton: {
    padding: 4,
  },
  userStats: {
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
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  userMeta: {
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
  userFooter: {
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastOrderText: {
    fontSize: 12,
    color: '#64748B',
  },
  userActions: {
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
});