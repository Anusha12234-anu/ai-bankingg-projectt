import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, UserPlus, User, Smartphone, Plus, Check } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DEFAULT_FAMILY = [
  { id: '1', name: 'Mother', icon: '👩', details: 'mother@upi', color: '#F472B6' },
  { id: '2', name: 'Father', icon: '👨', details: 'father@upi', color: '#3B82F6' },
  { id: '3', name: 'Brother', icon: '👦', details: '9876543210', color: '#10B981' },
  { id: '4', name: 'Sister', icon: '👧', details: '9876543211', color: '#F59E0B' },
  { id: '5', name: 'Wife', icon: '❤️', details: 'wife@upi', color: '#EF4444' },
];

const RELATIONSHIP_ICONS = ['👩', '👨', '👦', '👧', '❤️', '👴', '👵', '👤'];

export default function FamilyContactsScreen() {
  const [contacts, setContacts] = useState(DEFAULT_FAMILY);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('👤');

  useEffect(() => {
    loadContacts();
    Speech.speak('Select a family member to send money to. You can also add a new contact.', {
      language: 'en',
      rate: 0.9,
    });
  }, []);

  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem('family_contacts');
      if (saved) {
        setContacts([...DEFAULT_FAMILY, ...JSON.parse(saved)]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveNewContact = async () => {
    if (!newName || !newDetails) {
      Speech.speak('Please enter a name and phone number.', { rate: 0.9 });
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: newName,
      details: newDetails,
      icon: selectedIcon,
      color: '#6366F1'
    };

    try {
      const existing = await AsyncStorage.getItem('family_contacts');
      const updated = existing ? [...JSON.parse(existing), newContact] : [newContact];
      await AsyncStorage.setItem('family_contacts', JSON.stringify(updated));
      setContacts([...DEFAULT_FAMILY, ...updated]);
      setIsModalVisible(false);
      setNewName('');
      setNewDetails('');
      Speech.speak(`Contact ${newName} saved successfully.`, { rate: 0.9 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = (contact: any) => {
    if (!contact.details) {
      Speech.speak('Contact information is incomplete. Please update contact.', { rate: 0.9 });
      return;
    }
    Speech.speak(`You selected ${contact.name}. Please enter or speak the amount you want to send.`, { rate: 0.9 });
    router.push({
      pathname: '/send-amount',
      params: { contactName: contact.name, contactEmoji: contact.icon, contactDetails: contact.details }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Contacts</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {contacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[styles.contactCard, { backgroundColor: contact.color }]}
              onPress={() => handleSelect(contact)}
            >
              <Text style={styles.contactEmoji}>{contact.icon}</Text>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDetails}>{contact.details}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.addCard} 
            onPress={() => {
              setIsModalVisible(true);
              Speech.speak('Enter name and phone number to add a new contact.', { rate: 0.9 });
            }}
          >
            <Plus size={48} color="#6B7280" />
            <Text style={styles.addText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Family Contact</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={newName}
              onChangeText={setNewName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone number or UPI ID"
              value={newDetails}
              onChangeText={setNewDetails}
            />

            <Text style={styles.label}>Select Relationship:</Text>
            <View style={styles.iconPicker}>
              {RELATIONSHIP_ICONS.map(icon => (
                <TouchableOpacity 
                  key={icon} 
                  onPress={() => setSelectedIcon(icon)}
                  style={[styles.iconOption, selectedIcon === icon && styles.iconSelected]}
                >
                  <Text style={{ fontSize: 32 }}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveNewContact}>
                <Text style={styles.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: (width - 60) / 2,
    height: 180,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  contactEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contactDetails: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  addCard: {
    width: (width - 60) / 2,
    height: 180,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  addText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  iconPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconOption: {
    padding: 8,
    margin: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  modalActions: {
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
});
