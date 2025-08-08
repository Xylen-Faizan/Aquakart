import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SupplierFilters = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filters</Text>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Distance</Text>
        {/* Placeholder for a slider */}
        <Text style={styles.filterValue}>Up to 10 km</Text>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Rating</Text>
        {/* Placeholder for a star rating filter */}
        <Text style={styles.filterValue}>4 stars & up</Text>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Options</Text>
        {/* Placeholder for checkboxes */}
        <Text style={styles.filterValue}>Certified Only</Text>
        <Text style={styles.filterValue}>Quick Delivery</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  filterValue: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default SupplierFilters;