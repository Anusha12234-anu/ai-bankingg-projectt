
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Zap, Droplets, Smartphone, Flame } from 'lucide-react-native';
import { getStoredLanguage, translations, Language } from '../../constants/translations';
import { useVoiceAssistant } from '../../hooks/use-voice-assistant';

const { width } = Dimensions.get('window');

export default function BillsScreen() {
  const [lang, setLang] = useState<Language>('en');
  const { speak, stop } = useVoiceAssistant();

  useEffect(() => {
    const init = async () => {
      const storedLang = await getStoredLanguage();
      setLang(storedLang);
      const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
      speak(translations[storedLang].pay_bills, { language: ttsLang });
    };
    init();
    return () => stop();
  }, []);

  const billTypes = [
    { id: '1', name: 'electricity', icon: <Zap size={32} color="#FFFFFF" />, color: '#F59E0B' },
    { id: '2', name: 'water', icon: <Droplets size={32} color="#FFFFFF" />, color: '#3B82F6' },
    { id: '3', name: 'mobile_recharge', icon: <Smartphone size={32} color="#FFFFFF" />, color: '#10B981' },
    { id: '4', name: 'gas', icon: <Flame size={32} color="#FFFFFF" />, color: '#EF4444' },
  ];

  const handleBillSelect = (billName: string) => {
    const ttsLang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
    speak(translations[lang][billName], { language: ttsLang });
    // In a real app, this would navigate to a specific bill payment screen
    Alert.alert(translations[lang][billName], "Coming soon!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations[lang].pay_bills}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {billTypes.map((bill) => (
            <TouchableOpacity 
              key={bill.id} 
              style={[styles.billCard, { backgroundColor: bill.color }]}
              onPress={() => handleBillSelect(bill.name)}
            >
              <View style={styles.iconContainer}>
                {bill.icon}
              </View>
              <Text style={styles.billName}>{translations[lang][bill.name]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    padding: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  billCard: {
    width: (width - 64) / 2,
    height: 160,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  billName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
import { Alert } from 'react-native';
