import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint, Smartphone, LogIn, Mic, UserPlus, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isVoiceRegistered, setIsVoiceRegistered] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      const registered = await AsyncStorage.getItem('voice_registered');
      setIsVoiceRegistered(registered === 'true');
    })();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      if (!savedBiometrics) {
        return Alert.alert(
          'Biometric record not found',
          'Please ensure you have set up biometrics on your device.'
        );
      }

      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        disableDeviceFallback: true,
      });

      if (biometricAuth.success) {
        router.replace('/language-select');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred during authentication.');
    }
  };

  const handlePINAuth = () => {
    router.push({ pathname: '/pin-auth', params: { mode: 'login' } });
  };

  const handleVoiceUnlock = () => {
    // Navigate to a temporary voice-login verification screen
    router.push({
      pathname: '/voice',
      params: { mode: 'login' }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Secure Login</Text>
        <Text style={styles.subtitle}>Welcome to AI Banking</Text>
      </View>

      <View style={styles.authContainer}>
        <TouchableOpacity 
          style={styles.biometricButton} 
          onPress={() => router.push({ pathname: '/voice', params: { mode: 'login' } })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Mic size={48} color="#2563EB" />
          </View>
          <Text style={styles.biometricText}>Voice Unlock</Text>
          <Text style={styles.biometricSubtext}>Fast & Secure</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.biometricButton} 
          onPress={() => router.push({ pathname: '/pin-auth', params: { mode: 'login' } })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
            <LogIn size={48} color="#F59E0B" />
          </View>
          <Text style={styles.biometricText}>Enter PIN</Text>
          <Text style={styles.biometricSubtext}>Manual Access</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.setupButton} onPress={() => router.push('/register-voice')}>
          <UserPlus size={20} color="#FFFFFF" />
          <Text style={styles.setupButtonText}>Setup Voice ID</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.langButton} onPress={() => router.push('/language-select')}>
          <Text style={styles.langIcon}>🌐</Text>
          <Text style={styles.langText}>Change Language</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
  authContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  biometricButton: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  biometricSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 40,
    gap: 16,
  },
  setupButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  langButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  langIcon: {
    fontSize: 20,
  },
  langText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
