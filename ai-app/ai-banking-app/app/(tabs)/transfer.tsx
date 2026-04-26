
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Send, User } from 'lucide-react-native';
import { getStoredLanguage, translations, Language } from '../../constants/translations';
import { useVoiceAssistant } from '../../hooks/use-voice-assistant';

const { width } = Dimensions.get('window');

export default function TransferScreen() {
  const [lang, setLang] = useState<Language>('en');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const { speak, stop } = useVoiceAssistant();

  useEffect(() => {
    const init = async () => {
      const storedLang = await getStoredLanguage();
      setLang(storedLang);
      const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
      speak(translations[storedLang].transfer_money, { language: ttsLang });
    };
    init();
    return () => stop();
  }, []);

  const handleTransfer = () => {
    if (!accountNumber || !amount) {
      const ttsLang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
      const msg = lang === 'en' ? "Please enter account number and amount." : lang === 'te' ? "దయచేసి ఖాతా సంఖ్య మరియు మొత్తాన్ని నమోదు చేయండి." : "कृपया खाता संख्या और राशि दर्ज करें।";
      speak(msg, { language: ttsLang });
      Alert.alert("Error", msg);
      return;
    }

    router.push({
      pathname: '/confirm-payment',
      params: { 
        amount, 
        contactName: accountNumber, 
        contactEmoji: '🏦' 
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations[lang].transfer_money}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{translations[lang].enter_account}</Text>
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{translations[lang].enter_amount_hint}</Text>
          <TextInput
            style={styles.input}
            placeholder="₹ 0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={styles.transferButton} onPress={handleTransfer}>
          <Send size={24} color="#FFFFFF" />
          <Text style={styles.transferButtonText}>{translations[lang].confirm.toUpperCase()}</Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    padding: 24,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    height: 70,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  transferButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  transferButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});
