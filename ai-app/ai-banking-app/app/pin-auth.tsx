import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Fingerprint, Lock, ShieldCheck } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

export default function PinAuthScreen() {
  const params = useLocalSearchParams();
  const mode = params.mode as string || 'transaction';
  const contactName = params.contactName as string || 'Family';
  const amount = params.amount as string || '0';
  const [pin, setPin] = useState('');

  useEffect(() => {
    const instruction = mode === 'login' 
      ? 'Please enter your 4 digit PIN to log in.' 
      : 'Please enter your 4 digit PIN to complete the transaction.';
    
    Speech.speak(instruction, {
      language: 'en',
      rate: 0.9,
    });
  }, [mode]);

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
        // Mock PIN validation: correct PIN is '1234'
        if (newPin === '1234') {
          handleSuccess();
        } else {
          Speech.speak('Incorrect PIN. Please try again.', { rate: 0.9 });
          Alert.alert('Wrong PIN', 'Incorrect PIN. Please try again.');
          setPin('');
        }
      }
    }
  };

  const handleBiometric = async () => {
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: mode === 'login' ? 'Log in with Biometrics' : 'Authenticate to Send Money',
      disableDeviceFallback: true,
    });

    if (biometricAuth.success) {
      handleSuccess();
    }
  };

  const handleSuccess = () => {
    if (mode === 'login') {
      Speech.speak('Login successful. Welcome back.', { rate: 0.9 });
      router.replace('/(tabs)');
    } else {
      Speech.speak(`Transaction successful. ${amount} rupees has been sent to ${contactName}.`, {
        language: 'en',
        rate: 0.9,
      });
      router.replace({
        pathname: '/transaction-success',
        params: { contactName, amount }
      });
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security PIN</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.lockIconContainer}>
          <Lock size={64} color="#2563EB" />
        </View>
        
        <Text style={styles.instruction}>Enter your 4-digit PIN</Text>
        
        <View style={styles.pinDotsContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View 
              key={i} 
              style={[
                styles.pinDot, 
                pin.length >= i && styles.pinDotFilled
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
          <Fingerprint size={32} color="#10B981" />
          <Text style={styles.biometricText}>Use Fingerprint</Text>
        </TouchableOpacity>

        <View style={styles.keypad}>
          {keys.map((key, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.key, !key && styles.emptyKey]}
              onPress={() => key && handleKeyPress(key)}
              disabled={!key}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#EFF6FF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  instruction: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 32,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  pinDotFilled: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 16,
    marginBottom: 40,
    width: '100%',
    justifyContent: 'center',
  },
  biometricText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginLeft: 12,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  key: {
    width: (width - 100) / 3,
    height: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyKey: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
});
