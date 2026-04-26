
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { XCircle, Home, History } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function TransactionFailureScreen() {
  const { amount, contactName } = useLocalSearchParams();

  useEffect(() => {
    const summary = `Failed to send ${amount} rupees to ${contactName}. Please try again.`;
    Speech.speak(summary, { language: 'en', rate: 0.9 });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.failureIconContainer}>
          <XCircle size={80} color="#FFFFFF" />
        </View>
        <Text style={styles.failureTitle}>Payment Failed</Text>
        <Text style={styles.failureSubtitle}>Your transaction could not be completed.</Text>

        <View style={styles.receiptCard}>
          <Text style={styles.receiptRow}>Amount: <Text style={styles.amountValue}>₹{amount}</Text></Text>
          <Text style={styles.receiptRow}>To: {contactName}</Text>
          <Text style={styles.receiptRow}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Home size={24} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/history')}>
          <History size={24} color="#1F2937" />
          <Text style={styles.historyBtnText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failureIconContainer: {
    marginBottom: 24,
  },
  failureTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  failureSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 40,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
  },
  receiptRow: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  amountValue: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  homeBtn: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
  },
  homeBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  historyBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  historyBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 12,
  },
});
