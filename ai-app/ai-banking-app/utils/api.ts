
import { Platform } from 'react-native';

// Detect host IP: 10.0.2.2 for Android emulator, localhost for others.
const getHost = () => {
  if (Platform.OS === 'android') {
    // Current machine LAN IP (found via ipconfig)
    // 10.132.152.241 - Current Wi-Fi IP
    // IMPORTANT: Your phone and PC MUST be on the same Wi-Fi network.
    return '10.132.152.241'; 
  }
  return 'localhost';
};

const DEFAULT_BASE_URL = `http://${getHost()}:8000`;

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;

export const api = {
  getUser: async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/1`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error (getUser):', error);
      return null;
    }
  },

  getTransactions: async () => {
    const response = await fetch(`${BASE_URL}/transactions`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  },

  createTransaction: async (txnData: any) => {
    const response = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txnData),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  },

  getFamilyContacts: async () => {
    const response = await fetch(`${BASE_URL}/family-contacts`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  },

  addFamilyContact: async (contactData: any) => {
    const response = await fetch(`${BASE_URL}/family-contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  },
};
