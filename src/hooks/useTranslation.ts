
import { useState, useEffect } from 'react';
import { translationManager, SupportedLanguage, Translations } from '@/lib/translations';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    translationManager.getCurrentLanguage()
  );

  useEffect(() => {
    const handleLanguageChange = (language: SupportedLanguage) => {
      setCurrentLanguage(language);
    };

    translationManager.subscribe(handleLanguageChange);
    return () => translationManager.unsubscribe(handleLanguageChange);
  }, []);

  const t = (key: keyof Translations): string => {
    return translationManager.translate(key);
  };

  const setLanguage = (language: SupportedLanguage) => {
    translationManager.setLanguage(language);
  };

  return {
    t,
    currentLanguage,
    setLanguage,
    getLanguageName: translationManager.getLanguageName
  };
};
