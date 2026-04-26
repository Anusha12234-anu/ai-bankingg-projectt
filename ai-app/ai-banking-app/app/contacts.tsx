
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, FlatList, TextInput, Modal } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, User, Plus, Check } from 'lucide-react-native';
import * as ExpoContacts from 'expo-contacts';
import * as Speech from 'expo-speech';
import { api } from '../utils/api';
import { getStoredLanguage, translations, Language } from '../constants/translations';

const { width } = Dimensions.get('window');

const DEFAULT_FAMILY = [
  { id: '1', name: 'Mother', icon: '👩', details: 'mother@upi', color: '#F472B6' },
  { id: '2', name: 'Father', icon: '👨', details: 'father@upi', color: '#3B82F6' },
  { id: '3', name: 'Brother', icon: '👦', details: '9876543210', color: '#10B981' },
  { id: '4', name: 'Sister', icon: '👧', details: '9876543211', color: '#F59E0B' },
  { id: '5', name: 'Wife', icon: '❤️', details: 'wife@upi', color: '#EF4444' },
];

const RELATIONSHIP_ICONS = ['👩', '👨', '👦', '👧', '❤️', '👴', '👵', '👤'];

export default function ContactsScreen() {
  const [familyContacts, setFamilyContacts] = useState(DEFAULT_FAMILY);
  const [phoneContacts, setPhoneContacts] = useState<ExpoContacts.Contact[]>([]);
  const [lang, setLang] = useState<Language>('en');

  // Add Contact Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('👤');

  useEffect(() => {
    init();
    return () => {
      Speech.stop();
    };
  }, []);

  const init = async () => {
    const storedLang = await getStoredLanguage();
    setLang(storedLang);
    
    const ttsLang = storedLang === 'te' ? 'te-IN' : storedLang === 'hi' ? 'hi-IN' : 'en-US';
    Speech.speak(`${translations[storedLang].send_to}.`, { language: ttsLang, rate: 0.9 });

    loadFamilyContacts();
    loadPhoneContacts();
  };

  const loadFamilyContacts = async () => {
    try {
      const saved = await api.getFamilyContacts();
      if (saved) {
        setFamilyContacts(saved);
      }
    } catch (e: any) {
      console.error("Failed to load family contacts:", e);
      Alert.alert("Server Error", "Could not fetch family contacts. Using offline defaults.");
    }
  };

  const loadPhoneContacts = async () => {
    const { status } = await ExpoContacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await ExpoContacts.getContactsAsync({
        fields: [ExpoContacts.Fields.Name, ExpoContacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        setPhoneContacts(data.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      }
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
      await api.addFamilyContact(newContact);
      loadFamilyContacts();
      setIsModalVisible(false);
      setNewName('');
      setNewDetails('');
      Speech.speak(`Contact ${newName} saved successfully.`, { rate: 0.9 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = (contact: { name: string; icon: string; phone?: string; details?: string }) => {
    let phoneNumber = contact.phone || '';
    
    // If no phone is explicitly provided, check if details contains a phone number
    if (!phoneNumber && contact.details) {
      // Simplified check for phone number (digits and common separators)
      const cleaned = contact.details.replace(/[^\d+]/g, '');
      if (cleaned.length >= 10) {
        phoneNumber = cleaned;
      }
    }

    router.push({
      pathname: '/send-amount',
      params: { contactName: contact.name, contactEmoji: contact.icon, contactPhone: phoneNumber }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={32} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations[lang].send_to}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>{lang === 'en' ? 'Family' : lang === 'te' ? 'కుటుంబం' : 'परिवार'}</Text>
        <View style={styles.grid}>
          {familyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[styles.contactCard, { backgroundColor: contact.color }]}
              onPress={() => handleSelect(contact)}
            >
              <Text style={styles.contactEmoji}>{contact.icon}</Text>
              <Text style={styles.contactName}>{contact.name}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.addCard} 
            onPress={() => {
              setIsModalVisible(true);
              const ttsLang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-US';
              Speech.speak(lang === 'en' ? 'Enter name and phone number to add a new contact.' : lang === 'te' ? 'కొత్త కాంటాక్ట్ జోడించడానికి పేరు మరియు ఫోన్ నంబర్ నమోదు చేయండి.' : 'नया संपर्क जोड़ने के लिए नाम और फोन नंबर दर्ज करें।', { language: ttsLang, rate: 0.9 });
            }}
          >
            <Plus size={48} color="#6B7280" />
            <Text style={styles.addText}>{lang === 'en' ? 'Add Contact' : lang === 'te' ? 'జోడించండి' : 'संपर्क जोड़ें'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{lang === 'en' ? 'All Contacts' : lang === 'te' ? 'అన్ని కాంటాక్ట్‌లు' : 'सभी संपर्क'}</Text>
        <FlatList
          data={phoneContacts}
          keyExtractor={(item: any) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.phoneContactItem}
              onPress={() => {
                const raw = Array.isArray(item.phoneNumbers) && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : '';
                const normalized = typeof raw === 'string' ? raw.replace(/[^\d+]/g, '') : '';
                handleSelect({ name: item.name || 'No Name', icon: '👤', phone: normalized });
              }}
            >
              <View style={styles.phoneContactAvatar}><User size={24} color="#1F2937" /></View>
              <Text style={styles.phoneContactName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{lang === 'en' ? 'New Family Contact' : lang === 'te' ? 'కొత్త కుటుంబ కాంటాక్ట్' : 'नया पारिवारिक संपर्क'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={lang === 'en' ? 'Enter Name' : lang === 'te' ? 'పేరు నమోదు చేయండి' : 'नाम दर्ज करें'}
              value={newName}
              onChangeText={setNewName}
            />
            
            <TextInput
              style={styles.input}
              placeholder={lang === 'en' ? 'Phone number or UPI ID' : lang === 'te' ? 'ఫోన్ నంబర్ లేదా UPI ID' : 'फ़ोन नंबर या UPI आईडी'}
              value={newDetails}
              onChangeText={setNewDetails}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{lang === 'en' ? 'Select Relationship Icon:' : lang === 'te' ? 'సంబంధం చిహ్నాన్ని ఎంచుకోండి:' : 'रिश्ता आइकन चुनें:'}</Text>
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
                <Text style={styles.saveBtnText}>{translations[lang].confirm.toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelBtnText}>{translations[lang].cancel.toUpperCase()}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  contactCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactEmoji: {
    fontSize: 40,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  addCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  phoneContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  phoneContactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  phoneContactName: {
    fontSize: 16,
    color: '#1F2937',
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
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  iconPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconOption: {
    width: (width - 80) / 4,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
  },
  iconSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelBtnText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '800',
  },
});
