import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gift, RefreshCw, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define the structure for the last order prop
type LastOrder = {
  id: string;
  created_at: string;
  total_amount: number;
};

// Define the props for the SmartReorder component
type SmartReorderProps = {
  userName?: string;
  lastOrder?: LastOrder | null;
  onReorder: () => void;
  onQuickAdd: () => void;
};

/**
 * A dynamic widget for the home screen that either welcomes a new user
 * with a discount or prompts a returning user to reorder.
 */
export default function SmartReorder({ userName, lastOrder, onReorder, onQuickAdd }: SmartReorderProps) {
  // Logic for a returning user with a previous order
  if (lastOrder) {
    const lastOrderDate = new Date(lastOrder.created_at);
    const daysAgo = Math.round((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24));

    return (
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome back, {userName || 'friend'}!</Text>
          <Text style={styles.subtitle}>
            Your last order was {daysAgo > 1 ? `${daysAgo} days ago` : 'yesterday'}. Time to restock?
          </Text>
        </View>
        <TouchableOpacity style={styles.reorderButton} onPress={onReorder}>
          <RefreshCw size={20} color="#3B82F6" />
          <Text style={styles.reorderButtonText}>Reorder in one tap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Logic for a new user (no previous orders)
  return (
    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.card}>
      <View style={styles.iconContainer}>
        <Gift size={32} color="#FFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: '#FFF' }]}>Welcome, {userName || 'friend'}!</Text>
        <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
          Get 20% off your first order.
        </Text>
      </View>
      <TouchableOpacity style={styles.quickAddButton} onPress={onQuickAdd}>
        <Zap size={20} color="#FFF" />
        <Text style={styles.quickAddButtonText}>Order Now</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
  },
  reorderButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
  },
  quickAddButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
