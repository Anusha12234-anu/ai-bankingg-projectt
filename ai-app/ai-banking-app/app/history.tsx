
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { getStoredLanguage, translations, Language } from '../constants/translations';
import { api } from '../utils/api';

// Define a type for the transaction for safety
interface Transaction {
  id: number;
  recipient_name: string;
  recipient_emoji?: string;
  amount: number;
  date: string;
  status: 'Success' | 'Failed';
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedLang = await getStoredLanguage();
      setLang(storedLang);

      const savedHistory = await api.getTransactions();
      console.log('Fetched history:', savedHistory);
      if (savedHistory && Array.isArray(savedHistory)) {
        setHistory(savedHistory);
        
        const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
        Speech.speak(`${translations[storedLang].transaction_history}.`, { language: ttsLang, rate: 0.9 });
      }
    } catch (e: any) {
      console.error("Failed to load transaction history.", e);
      setError(e.message || "Failed to connect to server");
      Alert.alert("Connection Error", "Could not fetch transaction history. Please check if the server is running.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useFocusEffect re-fetches data when the screen comes into view
  useFocusEffect(
    useCallback(() => {
      loadHistory();
      
      return () => {
        Speech.stop();
      };
    }, [loadHistory])
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Text style={{ fontSize: 24 }}>{item.recipient_emoji || '👤'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.itemText}>{item.recipient_name}</Text>
        <Text style={styles.itemSubText}>{new Date(item.date).toLocaleString()}</Text>
        <Text style={[styles.statusText, { color: item.status === 'Success' ? '#10B981' : '#EF4444' }]}>
          {item.status}
        </Text>
      </View>
      <Text style={[styles.amount, { color: item.status === 'Success' ? '#10B981' : '#EF4444' }]}>
        ₹{item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations[lang].transaction_history}</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <Text style={styles.emptyText}>Loading transactions...</Text>
            ) : error ? (
              <>
                <Text style={[styles.emptyText, { color: '#EF4444', marginBottom: 12 }]}>Error: {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.emptyText}>No transactions found</Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listContainer: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
