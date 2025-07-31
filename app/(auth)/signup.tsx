import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { User, Phone, Mail, Lock, MapPin, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { authService, showAuthError } from '@/lib/auth';

export default function Signup() {
  const router = useRouter();
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    businessName: '',
    licenseNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, phone, email, password, confirmPassword, businessName, licenseNumber } = formData;

    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!password || password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }

    if (userType === 'vendor') {
      if (!businessName.trim()) {
        Alert.alert('Validation Error', 'Please enter your business name');
        return false;
      }

      if (!licenseNumber.trim()) {
        Alert.alert('Validation Error', 'Please enter your license number');
        return false;
      }
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await authService.signUp({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        fullName: formData.fullName,
        role: userType,
      });

      setLoading(false);

      if (result.success) {
        Alert.alert(
          'Account Created',
          `Your ${data.role} account has been created successfully. You can now login to your account.`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/login'),
            },
          ]
        );
      } else {
        console.error('Signup error details:', result.error);
        Alert.alert('Signup Failed', result.error?.message || 'Please try again. Check console for details.');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Signup exception:', error);
      Alert.alert('Signup Error', error.message || 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <Text style={styles.appName}>AquaFlow</Text>
        <Text style={styles.tagline}>Join our water delivery network</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create your account</Text>

        {/* User Type Selection */}
        <View style={styles.userTypeContainer}>
          <Text style={styles.userTypeLabel}>I am a:</Text>
          <View style={styles.userTypeButtons}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'customer' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('customer')}
            >
              <Text
                style={[
                  styles.userTypeButtonText,
                  userType === 'customer' && styles.userTypeButtonTextActive,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'vendor' && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType('vendor')}
            >
              <Text
                style={[
                  styles.userTypeButtonText,
                  userType === 'vendor' && styles.userTypeButtonTextActive,
                ]}
              >
                Vendor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <User size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              autoComplete="name"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Phone size={20} color="#64748B" style={styles.inputIcon} />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="numeric"
              maxLength={10}
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Mail size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#64748B" />
              ) : (
                <Eye size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#64748B" />
              ) : (
                <Eye size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          {userType === 'customer' && (
            <View style={styles.inputWrapper}>
              <MapPin size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address (Optional)"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                multiline
                autoComplete="street-address"
              />
            </View>
          )}

          {userType === 'vendor' && (
            <>
              <View style={styles.inputWrapper}>
                <User size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChangeText={(value) => handleInputChange('businessName', value)}
                />
              </View>

              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="License Number"
                  value={formData.licenseNumber}
                  onChangeText={(value) => handleInputChange('licenseNumber', value)}
                />
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.signupButtonText}>Create Account</Text>
              <ArrowRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#2563EB',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  userTypeButtonTextActive: {
    color: '#FFF',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
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
  },
  inputIcon: {
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#1E293B',
    marginRight: 8,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeButton: {
    padding: 4,
  },
  signupButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  termsContainer: {
    marginBottom: 32,
  },
  termsText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
});