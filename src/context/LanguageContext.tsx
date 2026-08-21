import React, { createContext, useContext, useState } from 'react';
import { translations } from '../data/translations';
import type { Language } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sahayak_language');
    if (saved === 'hi' || saved === 'or') {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sahayak_language', lang);
    console.log(`[i18n] Language updated to: ${lang}`);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    if (dict && key in dict) {
      return dict[key];
    }
    // Fallback to English dictionary
    const fallbackDict = translations['en'];
    if (fallbackDict && key in fallbackDict) {
      return fallbackDict[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
