import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Clipboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gift, Users, Copy, Share2, DollarSign, Trophy, Star } from 'lucide-react-native';
import { authService } from '@/lib/auth';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  recentReferrals: Array<{
    id: string;
    name: string;
    date: string;
    status: 'pending' | 'completed';
    earnings: number;
  }>;
}

export default function ReferEarn() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: 'AQUA123',
    totalReferrals: 12,
    totalEarnings: 600,
    pendingEarnings: 150,
    recentReferrals: [
      { id: '1', name: 'John Doe', date: '2 days ago', status: 'completed', earnings: 50 },
      { id: '2', name: 'Sarah Wilson', date: '5 days ago', status: 'completed', earnings: 50 },
      { id: '3', name: 'Mike Johnson', date: '1 week ago', status: 'pending', earnings: 50 },
    ]
  });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      // In real app, fetch from backend
      // For now, using mock data
      setLoading(false);
    } catch (error) {
      console.error('Error loading referral data:', error);
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(referralData.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const handleShare = async () => {
    try {
      const message = `Hey! Join AquaFlow for 10-15 min water delivery. Use my referral code ${referralData.referralCode} and get ₹50 off your first order. I'll also get ₹50! Download: https://aquaflow.app`;
      
      await Share.share({
        message,
        title: 'Join AquaFlow - Get ₹50 Off!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#059669' : '#F59E0B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Gift size={48} color="#2563EB" />
          <Text style={styles.heroTitle}>Earn ₹50 for Every Friend</Text>
          <Text style={styles.heroSubtitle}>
            Invite friends to AquaFlow and both of you get ₹50 when they place their first order
          </Text>
        </View>

        {/* Earnings Overview */}
        <View style={styles.earningsSection}>
          <View style={styles.earningsCard}>
            <DollarSign size={24} color="#059669" />
            <Text style={styles.earningsAmount}>₹{referralData.totalEarnings}</Text>
            <Text style={styles.earningsLabel}>Total Earned</Text>
          </View>
          <View style={styles.earningsCard}>
            <Users size={24} color="#2563EB" />
            <Text style={styles.earningsAmount}>{referralData.totalReferrals}</Text>
            <Text style={styles.earningsLabel}>Friends Referred</Text>
          </View>
          <View style={styles.earningsCard}>
            <Trophy size={24} color="#F59E0B" />
            <Text style={styles.earningsAmount}>₹{referralData.pendingEarnings}</Text>
            <Text style={styles.earningsLabel}>Pending</Text>
          </View>
        </View>

        {/* Referral Code Section */}
        <View style={styles.codeSection}>
          <Text style={styles.codeTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{referralData.referralCode}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Copy size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color="#FFF" />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share your code</Text>
                <Text style={styles.stepDescription}>Send your referral code to friends and family</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Friend signs up</Text>
                <Text style={styles.stepDescription}>They create an account using your code</Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Both earn ₹50</Text>
                <Text style={styles.stepDescription}>When they place their first order, you both get ₹50</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Referrals */}
        <View style={styles.referralsSection}>
          <Text style={styles.sectionTitle}>Recent Referrals</Text>
          <View style={styles.referralsList}>
            {referralData.recentReferrals.map((referral) => (
              <View key={referral.id} style={styles.referralCard}>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{referral.name}</Text>
                  <Text style={styles.referralDate}>{referral.date}</Text>
                </View>
                <View style={styles.referralEarnings}>
                  <Text style={styles.earningsText}>₹{referral.earnings}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(referral.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(referral.status) }
                    ]}>
                      {referral.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Referral bonus is credited after the referred user's first successful order{'\n'}
            • Maximum referral bonus per month is ₹1000{'\n'}
            • Referral earnings can be used for future orders{'\n'}
            • AquaFlow reserves the right to modify the referral program
          </Text>
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  earningsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  codeSection: {
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
  codeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  howItWorksSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  stepsList: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  referralsSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  referralsList: {
    gap: 12,
  },
  referralCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  referralDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  referralEarnings: {
    alignItems: 'flex-end',
  },
  earningsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  termsSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});