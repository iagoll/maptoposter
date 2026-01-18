<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- Left Panel: Form -->
      <v-col cols="12" md="5" lg="4">
        <PosterForm />
        <RecentPosters class="mt-4" />
      </v-col>

      <!-- Right Panel: Output -->
      <v-col cols="12" md="7" lg="8">
        <TerminalLogs v-if="store.showTerminal" class="mb-4" />
        <PosterDisplay v-if="store.generatedPoster" />
        <WelcomeCard v-if="!store.generatedPoster && !store.generating" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { usePosterStore } from '../store/posterStore'
import PosterForm from '../components/PosterForm.vue'
import RecentPosters from '../components/RecentPosters.vue'
import TerminalLogs from '../components/TerminalLogs.vue'
import PosterDisplay from '../components/PosterDisplay.vue'
import WelcomeCard from '../components/WelcomeCard.vue'

const store = usePosterStore()
</script>
