<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        :prepend-icon="mobile ? undefined : 'mdi-translate'"
        :icon="mobile ? 'mdi-translate' : undefined"
      >
        <template v-if="!mobile">
          <span class="language-flag">{{ currentLanguageFlag }}</span>
          <span class="ml-1">{{ currentLanguageName }}</span>
        </template>
      </v-btn>
    </template>
    
    <v-list>
      <v-list-item
        v-for="lang in availableLanguages"
        :key="lang.code"
        :active="language === lang.code"
        @click="changeLanguage(lang.code)"
      >
        <template v-slot:prepend>
          <span class="language-flag mr-2">{{ lang.flag }}</span>
        </template>
        <v-list-item-title>{{ lang.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/store/settingsStore'
import { useDisplay } from 'vuetify'

const { locale } = useI18n()
const settingsStore = useSettingsStore()
const { mobile } = useDisplay()

// Get current language from store
const language = computed(() => settingsStore.language)
const availableLanguages = computed(() => settingsStore.availableLanguages)

// Get current language name
const currentLanguageName = computed(() => {
  return settingsStore.getLanguageName(language.value)
})

// Get current language flag
const currentLanguageFlag = computed(() => {
  return settingsStore.getLanguageFlag(language.value)
})

// Change language
const changeLanguage = (newLanguage) => {
  settingsStore.setLanguage(newLanguage)
  locale.value = newLanguage
}
</script>

<style scoped>
.language-flag {
  font-size: 1.2em;
  line-height: 1;
}
</style>
