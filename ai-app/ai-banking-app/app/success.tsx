import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function SuccessScreen() {
  const params = useLocalSearchParams();
  const recipientName = params.name as string || 'Sarah Johnson';
  const amount = params.amount as string || '250.00';

  useEffect(() => {
    speakSuccess();
  }, []);

  const speakSuccess = () => {
    Speech.speak(`Success! Your payment of ${amount} dollars to ${recipientName} has been processed successfully.`, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <View style={styles.checkmarkCircle}>
          <Check size={64} color="#10B981" />
        </View>

        <Text style={styles.successTitle}>SUCCESS!</Text>
        <Text style={styles.successSubtitle}>
          Your payment has been processed successfully.
        </Text>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount Sent</Text>
          <Text style={styles.amountValue}>${amount}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To</Text>
            <Text style={styles.detailValue}>{recipientName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ref ID</Text>
            <Text style={styles.detailValue}>TXN{Math.floor(Math.random() * 1000000)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
        <Text style={styles.homeButtonText}>BACK TO HOME</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10B981', // Green background
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },
  amountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  homeButtonText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
