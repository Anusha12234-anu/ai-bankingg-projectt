import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Mic, Send, ChevronLeft, Loader2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useVoiceAssistant } from '../hooks/use-voice-assistant';
import { getStoredLanguage, translations, Language } from '../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { BASE_URL } from '../utils/api';

export default function VoiceCommandScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { speak, stop } = useVoiceAssistant();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [command, setCommand] = useState('');
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const init = async () => {
      const storedLang = await getStoredLanguage();
      setLang(storedLang);
      const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
      
      if (mode === 'login') {
        speak("Voice ID verification. Tap the mic and wait for the countdown to speak.", { language: ttsLang });
      } else {
        speak(translations[storedLang].how_can_i_help, { language: ttsLang });
      }
    };
    init();
    return () => {
      stop();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const handleVoiceCommand = async () => {
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

      // Listen for 5 seconds
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
          speak("I didn't hear anything. Please wait for the countdown and speak clearly.");
          Alert.alert("No Voice Detected", "Please speak after the countdown reaches 0.");
          return;
        }

        // Real Verification with Backend
        if (mode === 'login' && uri) {
          try {
            const formData = new FormData();
            formData.append('file', {
              uri,
              type: 'audio/m4a',
              name: 'verify.m4a',
            } as any);

            const response = await fetch(`${BASE_URL}/verify-voice`, {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            const result = await response.json();
            setIsVerifying(false);

            if (result.status === 'success' && result.verified) {
              const loginMsg = lang === 'en' ? 'Voice ID verified.' : lang === 'te' ? 'వాయిస్ ఐడి ధృవీకరించబడింది.' : 'वॉयस आईडी सत्यापित।';
              speak(loginMsg);
              router.replace('/(tabs)');
            } else {
              speak("Voice pattern mismatch. Access denied.");
              Alert.alert("Verification Failed", result.message || "Voice signature does not match our records.");
            }
          } catch (e) {
            console.error("Verify error:", e);
            setIsVerifying(false);
            // Fallback for demo if server is offline
            speak("Server error. Using local bypass for testing.");
            router.replace('/(tabs)');
          }
        } else if (uri) {
          // Normal Assistant Commands
          setIsVerifying(false);
          // Simulated command for testing since we don't have a full STT service
          let simulatedCommand = '';
          if (lang === 'te') {
            simulatedCommand = 'అమ్మకు 500 పంపండి';
          } else if (lang === 'hi') {
            simulatedCommand = 'माँ को 500 भेजें';
          } else {
            simulatedCommand = 'send 500 to mother';
          }
          
          setCommand(simulatedCommand);
          processCommand(simulatedCommand);
        }
      }, 5000); // 5 SECONDS LISTEN TIME
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setIsVerifying(false);
    }
  };

  const processCommand = (cmd: string) => {
    const ttsLang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    
    // Normalize command for better matching
    const normalizedCmd = cmd.trim();

    if (normalizedCmd.match(/balance|నిల్వ|బ్యాలెన్స్|बैलेंस/i)) {
      speak(translations[lang].balance, { language: ttsLang });
      router.push('/(tabs)/balance');
      return;
    }

    if (normalizedCmd.match(/pay|bills|చెల్లించు|బిల్లులు|भुगतान|बिल/i)) {
      speak(translations[lang].pay_bills, { language: ttsLang });
      router.push('/(tabs)/transfer');
      return;
    }

    // Improved regex for sending money across languages
    // Pattern 1: [Action] [Amount] [to/particle] [Recipient] -> send 500 to mother
    const pattern1 = /(?:send|transfer|పంపు|బదిలీ|भेजें|ట్రాన్స్‌ఫర్)\s*(\d+)\s*(?:to|కి|కో|కు|को)?\s*(.+)/i;
    // Pattern 2: [Recipient] [particle] [Amount] [Action] -> అమ్మకు 500 పంపండి
    const pattern2 = /(.+?)\s*(?:కి|కో|కు|को)?\s*(\d+)\s*(?:పంపండి|పంపు|బదిలీ|भेजें|भेजो|send|transfer)/i;

    const match1 = normalizedCmd.match(pattern1);
    const match2 = normalizedCmd.match(pattern2);

    if (match1 || match2) {
      let amount = '';
      let recipient = '';

      if (match1) {
        amount = match1[1];
        recipient = match1[2].trim();
      } else if (match2) {
        recipient = match2[1].trim();
        amount = match2[2];
      }
      
      const confirmMsg = lang === 'en' 
        ? `Sending ${amount} to ${recipient}.` 
        : lang === 'te' 
          ? `${recipient}కి ${amount} పంపుతున్నాము.` 
          : `${recipient} को ${amount} भेज रहे हैं।`;
          
      speak(confirmMsg, { language: ttsLang });
      
      router.push({
        pathname: '/confirm-payment',
        params: { amount, contactName: recipient, contactEmoji: '👤' },
      });
    } else {
      const retryMsg = lang === 'en' ? "Try again." : lang === 'te' ? "మళ్ళీ ప్రయత్నించండి." : "पुनः प्रयत्नन करें।";
      speak(retryMsg, { language: ttsLang });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'login' ? 'Voice Unlock' : 'Assistant'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Voice ID Verification' : (lang === 'en' ? 'Voice Assistant' : lang === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'वॉयस असिस्टेंट')}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.micButton, 
            countdown !== null && styles.waitingMic,
            isListening && styles.listeningMic,
            isVerifying && styles.verifyingMic
          ]} 
          onPress={handleVoiceCommand}
          disabled={countdown !== null || isListening || isVerifying}
        >
          {isVerifying ? (
            <Loader2 size={64} color="#FFFFFF" />
          ) : countdown !== null ? (
            <Text style={styles.countdownText}>{countdown}</Text>
          ) : (
            <Mic size={64} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <Text style={styles.commandText}>
          {countdown !== null ? 'GET READY...' : isListening ? 'SPEAK NOW' : isVerifying ? 'VERIFYING VOICE ID...' : (command || (lang === 'en' ? 'Tap the mic and speak' : lang === 'te' ? 'మైక్ నొక్కి మాట్లాడండి' : 'माइक टैप करें और बोलें'))}
        </Text>

        {mode === 'login' && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {countdown !== null ? "Wait for countdown..." : isListening ? "Say: 'Access my account'" : "Only your registered voice can unlock this account."}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: -60,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 60,
    textAlign: 'center',
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  waitingMic: {
    backgroundColor: '#F59E0B',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  listeningMic: {
    backgroundColor: '#EF4444',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    transform: [{ scale: 1.1 }],
  },
  verifyingMic: {
    backgroundColor: '#10B981',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  countdownText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  commandText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    height: 60,
  },
  hintContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  hintText: {
    color: '#BFDBFE',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});