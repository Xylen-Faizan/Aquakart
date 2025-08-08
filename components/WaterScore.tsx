import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Droplet } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type WaterScoreProps = {
  score: number;
};

/**
 * A card component to display the user's "Water Score" and
 * provide a link to learn more about the rewards.
 */
export default function WaterScore({ score }: WaterScoreProps) {
  const router = useRouter();

  const getNextMilestone = () => {
    if (score < 100) return 100;
    if (score < 500) return 500;
    if (score < 1000) return 1000;
    return null;
  };

  const nextMilestone = getNextMilestone();
  const progress = nextMilestone ? (score / nextMilestone) * 100 : 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Award size={24} color="#F59E0B" />
        <Text style={styles.title}>Your AquaScore</Text>
      </View>
      <Text style={styles.scoreText}>{score}
        <Text style={styles.pointsLabel}> points</Text>
      </Text>
      
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.footer}>
        {nextMilestone ? (
          <Text style={styles.footerText}>
            {nextMilestone - score} points to your next reward!
          </Text>
        ) : (
          <Text style={styles.footerText}>You're an Aqua Legend!</Text>
        )}
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.linkText}>View Rewards</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
