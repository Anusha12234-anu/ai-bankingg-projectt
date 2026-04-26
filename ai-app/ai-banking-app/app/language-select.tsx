
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { setStoredLanguage, Language, translations } from '../constants/translations';

const { width } = Dimensions.get('window');

export default function LanguageSelectScreen() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  useEffect(() => {
    Speech.speak("Please select your preferred language. English, Telugu, or Hindi.", { language: 'en', rate: 0.9 });
    
    return () => {
      Speech.stop();
    };
  }, []);

  const handleLanguageSelect = async (lang: Language) => {
    await setStoredLanguage(lang);
    const welcomeMsg = translations[lang].welcome;
    Speech.speak(welcomeMsg, { language: lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US', rate: 0.9 });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Language</Text>
      <Text style={styles.subtitle}>మీ భాషను ఎంచుకోండి / अपनी भाषा चुनें</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.langButton, { backgroundColor: '#3B82F6' }]} onPress={() => handleLanguageSelect('en')}>
          <Text style={styles.langText}>English</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.langButton, { backgroundColor: '#10B981' }]} onPress={() => handleLanguageSelect('te')}>
          <Text style={styles.langText}>తెలుగు (Telugu)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.langButton, { backgroundColor: '#F59E0B' }]} onPress={() => handleLanguageSelect('hi')}>
          <Text style={styles.langText}>हिन्दी (Hindi)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  langButton: {
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  langText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
