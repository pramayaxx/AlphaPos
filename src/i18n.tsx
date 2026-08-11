import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'si' | 'ta';

const translations = {
  en: {
    dashboard: 'Dashboard',
    checkout: 'Checkout',
    products: 'Products',
    customers: 'Customers',
    reports: 'Reports',
    settings: 'Settings',
    staff: 'Staff',
    tables: 'Tables',
    reservations: 'Reservations',
    total_sales: 'Total Sales',
    add_product: 'Add Product',
    search: 'Search...',
    pay: 'Pay',
    cancel: 'Cancel',
    online_orders: 'Online Orders',
    loyalty_tier: 'Loyalty Tier',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold'
  },
  si: {
    dashboard: 'උපකරණ පුවරුව',
    checkout: 'ගෙවීම්',
    products: 'නිෂ්පාදන',
    customers: 'පාරිභෝගිකයින්',
    reports: 'වාර්තා',
    settings: 'සැකසුම්',
    staff: 'කාර්ය මණ්ඩලය',
    tables: 'මේස',
    reservations: 'වෙන් කිරීම්',
    total_sales: 'මුළු විකුණුම්',
    add_product: 'නිෂ්පාදනය එකතු කරන්න',
    search: 'සොයන්න...',
    pay: 'ගෙවන්න',
    cancel: 'අවලංගු කරන්න',
    online_orders: 'මාර්ගගත ඇණවුම්',
    loyalty_tier: 'ලෝයල්ටි මට්ටම',
    bronze: 'ලෝකඩ',
    silver: 'රිදී',
    gold: 'රන්'
  },
  ta: {
    dashboard: 'முகப்பு',
    checkout: 'வெளியேறு',
    products: 'பொருட்கள்',
    customers: 'வாடிக்கையாளர்கள்',
    reports: 'அறிக்கைகள்',
    settings: 'அமைப்புகள்',
    staff: 'பணியாளர்கள்',
    tables: 'மேசைகள்',
    reservations: 'முன்பதிவுகள்',
    total_sales: 'மொத்த விற்பனை',
    add_product: 'பொருளைச் சேர்',
    search: 'தேடு...',
    pay: 'செலுத்து',
    cancel: 'ரத்துசெய்',
    online_orders: 'ஆன்லைன் ஆர்டர்கள்',
    loyalty_tier: 'விசுவாச அடுக்கு',
    bronze: 'வெண்கலம்',
    silver: 'வெள்ளி',
    gold: 'தங்கம்'
  }
};

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
};
