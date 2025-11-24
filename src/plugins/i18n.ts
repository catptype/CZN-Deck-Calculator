import { createI18n } from 'vue-i18n';
import en from '@/locales/en';
import ja from '@/locales/ja';

// A type for our messages to get full autocomplete and type safety
export type MessageSchema = typeof en;

const i18n = createI18n<[MessageSchema], 'en' | 'ja'>({
  legacy: false, // Use the new Composition API
  locale: 'en', // Set the default language
  fallbackLocale: 'en', // Fallback to English if a translation is missing
  messages: {
    en,
    ja,
  },
});

export default i18n;