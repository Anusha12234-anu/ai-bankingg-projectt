
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as LocalAuthentication from 'expo-local-authentication';
import { useVoiceAssistant } from '../hooks/use-voice-assistant';
import { api } from '../utils/api';
import { getStoredLanguage, translations, Language } from '../constants/translations';

// Define a type for the transaction for safety
interface Transaction {
  id: string;
  amount: string;
  contactName: string;
  contactEmoji: string;
  date: string;
  status: 'Success' | 'Failed';
}

export default function ConfirmPaymentScreen() {
  const [lang, setLang] = useState<Language>('en');
  // Use a generic to strongly type the params from the router
  const { 
    amount = '0', 
    contactName = 'Unknown', 
    contactEmoji = '👤',
    contactPhone = ''
  } = useLocalSearchParams<{ amount: string; contactName: string; contactEmoji: string; contactPhone?: string }>();
  
  const { speak, stop } = useVoiceAssistant();

  useEffect(() => {
    init();
    return () => stop();
  }, [amount, contactName, speak, stop]);

  const init = async () => {
    const storedLang = await getStoredLanguage();
    setLang(storedLang);
    
    const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
    
    // Only speak the money amount
    const msg = storedLang === 'en' ? `${amount} rupees.` : storedLang === 'te' ? `${amount} రూపాయలు.` : `${amount} रुपये।`;
    
    await Speech.stop();
    speak(msg, { language: ttsLang });
  };

  const handleConfirm = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    // If biometrics are available and enrolled, use them.
    if (hasHardware && isEnrolled) {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: `Confirm sending ₹${amount} to ${contactName}`,
      });
      await handleTransaction(success);
    } else {
      // Fallback for emulators or devices without biometrics.
      // In a real app, you'd ask for a PIN here.
      console.log('Biometrics not available. Proceeding with manual confirmation.');
      Alert.alert(
        'Confirm Transaction',
        `Do you want to send ₹${amount} to ${contactName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: () => handleTransaction(true) }
        ]
      );
    }
  };

  const handleTransaction = async (wasSuccessful: boolean) => {
    const transactionData = {
      recipient_name: contactName,
      recipient_emoji: contactEmoji,
      amount: parseFloat(amount),
      status: wasSuccessful ? 'Success' : 'Failed',
    };

    let result = null;
    let apiError = null;
    try {
      console.log('Attempting to save transaction to backend:', transactionData);
      result = await api.createTransaction(transactionData);
      if (!result) {
        apiError = "Server returned empty response";
      }
    } catch (e: any) {
      apiError = e.message || "Unknown network error";
      console.error("Failed to save transaction to backend:", e);
    }

    if (apiError) {
      Alert.alert(
        'Connection Error', 
        `Could not connect to the banking server. Your balance might not update.\n\nError: ${apiError}\n\nCheck if your PC and Phone are on the same Wi-Fi.`,
        [{ text: 'OK', onPress: () => proceedWithNavigation(wasSuccessful, result) }]
      );
    } else {
      proceedWithNavigation(wasSuccessful, result);
    }
  };

  const proceedWithNavigation = (wasSuccessful: boolean, result: any) => {
    if (wasSuccessful) {
      router.replace({ 
        pathname: '/transaction-success', 
        params: { 
          amount, 
          contactName, 
          contactEmoji, 
          status: 'Success',
          contactPhone: contactPhone || '',
          id: result?.id || `TXN${Math.floor(Math.random() * 1000000)}`,
          date: result?.date ? new Date(result.date).toLocaleDateString() : new Date().toLocaleDateString()
        } 
      });
    } else {
      router.replace({ pathname: '/transaction-failure', params: { amount, contactName, contactEmoji, status: 'Failed' } });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations[lang].confirm_payment}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{lang === 'en' ? 'You are sending' : lang === 'te' ? 'మీరు పంపుతున్నారు' : 'आप भेज रहे हैं'}</Text>
        <Text style={styles.amount}>₹{amount}</Text>
        <Text style={styles.label}>{lang === 'en' ? 'to' : lang === 'te' ? 'ఎవరికి' : 'को'}</Text>
        <Text style={styles.recipient}>{contactEmoji} {contactName}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleConfirm}>
          <Send size={24} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>{translations[lang].send.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  label: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  amount: {
    fontSize: 64,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 24,
  },
  recipient: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  footer: {
    padding: 24,
  },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});
