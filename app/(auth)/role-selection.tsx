import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { User, Store } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RoleSelection() {
  const router = useRouter();

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Order water with 10-15 min delivery',
      icon: User,
      color: '#2563EB',
      route: '/(auth)/login',
    },
    {
      id: 'vendor',
      title: 'Vendor',
      description: 'Deliver water and manage orders',
      icon: Store,
      color: '#059669',
      route: '/(auth)/login',
    },
  ];

  const handleRoleSelect = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.appName}>AquaFlow</Text>
          <Text style={styles.tagline}>10-15 min water delivery</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to AquaFlow</Text>
        <Text style={styles.subtitle}>Choose how you want to use our platform</Text>

        <View style={styles.roleGrid}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.roleCard}
              onPress={() => handleRoleSelect(role.route)}
            >
              <LinearGradient
                colors={[role.color, role.color + '90']}
                style={styles.roleIconContainer}
              >
                <role.icon size={40} color="#FFF" />
              </LinearGradient>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Why Choose AquaFlow?</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• 10-15 minute delivery guarantee</Text>
            <Text style={styles.featureItem}>• Verified water brands and vendors</Text>
            <Text style={styles.featureItem}>• Real-time order tracking</Text>
            <Text style={styles.featureItem}>• Secure payments with multiple options</Text>
            <Text style={styles.featureItem}>• 24/7 customer support</Text>
          </View>
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
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  roleGrid: {
    gap: 20,
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});