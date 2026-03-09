import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useSettingsStore = defineStore('settings', () => {
  // Language preference
  const language = ref(localStorage.getItem('userLanguage') || 'es')
  
  // Theme preference (for future use - light/dark mode)
  const theme = ref(localStorage.getItem('userTheme') || 'light')
  
  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ]
  
  /**
   * Change application language
   * @param {string} newLanguage - Language code (en, es, pt, fr, de)
   */
  const setLanguage = (newLanguage) => {
    if (availableLanguages.some(lang => lang.code === newLanguage)) {
      language.value = newLanguage
      localStorage.setItem('userLanguage', newLanguage)
      
      // Update document language attribute
      document.documentElement.setAttribute('lang', newLanguage)
    }
  }
  
  /**
   * Get language name by code
   * @param {string} code - Language code
   * @returns {string} Language name
   */
  const getLanguageName = (code) => {
    const lang = availableLanguages.find(l => l.code === code)
    return lang ? lang.name : code
  }
  
  /**
   * Get language flag by code
   * @param {string} code - Language code
   * @returns {string} Language flag emoji
   */
  const getLanguageFlag = (code) => {
    const lang = availableLanguages.find(l => l.code === code)
    return lang ? lang.flag : '🌐'
  }
  
  /**
   * Change theme (light/dark mode)
   * @param {string} newTheme - Theme name (light, dark)
   */
  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('userTheme', newTheme)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  // Initialize document attributes
  document.documentElement.setAttribute('lang', language.value)
  document.documentElement.setAttribute('data-theme', theme.value)
  
  return {
    // State
    language,
    theme,
    availableLanguages,
    
    // Actions
    setLanguage,
    getLanguageName,
    getLanguageFlag,
    setTheme,
    toggleTheme
  }
})
