
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Home, History } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as SMS from 'expo-sms';
import { getStoredLanguage, translations, Language } from '../constants/translations';
 

export default function TransactionSuccessScreen() {
  const { amount, contactName, contactEmoji, id, date, contactPhone } = useLocalSearchParams<{
    amount: string;
    contactName: string;
    contactEmoji: string;
    id?: string;
    date?: string;
    contactPhone?: string;
  }>();

  const [lang, setLang] = useState<Language>('en');
  const [smsAttempted, setSmsAttempted] = useState(false);
  const transactionId = id || `TXN${Math.floor(Math.random() * 1000000)}`;
  const transactionDate = date || new Date().toLocaleDateString();

  useEffect(() => {
    init();
    return () => {
      Speech.stop();
    };
  }, [amount, contactName]);

  useEffect(() => {
    const autoNotify = async () => {
      if (smsAttempted) return;
      if (!contactPhone) {
        console.log('No contact phone number provided for SMS.');
        return;
      }
      setSmsAttempted(true);
      await smsReceiver();
    };
    autoNotify();
  }, [smsAttempted, contactPhone]);

  const init = async () => {
    const storedLang = await getStoredLanguage();
    setLang(storedLang);
    
    const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
    const summary = storedLang === 'en' ? `Successfully sent ${amount} rupees to ${contactName}.` : storedLang === 'te' ? `${contactName}కి ${amount} రూపాయలు విజయవంతంగా పంపబడ్డాయి.` : `${contactName} को ${amount} रुपये सफलतापूर्वक भेजे गए।`;
    
    await Speech.stop();
    Speech.speak(summary, { language: ttsLang, rate: 0.9 });
  };

  const requestSmsPermissionIfNeeded = async () => {
    if (Platform.OS !== 'android') return true; // iOS doesn't need runtime permission for direct SMS
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: "SMS Permission",
          message: "This app needs access to send SMS messages for transaction notifications.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const smsReceiver = async () => {
    if (!contactPhone) {
      Alert.alert('Missing Number', 'No phone number found for this contact. SMS cannot be sent.');
      return;
    }

    const granted = await requestSmsPermissionIfNeeded();
    if (!granted) {
      Alert.alert('Permission Denied', 'SMS permission was denied. Cannot send transaction notification.');
      return;
    }

    const body = `₹${amount} has been credited to your account.`;
    const recipients = [contactPhone];

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(recipients, body);
      if (result === 'sent') {
        console.log('SMS sent successfully.');
      } else if (result === 'cancelled') {
        console.log('SMS sending cancelled by user.');
      }
    } else {
      console.log('SMS is not available on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <CheckCircle size={80} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>{translations[lang].success}</Text>
        <Text style={styles.successSubtitle}>
          {lang === 'en' ? 'Successfully sent' : lang === 'te' ? 'విజయవంతంగా పంపబడింది' : 'सफलतापूर्वक भेजा गया'} <Text style={{ fontWeight: 'bold' }}>₹{amount}</Text> {lang === 'en' ? 'to' : lang === 'te' ? 'ఎవరికి' : 'को'} <Text style={{ fontWeight: 'bold' }}>{contactName}</Text>.
        </Text>

        <View style={styles.receiptCard}>
          <Text style={styles.receiptRow}>{lang === 'en' ? 'Amount:' : lang === 'te' ? 'మొత్తం:' : 'राशि:'} <Text style={styles.amountValue}>₹{amount}</Text></Text>
          <Text style={styles.receiptRow}>{lang === 'en' ? 'To:' : lang === 'te' ? 'ఎవరికి:' : 'को:'} {contactEmoji} {contactName}</Text>
          <Text style={styles.receiptRow}>{lang === 'en' ? 'Date:' : lang === 'te' ? 'తేదీ:' : 'तारीख:'} {transactionDate}</Text>
          <Text style={styles.receiptRow}>{lang === 'en' ? 'Transaction ID:' : lang === 'te' ? 'లావాదేవీ ID:' : 'लेनदेन आईडी:'} {transactionId}</Text>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
          <Home size={24} color="#FFFFFF" />
          <Text style={styles.homeBtnText}>{translations[lang].back_home}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/history')}>
          <History size={24} color="#1F2937" />
          <Text style={styles.historyBtnText}>{translations[lang].view_history}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
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
    color: '#10B981',
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
