import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MapPin, Plus, ArrowLeft, CreditCard as Edit, Trash2, Chrome as Home, Building, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { locationService } from '@/lib/location';

interface Address {
  id: string;
  title: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  is_default: boolean;
}

interface AddressManagerProps {
  onAddressSelected?: (address: Address) => void;
}

export default function AddressManager({ onAddressSelected }: AddressManagerProps) {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  // Only show form when explicitly requested by the user
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address_line: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      await loadAddresses();
      // If no addresses exist, show the add form
      if (addresses.length === 0) {
        setShowAddForm(true);
      }
    };
    
    loadInitialData();
  }, []);

  const loadAddresses = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.title.trim() || !newAddress.address_line.trim() || 
        !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pincode.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Geocode the address
      const fullAddress = `${newAddress.address_line}, ${newAddress.city}, ${newAddress.state} ${newAddress.pincode}`;
      const locationResult = await locationService.geocode(fullAddress);
      
      if (locationResult.error || !locationResult.location) {
        Alert.alert('Location Error', 'Could not find location for this address. Please check and try again.');
        return;
      }

      const addressData = {
        user_id: user.id,
        title: newAddress.title,
        address_line: newAddress.address_line,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        location: `(${locationResult.location.longitude}, ${locationResult.location.latitude})`,
        is_default: addresses.length === 0, // First address is default
      };

      let error;
      if (editingAddress) {
        ({ error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress.id));
      } else {
        ({ error } = await supabase
          .from('addresses')
          .insert(addressData));
      }

      if (error) throw error;

      setNewAddress({ title: '', address_line: '', city: '', state: '', pincode: '' });
      setShowAddForm(false);
      setEditingAddress(null);
      loadAddresses();
      
      Alert.alert('Success', `Address ${editingAddress ? 'updated' : 'added'} successfully`);
      if (onAddressSelected && !editingAddress) {
        const newAddress = addresses.find(a => a.address_line === addressData.address_line);
        if (newAddress) {
          onAddressSelected(newAddress);
        }
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', address.id);

              if (error) throw error;
              loadAddresses();
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete address');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      loadAddresses();
      Alert.alert('Success', 'Default address updated');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update default address');
    }
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      title: address.title,
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,

    });
    setShowAddForm(true);
  };

  const getAddressIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('home')) {
      return <Home size={24} color="#2563EB" />;
    }
    if (lowerTitle.includes('office') || lowerTitle.includes('work')) {
      return <Building size={24} color="#2563EB" />;
    }
    return <MapPin size={24} color="#2563EB" />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const renderAddressItem = ({ item: address }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={[
          styles.addressIconContainer,
          { backgroundColor: address.is_default ? '#EFF6FF' : '#F3F4F6' }
        ]}>
          {getAddressIcon(address.title)}
        </View>
        <View style={styles.addressContent}>
          <View style={styles.addressTitleContainer}>
            <Text style={styles.addressTitle}>{address.title}</Text>
            {address.is_default && (
              <View style={styles.defaultBadge}>
                <Star size={16} color="#FBBF24" />
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressDetails}>
            {address.address_line}
          </Text>
          <Text style={styles.addressDetails}>
            {address.city}, {address.state} {address.pincode}
          </Text>
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity 
            onPress={() => handleSetDefault(address.id)}
            disabled={address.is_default}
          >
            <Star 
              size={20} 
              color={address.is_default ? '#FBBF24' : '#6B7280'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => startEdit(address)}>
            <Edit size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteAddress(address)}>
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => setShowAddForm(false)}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.formTitle}>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Home, Work, etc."
          value={newAddress.title}
          onChangeText={(text) => setNewAddress({ ...newAddress, title: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line *</Text>
        <TextInput
          style={styles.input}
          placeholder="House/Flat no, Building name"
          value={newAddress.address_line}
          onChangeText={(text) => setNewAddress({ ...newAddress, address_line: text })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            keyboardType="numeric"
            maxLength={6}
            value={newAddress.pincode}
            onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={newAddress.city}
            onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>State *</Text>
        <TextInput
          style={styles.input}
          placeholder="State"
          value={newAddress.state}
          onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
        />
      </View>

      <TouchableOpacity 
        style={[
          styles.saveButton,
          saving && styles.saveButtonLoading,
        ]}
        onPress={handleSaveAddress}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            {editingAddress ? 'Update Address' : 'Save Address'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Delivery Addresses</Text>
      {!showAddForm && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setEditingAddress(null);
            setNewAddress({
              title: '',
              address_line: '',
              city: '',
              state: '',
              pincode: ''
            });
            setShowAddForm(true);
          }}
        >
          <Plus size={20} color="#2563EB" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MapPin size={48} color="#E5E7EB" />
      <Text style={styles.emptyStateText}>
        No addresses added yet. Tap the plus button to add your delivery address.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showAddForm ? (
        renderForm()
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item: Address) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  addressesContainer: {
    padding: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconContainer: {
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#FDEDC3',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    color: '#FBBF24',
    fontSize: 12,
    marginLeft: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  formContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonLoading: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
