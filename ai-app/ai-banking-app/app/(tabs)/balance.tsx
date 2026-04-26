import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../utils/api";
import { Home } from "lucide-react-native";
import { getStoredLanguage, translations, Language } from "../../constants/translations";
import { useVoiceAssistant } from "../../hooks/use-voice-assistant";

export default function Balance() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState('0.00');
  const [lang, setLang] = useState<Language>('en');
  const { speak, stop } = useVoiceAssistant();

  const authenticate = useCallback(async () => {
    setLoading(true);
    setIsAuthenticated(false);
    
    const storedLang = await getStoredLanguage();
    setLang(storedLang);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert("Error", "Biometric hardware not available.");
        router.back();
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          "Error",
          "No biometrics enrolled. Please set up biometrics in your device settings."
        );
        router.back();
        return;
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: translations[storedLang].your_balance,
      });

      if (success) {
        const user = await api.getUser();
        if (user) {
          const balValue = user.balance.toFixed(2);
          setBalance(balValue);
          setIsAuthenticated(true);
          
          // Removed voice announcement for security as requested
        } else {
          Alert.alert("Error", "Could not fetch balance from server.");
          router.back();
        }
      } else {
        Alert.alert("Error", "Authentication failed.");
        router.back();
      }
    } catch (error) {
      console.error("Auth error:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [speak]);

  // useFocusEffect will run every time the screen is focused (opened)
  useFocusEffect(
    useCallback(() => {
      authenticate();
      
      // Cleanup when screen loses focus
      return () => {
        stop();
      };
    }, [authenticate, stop])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={{ marginTop: 10 }}>Authenticating...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.title}>{translations[lang].your_balance}</Text>
        <Text style={styles.amount}>₹{balance}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.homeBtn} 
        onPress={() => router.replace('/(tabs)')}
      >
        <Home size={24} color="#FFFFFF" />
        <Text style={styles.homeBtnText}>{translations[lang].back_home}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '600',
  },
  amount: {
    fontSize: 48,
    fontWeight: "900",
    color: '#1E3A8A',
  },
  homeBtn: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    elevation: 2,
  },
  homeBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});
