
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'te' | 'hi';

export const translations: Record<Language, any> = {
  en: {
    welcome: "Welcome back",
    select_language: "Select Your Language",
    balance: "Balance",
    send: "Send",
    pay: "Pay",
    history: "History",
    your_balance: "Your Balance",
    transaction_history: "Transaction History",
    send_to: "Send To",
    enter_amount: "Enter Amount",
    confirm_payment: "Confirm Payment",
    success: "Payment Successful!",
    failed: "Payment Failed",
    back_home: "Back to Home",
    view_history: "View History",
    voice_unlock: "Voice Unlock",
    voice_not_set: "Voice Not Set",
    biometric_login: "Fingerprint / Face",
    pin_login: "Enter PIN",
    how_can_i_help: "How can I help you? For example, say: 'Send 500 to Mom'.",
    recognizing: "Listening...",
    confirm: "Confirm",
    cancel: "Cancel",
    onboarding_welcome: "Welcome! Let's get you started. First, tap on 'Balance' to check your money.",
    onboarding_send: "Tap 'Send' to transfer money to your family.",
    pay_bills: "Pay Bills",
    transfer_money: "Transfer Money",
    enter_account: "Enter Account Number",
    enter_amount_hint: "Enter Amount",
    electricity: "Electricity",
    water: "Water",
    mobile_recharge: "Mobile Recharge",
    gas: "Gas",
  },
  te: {
    welcome: "మళ్ళీ స్వాగతం",
    select_language: "మీ భాషను ఎంచుకోండి",
    balance: "నిల్వ",
    send: "పంపండి",
    pay: "చెల్లించండి",
    history: "చరిత్ర",
    your_balance: "మీ నిల్వ",
    transaction_history: "లావాదేవీల చరిత్ర",
    send_to: "ఎవరికి పంపాలి",
    enter_amount: "మొత్తం నమోదు చేయండి",
    confirm_payment: "చెల్లింపును నిర్ధారించండి",
    success: "చెల్లింపు విజయవంతమైంది!",
    failed: "చెల్లింపు విఫలమైంది",
    back_home: "హోమ్ పేజీకి",
    view_history: "చరిత్రను చూడండి",
    voice_unlock: "వాయిస్ అన్లాక్",
    voice_not_set: "వాయిస్ సెట్ చేయలేదు",
    biometric_login: "వేలిముద్ర / ఫేస్",
    pin_login: "పిన్ నమోదు చేయండి",
    how_can_i_help: "నేను మీకు ఎలా సహాయపడగలను? ఉదాహరణకు: 'అమ్మకు 500 పంపండి' అని చెప్పండి.",
    recognizing: "వింటున్నాను...",
    confirm: "నిర్ధారించు",
    cancel: "రద్దు చేయి",
    onboarding_welcome: "స్వాగతం! మనం ప్రారంభిద్దాం. మొదట, మీ డబ్బును తనిఖీ చేయడానికి 'నిల్వ' పై నొక్కండి.",
    onboarding_send: "మీ కుటుంబ సభ్యులకు డబ్బు పంపడానికి 'పంపండి' పై నొక్కండి.",
    pay_bills: "బిల్లులు చెల్లించండి",
    transfer_money: "డబ్బు బదిలీ",
    enter_account: "ఖాతా సంఖ్య నమోదు చేయండి",
    enter_amount_hint: "మొత్తం నమోదు చేయండి",
    electricity: "విద్యుత్",
    water: "నీరు",
    mobile_recharge: "మొబైల్ రీఛార్జ్",
    gas: "గ్యాస్",
  },
  hi: {
    welcome: "स्वागत है",
    select_language: "अपनी भाषा चुनें",
    balance: "बैलेंस",
    send: "भेजें",
    pay: "भुगतान",
    history: "इतिहास",
    your_balance: "आपका बैलेंस",
    transaction_history: "लेनदेन का इतिहास",
    send_to: "किसे भेजें",
    enter_amount: "राशि दर्ज करें",
    confirm_payment: "भुगतान की पुष्टि करें",
    success: "भुगतान सफल रहा!",
    failed: "भुगतान विफल रहा",
    back_home: "होम पर जाएं",
    view_history: "इतिहास देखें",
    voice_unlock: "वॉइस अनलॉक",
    voice_not_set: "वॉइस सेट नहीं है",
    biometric_login: "फिंगरप्रिंट / फेस",
    pin_login: "पिन दर्ज करें",
    how_can_i_help: "मैं आपकी कैसे मदद कर सकता हूँ? उदाहरण के लिए कहें: 'माँ को 500 भेजें'।",
    recognizing: "सुन रहा हूँ...",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    onboarding_welcome: "स्वागत है! चलिए शुरू करते हैं। पहले, अपने पैसे की जांच के लिए 'बैलेंस' पर टैप करें।",
    onboarding_send: "अपने परिवार को पैसे भेजने के लिए 'भेजें' पर टैप करें।",
    pay_bills: "बिलों का भुगतान",
    transfer_money: "पैसे का हस्तांतरण",
    enter_account: "खाता संख्या दर्ज करें",
    enter_amount_hint: "राशि दर्ज करें",
    electricity: "बिजली",
    water: "पानी",
    mobile_recharge: "मोबाइल रिचार्ज",
    gas: "गैस",
  }
};

export const setStoredLanguage = async (lang: Language) => {
  try {
    await AsyncStorage.setItem('user_language', lang);
  } catch (error) {
    console.error('Error saving language', error);
  }
};

export const getStoredLanguage = async (): Promise<Language> => {
  try {
    const lang = await AsyncStorage.getItem('user_language');
    return (lang as Language) || 'en';
  } catch (error) {
    return 'en';
  }
};
