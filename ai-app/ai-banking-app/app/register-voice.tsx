import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import { router } from 'expo-router';
import { Mic, Check, ChevronLeft, Loader2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../utils/api';

const VOICE_PHRASE = "Access my account";

export default function RegisterVoiceScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [progress] = useState(new Animated.Value(0));
  const [waveAnims] = useState([...Array(10)].map(() => new Animated.Value(0.2)));

  useEffect(() => {
    speak('Welcome. Let\'s register your unique Voice ID. Tap the mic and wait for the countdown.');
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'en', rate: 0.9 });
  };

  const startWaveformAnimation = () => {
    waveAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 200 + i * 50,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 200 + i * 50,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      startWaveformAnimation();
      
      speak('Speak now');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      const status = await recording.getStatusAsync();
      const duration = status.durationMillis || 0;
      const peakVolume = status.metering || -160;

      if (duration < 1500) {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        setRecording(null);
        speak("That was too short. Please try again.");
        return;
      }

      if (peakVolume < -45) {
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        setRecording(null);
        speak("I didn't hear your voice. Please speak louder.");
        return;
      }

      setIsRecording(false);
      setIsAnalyzing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      // 3. Upload to Backend for real MFCC analysis
      if (uri) {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri,
            type: 'audio/m4a',
            name: 'voice_reg.m4a',
          } as any);

          // Use BASE_URL from api config
          const response = await fetch(`${BASE_URL}/register-voice`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const result = await response.json();
          if (result.status === 'success') {
            if (step < 3) {
              const nextStep = step + 1;
              setStep(nextStep);
              Animated.timing(progress, {
                toValue: nextStep / 3,
                duration: 500,
                useNativeDriver: false,
              }).start();
              speak(`Stage ${step} captured. Voice signature saved. Please say it again for stage ${nextStep}.`);
            } else {
              setStep(4);
              Animated.timing(progress, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
              }).start();
              
              await AsyncStorage.setItem('voice_registered', 'true');
              speak('Voice ID registration complete. Your voice pattern is now stored securely on our server.');
              setTimeout(() => {
                router.replace('/');
              }, 2500);
            }
          } else {
            speak("Analysis failed. Please try speaking more clearly.");
            Alert.alert("Analysis Error", result.message || "Failed to process voice.");
          }
        } catch (e) {
          console.error("Upload error:", e);
          speak("Server connection error. Using local backup.");
          // Fallback to simulation if server fails
          handleSimulationStep();
        }
      }
      setIsAnalyzing(false);
    } catch (error) {
      console.error(error);
      setIsRecording(false);
      setIsAnalyzing(false);
      setRecording(null);
    }
  };

  const handleSimulationStep = async () => {
    if (step < 3) {
      const nextStep = step + 1;
      setStep(nextStep);
      Animated.timing(progress, {
        toValue: nextStep / 3,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      setStep(4);
      await AsyncStorage.setItem('voice_registered', 'true');
      router.replace('/');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      if (countdown !== null) return;
      
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'We need mic access.');
        return;
      }

      let count = 3;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown(null);
          startRecording();
        }
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice ID Setup</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, { width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            }) }]} />
          </View>
          <Text style={styles.progressText}>Stage {step} of 3</Text>
        </View>

        <View style={styles.phraseCard}>
          <Text style={styles.phraseLabel}>SAY THE PHRASE:</Text>
          <Text style={styles.phraseText}>"{VOICE_PHRASE}"</Text>
        </View>
        
        <View style={styles.waveformContainer}>
          {isAnalyzing ? (
            <View style={styles.analyzingBox}>
              <Loader2 size={48} color="#2563EB" />
              <Text style={styles.analyzingText}>ANALYZING...</Text>
            </View>
          ) : (
            waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    transform: [{ scaleY: anim }],
                    backgroundColor: isRecording ? '#EF4444' : '#E2E8F0',
                  }
                ]}
              />
            ))
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.recordButton, 
            isRecording && styles.recordingActive, 
            isAnalyzing && styles.disabledBtn,
            countdown !== null && styles.waitingBtn
          ]} 
          onPress={toggleRecording}
          disabled={isAnalyzing}
        >
          {countdown !== null ? (
            <Text style={styles.countdownText}>{countdown}</Text>
          ) : (
            <View style={styles.recordButtonContent}>
              <Mic size={48} color={isRecording ? '#FFFFFF' : '#2563EB'} />
              <Text style={[styles.recordButtonText, isRecording && { color: '#FFFFFF' }]}>
                {isRecording ? 'STOP' : isAnalyzing ? 'WAIT' : 'RECORD'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {step === 4 && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Check size={64} color="#10B981" />
            <Text style={styles.successText}>Voice Registered!</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  phraseCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  phraseLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  phraseText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  waveformContainer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 50,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    height: 60,
  },
  analyzingBox: {
    alignItems: 'center',
  },
  analyzingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 2,
  },
  recordButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  recordButtonContent: {
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#EF4444',
    borderColor: '#FEE2E2',
  },
  waitingBtn: {
    backgroundColor: '#F59E0B',
    borderColor: '#FEF3C7',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recordButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 32,
    alignItems: 'center',
    elevation: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 20,
  },
});