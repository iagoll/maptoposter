<template>
  <v-app :theme="'light'" style="background: #F7F7F7;">
    <!-- Top navigation bar -->
    <v-app-bar
      color="white"
      elevation="0"
      border="b"
      height="64"
    >
      <!-- Logo -->
      <v-app-bar-title class="cursor-pointer" @click="$router.push('/')">
        <div class="d-flex align-center gap-2">
          <v-icon color="primary" size="24">mdi-map-marker</v-icon>
          <span class="nav-brand">MapToPoster</span>
        </div>
      </v-app-bar-title>

      <v-spacer />

      <!-- Desktop navigation -->
      <template v-if="!mobile">
        <v-btn
          variant="text"
          to="/create"
          class="nav-link"
          :class="{ 'nav-link--active': $route.path === '/create' }"
        >
          {{ $t('nav.create') }}
        </v-btn>
        <v-btn
          variant="text"
          to="/gallery"
          class="nav-link"
          :class="{ 'nav-link--active': $route.path === '/gallery' }"
        >
          {{ $t('nav.gallery') }}
        </v-btn>
        <v-btn
          variant="text"
          to="/about"
          class="nav-link"
          :class="{ 'nav-link--active': $route.path === '/about' }"
        >
          {{ $t('nav.about') }}
        </v-btn>

        <v-divider vertical class="mx-2" style="height: 24px; align-self: center;" />

        <LanguageSelector />

        <v-btn
          color="primary"
          variant="flat"
          to="/create"
          rounded="lg"
          class="ml-2 mr-4"
          size="small"
        >
          {{ $t('nav.getStarted') }}
        </v-btn>
      </template>

      <!-- Mobile navigation -->
      <template v-else>
        <LanguageSelector />
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon variant="text" v-bind="props" class="mr-2">
              <v-icon>mdi-menu</v-icon>
            </v-btn>
          </template>
          <v-list rounded="lg" elevation="4">
            <v-list-item to="/" prepend-icon="mdi-home" :title="$t('nav.home')" />
            <v-list-item to="/create" prepend-icon="mdi-creation" :title="$t('nav.create')" />
            <v-list-item to="/gallery" prepend-icon="mdi-view-gallery" :title="$t('nav.gallery')" />
            <v-list-item to="/history" prepend-icon="mdi-history" :title="$t('nav.history')" />
            <v-list-item to="/about" prepend-icon="mdi-information" :title="$t('nav.about')" />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <!-- Global snackbar -->
    <v-snackbar
      v-model="store.snackbar.show"
      :color="store.snackbar.color"
      :timeout="store.snackbar.timeout"
      rounded="lg"
      location="bottom right"
    >
      {{ store.snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="store.closeSnackbar()">{{ $t('nav.dismiss') }}</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { usePosterStore } from './store/posterStore'
import LanguageSelector from './components/LanguageSelector.vue'

const store = usePosterStore()
const { mobile } = useDisplay()

onMounted(() => {
  store.loadThemes()
  store.loadPosters()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.nav-brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222222;
  letter-spacing: -0.3px;
}

.nav-link {
  font-weight: 500;
  color: #222222;
  font-size: 0.9rem;
}

.nav-link--active {
  color: #FF385C !important;
}

.gap-2 {
  gap: 8px;
}
</style>
