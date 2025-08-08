import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Star, Clock, ShieldCheck } from 'lucide-react-native';
import { Vendor } from '@/types'; // --- FIX: Import Vendor from the new central types file ---

interface VendorCardProps {
  vendor: Vendor;
  onPress: () => void;
  index: number;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onPress, index }) => {
  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Image 
          source={{ uri: vendor.logo_url || 'https://placehold.co/400x400/EBF4FF/3B82F6?text=Logo' }}
          style={styles.logo}
        />
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{vendor.description}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.infoText}>{vendor.rating || '4.5'}</Text>
            </View>
            <View style={styles.infoChip}>
              <Clock size={12} color="#3B82F6" />
              <Text style={styles.infoText}>{vendor.delivery_time_range || '30 min'}</Text>
            </View>
            {vendor.is_certified && (
              <View style={[styles.infoChip, {backgroundColor: '#E0F2FE'}]}>
                <ShieldCheck size={12} color="#0284C7" />
                <Text style={[styles.infoText, {color: '#0369A1'}]}>Certified</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
// Styles remain the same
const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 16, flexDirection: 'row', padding: 12, alignItems: 'center', shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, },
  logo: { width: 64, height: 64, borderRadius: 12, marginRight: 12, backgroundColor: '#F8FAFC', },
  details: { flex: 1, },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', },
  description: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 8, },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 4, },
  infoText: { fontSize: 11, fontWeight: '500', color: '#475569', },
});

export default VendorCard;