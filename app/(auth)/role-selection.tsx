import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Store } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * RoleSelection Screen
 * Allows a new user to select whether they are a Customer or a Vendor.
 */
export default function RoleSelection() {
  const router = useRouter();

  // Data for the role selection cards
  const roles = [
    {
      id: 'customer',
      title: "I'm a Customer",
      description: 'For hassle-free water delivery right to your doorstep.', // Enhanced description
      icon: User,
      colors: ['#3B82F6', '#2563EB'] as const, // Blue gradient
      route: '/(auth)/login',
    },
    {
      id: 'vendor',
      title: "I'm a Vendor",
      description: 'Join our network, manage orders, and earn on your schedule.', // Enhanced description
      icon: Store,
      colors: ['#10B981', '#059669'] as const, // Green gradient
      route: '/(auth)/login',
    },
  ];

  // Handles navigation when a role is selected
  const handleSelectRole = (role: any) => {
    // Navigate to the login screen. We can pass the selected role as a parameter if needed later.
    router.push(role.route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>How will you be using Aquakart?</Text>
      </View>
      <View style={styles.cardContainer}>
        {roles.map((role) => (
          <TouchableOpacity key={role.id} onPress={() => handleSelectRole(role)}>
            <LinearGradient colors={role.colors} style={styles.card}>
              <role.icon size={48} color="#FFF" />
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.cardDescription}>{role.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  cardContainer: {
    gap: 24,
  },
  card: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
