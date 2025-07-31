import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Plus, ArrowLeft, CreditCard as Edit, Trash2, Chrome as Home, Building, Star } from 'lucide-react-native';
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

export default function Addresses() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    loadAddresses();
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
      Alert.alert('Validation Error', 'Please fill all fields');
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
        location: `POINT(${locationResult.location.longitude} ${locationResult.location.latitude})`,
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
    if (lowerTitle.includes('home')) return Home;
    if (lowerTitle.includes('office') || lowerTitle.includes('work')) return Building;
    return MapPin;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>My Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setShowAddForm(true);
            setEditingAddress(null);
            setNewAddress({ title: '', address_line: '', city: '', state: '', pincode: '' });
          }}
        >
          <Plus size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add/Edit Address Form */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Title</Text>
              <TextInput
                style={styles.input}
                value={newAddress.title}
                onChangeText={(text) => setNewAddress({ ...newAddress, title: text })}
                placeholder="e.g., Home, Office, etc."
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Line</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newAddress.address_line}
                onChangeText={(text) => setNewAddress({ ...newAddress, address_line: text })}
                placeholder="House/Flat No., Street, Area"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                  placeholder="City"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={newAddress.state}
                  onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                  placeholder="State"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={newAddress.pincode}
                onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                placeholder="Pincode"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowAddForm(false);
                  setEditingAddress(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveAddress}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingAddress ? 'Update' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Addresses List */}
        <View style={styles.addressesList}>
          {addresses.map((address) => {
            const IconComponent = getAddressIcon(address.title);
            return (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTitleRow}>
                    <IconComponent size={20} color="#2563EB" />
                    <Text style={styles.addressTitle}>{address.title}</Text>
                    {address.is_default && (
                      <View style={styles.defaultBadge}>
                        <Star size={12} color="#F59E0B" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => startEdit(address)}
                    >
                      <Edit size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteAddress(address)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.addressText}>
                  {address.address_line}
                </Text>
                <Text style={styles.addressLocation}>
                  {address.city}, {address.state} - {address.pincode}
                </Text>

                {!address.is_default && (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {addresses.length === 0 && !showAddForm && (
            <View style={styles.emptyState}>
              <MapPin size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No addresses added</Text>
              <Text style={styles.emptySubtitle}>Add your first address to start ordering</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => setShowAddForm(true)}
              >
                <Plus size={20} color="#FFF" />
                <Text style={styles.addFirstButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  addressesList: {
    padding: 20,
    gap: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 4,
  },
  addressLocation: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  setDefaultButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  addFirstButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});