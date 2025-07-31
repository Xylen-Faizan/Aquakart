import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Mail, CircleHelp as HelpCircle } from 'lucide-react-native';
import Chatbot from '@/components/Chatbot';

export default function CustomerSupport() {
  const faqItems = [
    {
      id: 1,
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time from the Orders tab. Click on "Track Order" to see live location updates.',
    },
    {
      id: 2,
      question: 'What is the delivery time?',
      answer: 'Our promise is 10-15 minutes delivery. Most orders are delivered within 12 minutes of placement.',
    },
    {
      id: 3,
      question: 'How do I return empty bottles?',
      answer: 'Our delivery partner will collect empty bottles during your next delivery. You can also enable Eco-Mode for rewards.',
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer: 'We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery.',
    },
  ];



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Support & Help</Text>
        <Text style={styles.subtitle}>We're here to help 24/7</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard}>
              <Phone size={24} color="#2563EB" />
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSubtitle}>+91 1800-123-4567</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactCard}>
              <Mail size={24} color="#059669" />
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactSubtitle}>help@aquaflow.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chatbot Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat with Support</Text>
          <View style={styles.chatbotContainer}>
            <Chatbot />
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {faqItems.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <View style={styles.faqQuestion}>
                  <HelpCircle size={20} color="#2563EB" />
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Topics</Text>
          <View style={styles.topicsGrid}>
            {[
              'Order Issues',
              'Payment Problems',
              'Delivery Delays',
              'Quality Concerns',
              'Account Settings',
              'Subscription Help',
            ].map((topic) => (
              <TouchableOpacity key={topic} style={styles.topicCard}>
                <Text style={styles.topicText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  chatbotContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 400,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});