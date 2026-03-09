import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'
import pt from './locales/pt.json'
import fr from './locales/fr.json'
import de from './locales/de.json'

// Get saved language from localStorage or default to Spanish
const savedLocale = localStorage.getItem('userLanguage') || 'es'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale, // Default language (Spanish)
  fallbackLocale: 'en', // Fallback to English if translation missing
  messages: {
    en,
    es,
    pt,
    fr,
    de
  },
  // Enable global injection
  globalInjection: true
})

export default i18n
