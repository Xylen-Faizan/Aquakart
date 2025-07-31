import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Phone, Mail, Camera, Save, ArrowLeft } from 'lucide-react-native';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.profile) {
        setProfile({
          full_name: user.profile.full_name || '',
          email: user.profile.email || '',
          phone: user.profile.phone || '',
          avatar_url: user.profile.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (!profile.phone.trim() || !/^[6-9]\d{9}$/.test(profile.phone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setSaving(true);
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('customers')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: profile.avatar_url || 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200' 
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarText}>Tap to change profile picture</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748B" />
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={20} color="#64748B" />
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="Enter phone number"
                keyboardType="numeric"
                maxLength={10}
                autoComplete="tel"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
  placeholder: {
    width: 32,
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
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 8,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 14,
    color: '#64748B',
  },
  formContainer: {
    gap: 24,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});