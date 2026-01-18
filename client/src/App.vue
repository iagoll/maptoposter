<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title class="cursor-pointer" @click="$router.push('/')">
        <v-icon class="mr-2">mdi-map</v-icon>
        Map Poster Generator
      </v-app-bar-title>
      
      <v-spacer></v-spacer>

      <!-- Desktop Navigation -->
      <template v-if="!mobile">
        <v-btn
          variant="text"
          prepend-icon="mdi-home"
          to="/"
        >
          Home
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-view-gallery"
          to="/gallery"
        >
          Gallery
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-history"
          to="/history"
        >
          History
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-information"
          to="/about"
        >
          About
        </v-btn>
      </template>

      <!-- Mobile Navigation Menu -->
      <v-menu v-else>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-home" to="/" title="Home"></v-list-item>
          <v-list-item prepend-icon="mdi-view-gallery" to="/gallery" title="Gallery"></v-list-item>
          <v-list-item prepend-icon="mdi-history" to="/history" title="History"></v-list-item>
          <v-list-item prepend-icon="mdi-information" to="/about" title="About"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="store.snackbar.show"
      :color="store.snackbar.color"
      :timeout="store.snackbar.timeout"
    >
      {{ store.snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="store.closeSnackbar()">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { usePosterStore } from './store/posterStore'

const store = usePosterStore()
const { mobile } = useDisplay()

// Load initial data
onMounted(() => {
  store.loadThemes()
  store.loadPosters()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
