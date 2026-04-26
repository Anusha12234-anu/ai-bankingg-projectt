import * as Speech from 'expo-speech';
import { useCallback } from 'react';

export const useVoiceAssistant = () => {
  const speak = useCallback(async (text: string, options: Speech.SpeechOptions = {}) => {
    try {
      await Speech.stop();
      Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        ...options,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { speak, stop };
};
