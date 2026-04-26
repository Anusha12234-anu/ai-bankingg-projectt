
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Wallet, Send, CreditCard, History, Receipt, Bell, Mic } from 'lucide-react-native';
import { api } from '../../utils/api';
import { getStoredLanguage, translations, Language } from '../../constants/translations';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
   const [userName, setUserName] = useState('gudipati meghana');

  useEffect(() => {
    const fetchUser = async () => {
      const user = await api.getUser();
      if (user) {
        setUserName(user.name);
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => router.replace('/')}
          >
            <Bell size={24} color="#FFFFFF" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.quickActionsHeader}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: '#3B82F6' }]}
            onPress={() => router.push('/(tabs)/balance')}
          >
            <View style={styles.iconWrapper}>
              <Wallet size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.gridItemText}>BALANCE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: '#10B981' }]}
            onPress={() => router.push('/contacts')}
          >
            <View style={styles.iconWrapper}>
              <Send size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.gridItemText}>SEND</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push('/(tabs)/transfer')}
          >
            <View style={styles.iconWrapper}>
              <CreditCard size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.gridItemText}>PAY</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, { backgroundColor: '#F59E0B' }]}
            onPress={() => router.push('/history')}
          >
            <View style={styles.iconWrapper}>
              <History size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.gridItemText}>HISTORY</Text>
          </TouchableOpacity>
        </View>

        {/* Optional Section to Fill Space like Premium Apps */}
        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>Your spending is 10% lower than last month! Great job!</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Voice Assistant Button */}
      <View style={styles.voiceHint}>
        <TouchableOpacity 
          style={styles.voiceButton} 
          onPress={() => router.push('/voice')}
        >
          <Mic size={24} color="#1E3A8A" style={{ marginRight: 10 }} />
          <Text style={styles.voiceButtonText}>Tap to speak</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#BFDBFE',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    backgroundColor: '#EF4444',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1E3A8A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  quickActionsHeader: {
    paddingHorizontal: 24,
    marginTop: 30,
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 60) / 2,
    height: 140,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bottomSection: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 15,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  insightText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  voiceHint: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  voiceButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});
