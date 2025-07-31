import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Phone, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { authService } from '@/lib/auth';

export default function Login() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (loginType === 'phone') {
      if (!validatePhone(phoneNumber)) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
        return;
      }

      setOtpLoading(true);
      const result = await authService.sendOTP(`+91${phoneNumber}`);
      setOtpLoading(false);

      if (result.success) {
        setShowOTP(true);
        Alert.alert('OTP Sent', 'Check your SMS for the verification code');
      } else {
        Alert.alert('Error', (result.error as any)?.message || 'Failed to send OTP');
      }
    } else {
      // Email login
      if (!validateEmail(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }

      if (!password || password.length < 6) {
        Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      const result = await authService.signInWithEmail(email, password);
      setLoading(false);

      if (result.success) {
        // Get user profile to determine role
        console.log('Login successful, getting user profile...');
        const user = await authService.getCurrentUser();
        console.log('User after login:', user);
        if (user) {
          if (user.role) {
            console.log('Redirecting to dashboard:', user.role);
            router.replace(`/(${user.role})` as any);
          } else {
            console.log('No role found, redirecting to role selection');
            router.replace('/(auth)/role-selection');
          }
        }
      } else {
        Alert.alert('Login Failed', (result.error as any)?.message || 'Please check your credentials and try again');
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    const result = await authService.verifyOTP(`+91${phoneNumber}`, otp);
    setLoading(false);

    if (result.success) {
      // Get user profile to determine role
      console.log('OTP verification successful, getting user profile...');
      const user = await authService.getCurrentUser();
      console.log('User after OTP verification:', user);
      if (user) {
        if (user.role) {
          console.log('Redirecting to dashboard:', user.role);
          router.replace(`/(${user.role})` as any);
        } else {
          console.log('No role found, redirecting to role selection');
          router.replace('/(auth)/role-selection');
        }
      }
    } else {
      Alert.alert('Verification Failed', (result.error as any)?.message || 'Please check your OTP and try again');
    }
  };

  const handleForgotPassword = async () => {
    if (loginType === 'email' && email) {
      if (!validateEmail(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }

      const result = await authService.resetPassword(email);
      if (result.success) {
        Alert.alert('Reset Link Sent', 'Check your email for password reset instructions');
      } else {
        Alert.alert('Error', (result.error as any)?.message || 'Failed to send reset link');
      }
    } else {
      Alert.alert('Enter Email', 'Please enter your email address to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <Text style={styles.appName}>AquaFlow</Text>
        <Text style={styles.tagline}>Welcome back!</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>Login to your account</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, loginType === 'phone' && styles.toggleButtonActive]}
            onPress={() => {
              setLoginType('phone');
              setShowOTP(false);
              setOtp('');
            }}
          >
            <Phone size={20} color={loginType === 'phone' ? '#FFF' : '#64748B'} />
            <Text style={[styles.toggleText, loginType === 'phone' && styles.toggleTextActive]}>
              Phone
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, loginType === 'email' && styles.toggleButtonActive]}
            onPress={() => {
              setLoginType('email');
              setShowOTP(false);
              setOtp('');
            }}
          >
            <Mail size={20} color={loginType === 'email' ? '#FFF' : '#64748B'} />
            <Text style={[styles.toggleText, loginType === 'email' && styles.toggleTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
        </View>

        {loginType === 'phone' ? (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Phone size={20} color="#64748B" style={styles.inputIcon} />
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="numeric"
                maxLength={10}
                editable={!showOTP}
              />
            </View>
            
            {showOTP && (
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            )}

            {showOTP && (
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={() => {
                  setOtp('');
                  handleSendOTP();
                }}
                disabled={otpLoading}
              >
                <Text style={styles.resendText}>
                  {otpLoading ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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

            <TouchableOpacity 
              style={styles.forgotButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginButton, (loading || otpLoading) && styles.loginButtonDisabled]}
          onPress={showOTP ? handleVerifyOTP : handleSendOTP}
          disabled={loading || otpLoading}
        >
          {loading || otpLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>
                {showOTP ? 'Verify OTP' : (loginType === 'phone' ? 'Send OTP' : 'Login')}
              </Text>
              <ArrowRight size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 200,
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
    marginBottom: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#2563EB',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
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
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});