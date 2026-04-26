import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, User, Info, Check, Mic } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export default function ConfirmScreen() {
  const params = useLocalSearchParams();
  const recipientName = params.name as string || 'Sarah Johnson';
  const recipientPhone = params.phone as string || '**** 1234';
  const [amount, setAmount] = useState(params.amount as string || '0');
  const [isListeningForConfirm, setIsListeningForConfirm] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

  useEffect(() => {
    speakDetails();
  }, []);

  const speakDetails = () => {
    Speech.speak(`Review carefully. You are sending ${amount} to ${recipientName}. Please say "SEND" to confirm this transaction.`, {
      language: 'en',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const handleConfirmPress = () => {
    setShowVoiceOverlay(true);
    setIsListeningForConfirm(true);
    Speech.speak('Listening for confirmation. Please say "SEND" now.', {
      onDone: () => {
        // Mock successful voice command detection after 2 seconds
        setTimeout(() => {
          handleFinalSuccess();
        }, 2000);
      }
    });
  };

  const handleFinalSuccess = () => {
    setIsListeningForConfirm(false);
    Speech.speak('Command received. Processing transaction.');
    setTimeout(() => {
      router.push({
        pathname: '/success',
        params: { 
          name: recipientName,
          amount: amount
        }
      });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Transaction</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.warningBox}>
        <Info size={20} color="#B45309" />
        <View style={styles.warningTextContainer}>
          <Text style={styles.warningTitle}>Review Carefully</Text>
          <Text style={styles.warningSubtitle}>Please verify all details. Say "SEND" to complete the payment.</Text>
        </View>
      </View>

      <View style={styles.recipientCard}>
        <View style={styles.userIconCircle}>
          <User size={40} color="#2563EB" />
        </View>
        <Text style={styles.recipientName}>{recipientName}</Text>
        <Text style={styles.recipientDetails}>{recipientPhone}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={styles.amountInputRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.detailsList}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Available Balance</Text>
          <Text style={styles.detailValue}>$5,000.00</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction Fee</Text>
          <Text style={styles.detailValue}>$0.00</Text>
        </View>
        <View style={[styles.detailRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${amount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPress}>
        <Mic size={24} color="#FFFFFF" />
        <Text style={styles.confirmButtonText}>SAY "SEND" TO CONFIRM</Text>
      </TouchableOpacity>

      {showVoiceOverlay && (
        <View style={styles.voiceOverlay}>
          <View style={styles.voiceOverlayContent}>
            <Mic size={64} color="#2563EB" />
            <Text style={styles.voiceOverlayText}>
              {isListeningForConfirm ? 'Listening for "SEND"...' : 'Command Received!'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  warningSubtitle: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
  recipientCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  userIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#EFF6FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  recipientDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    padding: 0,
    flex: 1,
  },
  detailsList: {
    marginBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 1,
  },
  voiceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  voiceOverlayContent: {
    alignItems: 'center',
    padding: 40,
  },
  voiceOverlayText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
});
