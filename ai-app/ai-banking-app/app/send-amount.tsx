
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Mic, Check, Loader2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as LocalAuthentication from 'expo-local-authentication';
import { getStoredLanguage, translations, Language } from '../constants/translations';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function SendAmountScreen() {
  const params = useLocalSearchParams();
  const contactName = params.contactName as string || 'Family';
  const contactEmoji = params.contactEmoji as string || '👨‍👩‍👧';
  const contactPhone = (params as any).contactPhone as string | undefined;
  const [amount, setAmount] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    init();
    return () => {
      Speech.stop();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const init = async () => {
    const storedLang = await getStoredLanguage();
    setLang(storedLang);
    
    const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
    const msg = storedLang === 'en' ? `How much would you like to send to ${contactName}?` : storedLang === 'te' ? `${contactName}కి ఎంత పంపాలనుకుంటున్నారు?` : `${contactName} को आप कितना भेजना चाहेंगे?`;
    
    await Speech.stop();
    Speech.speak(msg, { language: ttsLang, rate: 0.9 });
  };

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setAmount(amount.slice(0, -1));
    } else if (amount.length < 8) {
      if (key === '.' && amount.includes('.')) return;
      setAmount(amount + key);
    }
  };

  const handleSpeakAmount = async () => {
    if (isListening || isVerifying || countdown !== null) return;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert("Permission Required", "Mic access needed.");
        return;
      }

      // 1. Start 3-second Countdown
      let count = 3;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown(null);
          startListening();
        }
      }, 1000);

    } catch (e) {
      console.error(e);
      setCountdown(null);
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);

      let maxVolume = -160;
      const volumeInterval = setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (status.metering !== undefined) {
          if (status.metering > maxVolume) maxVolume = status.metering;
        }
      }, 100);

      // Listen for 3 seconds for the amount
      setTimeout(async () => {
        clearInterval(volumeInterval);
        setIsListening(false);
        setIsVerifying(true);
        
        const uri = recording.getURI();
        await recording.stopAndUnloadAsync();
        setRecording(null);

        const someoneTalked = maxVolume > -45;

        if (!someoneTalked) {
          setIsVerifying(false);
          const msg = lang === 'en' ? "I didn't hear anything." : lang === 'te' ? "నేను ఏమీ వినలేదు." : "मैंने कुछ नहीं सुना।";
          Speech.speak(msg);
          return;
        }

        // Simulated voice command for testing since we don't have a full STT service
        setTimeout(() => {
          setIsVerifying(false);
          const simulatedAmount = '500'; // Simulation
          setAmount(simulatedAmount);
          const msg = lang === 'en' ? `${simulatedAmount} rupees set.` : lang === 'te' ? `${simulatedAmount} రూపాయలు సెట్ చేయబడింది.` : `${simulatedAmount} रुपये सेट।`;
          const ttsLang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
          Speech.speak(msg, { language: ttsLang });
        }, 1500);
      }, 3000); 
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setIsVerifying(false);
    }
  };

  const handleNext = async () => {
    if (!amount || parseFloat(amount) === 0) {
      Speech.speak('Please enter a valid amount.', { language: 'en', rate: 0.9 });
      Alert.alert('Invalid Amount', 'Please enter a valid amount to send.');
      return;
    }

    router.push({
      pathname: '/confirm-payment',
      params: { amount, contactName, contactEmoji, contactPhone: contactPhone || '' }
    });
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations[lang].enter_amount}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.recipientBadge}>
        <Text style={styles.recipientEmoji}>{contactEmoji}</Text>
        <Text style={styles.recipientName}>{lang === 'en' ? 'To:' : lang === 'te' ? 'ఎవరికి:' : 'को:'} {contactName}</Text>
      </View>

      <View style={styles.amountDisplay}>
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.amountText}>{amount || '0'}</Text>
      </View>

      <View style={styles.keypadContainer}>
        <View style={styles.keypad}>
          {keys.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handleKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.voiceButton,
            countdown !== null && { backgroundColor: '#F59E0B' },
            isListening && { backgroundColor: '#EF4444' },
            isVerifying && { backgroundColor: '#10B981' }
          ]}
          onPress={handleSpeakAmount}
          disabled={countdown !== null || isListening || isVerifying}
        >
          {isVerifying ? (
            <Loader2 size={32} color="#FFFFFF" />
          ) : countdown !== null ? (
            <Text style={styles.voiceText}>{countdown}</Text>
          ) : (
            <Mic size={32} color="#FFFFFF" />
          )}
          <Text style={styles.voiceText}>
            {countdown !== null ? 'READY...' : isListening ? 'SPEAK NOW' : isVerifying ? 'PROCESSING...' : (lang === 'en' ? 'Speak Amount' : lang === 'te' ? 'మొత్తం చెప్పండి' : 'राशि बोलें')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.nextButton, !amount && { opacity: 0.5 }]}
          onPress={handleNext}
          disabled={!amount}
        >
          <Text style={styles.nextButtonText}>{translations[lang].confirm.toUpperCase()}</Text>
          <Check size={24} color="#FFFFFF" />
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 40,
    padding: 12,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 20,
  },
  recipientEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 10,
  },
  amountText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#2563EB',
  },
  keypadContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    justifyContent: 'space-between',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: (width - 80) / 3,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  voiceButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 12,
  },
});
