import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import ruTranslation from './locales/ru/translation.json';
import uzTranslation from './locales/uz/translation.json';

import enTeam from './locales/en/team-translations.json';
import ruTeam from './locales/ru/team-translations.json';
import uzTeam from './locales/uz/team-translations.json';

import enActions from './locales/en/actions-translations.json';
import ruActions from './locales/ru/actions-translations.json';
import uzActions from './locales/uz/actions-translations.json';

import enProfile from './locales/en/profile.json';
import ruProfile from './locales/ru/profile.json';
import uzProfile from './locales/uz/profile.json';

import enCommon from './locales/en/common.json';
import ruCommon from './locales/ru/common.json';
import uzCommon from './locales/uz/common.json';

import enShop from './locales/en/shop-translations.json';
import ruShop from './locales/ru/shop-translations.json';
import uzShop from './locales/uz/shop-translations.json';

import enStories from './locales/en/stories-translations.json';
import ruStories from './locales/ru/stories-translations.json';
import uzStories from './locales/uz/stories-translations.json';

const resources = {
  en: {
    translation: enTranslation,
    team: enTeam,
    actions: enActions,
    profile: enProfile,
    common: enCommon,
    shop: enShop,
    stories: enStories
  },
  ru: {
    translation: ruTranslation,
    team: ruTeam,
    actions: ruActions,
    profile: ruProfile,
    common: ruCommon,
    shop: ruShop,
    stories: ruStories
  },
  uz: {
    translation: uzTranslation,
    team: uzTeam,
    actions: uzActions,
    profile: uzProfile,
    common: uzCommon,
    shop: uzShop,
    stories: uzStories
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation', 'common', 'actions', 'profile', 'team', 'shop', 'stories'],
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Allow empty values to fallback to key
    returnEmptyString: false,
    // Return key if translation not found (for debugging)
    returnNull: false,
    // Ensure proper fallback chain
    fallbackNS: ['common', 'translation'],
  });

export default i18n;