import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

type Address = {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  addressType: 'home' | 'work' | 'other';
};

export default function AddressForm({ onSave }: { onSave: (address: Address) => void }) {
  const [address, setAddress] = useState<Address>({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    addressType: 'home',
  });
  const router = useRouter();

  const handleSave = () => {
    // Basic validation
    if (!address.addressLine1.trim() || !address.pincode.trim() || !address.city.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (address.pincode.length !== 6 || !/^\d+$/.test(address.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }
    
    onSave(address);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput
          style={styles.input}
          placeholder="House/Flat no, Building name"
          value={address.addressLine1}
          onChangeText={(text) => setAddress({ ...address, addressLine1: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          placeholder="Area, Colony, Street, Sector, Village"
          value={address.addressLine2}
          onChangeText={(text) => setAddress({ ...address, addressLine2: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="Nearby location (optional)"
          value={address.landmark}
          onChangeText={(text) => setAddress({ ...address, landmark: text })}
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
            value={address.pincode}
            onChangeText={(text) => setAddress({ ...address, pincode: text })}
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={address.city}
            onChangeText={(text) => setAddress({ ...address, city: text })}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>State *</Text>
        <TextInput
          style={styles.input}
          placeholder="State"
          value={address.state}
          onChangeText={(text) => setAddress({ ...address, state: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Save as *</Text>
        <View style={styles.addressTypeContainer}>
          {(['home', 'work', 'other'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.addressTypeButton,
                address.addressType === type && styles.addressTypeButtonActive,
              ]}
              onPress={() => setAddress({ ...address, addressType: type })}
            >
              <Text
                style={[
                  styles.addressTypeText,
                  address.addressType === type && styles.addressTypeTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addressTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  addressTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  addressTypeTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
