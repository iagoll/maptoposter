<template>
  <v-card elevation="2">
    <v-card-title class="text-h6">
      <v-icon class="mr-2">mdi-history</v-icon>
      Recent Posters
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        @click="store.loadPosters()"
        :loading="store.loadingPosters"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-2">
      <v-list density="compact" v-if="store.posters.length > 0">
        <v-list-item
          v-for="poster in store.posters.slice(0, 5)"
          :key="poster.filename"
          @click="store.viewPoster(poster)"
          class="mb-1"
        >
          <template v-slot:prepend>
            <v-avatar rounded size="40">
              <v-img :src="getImageUrl(poster.url)" cover></v-img>
            </v-avatar>
          </template>
          <v-list-item-title class="text-caption">
            {{ poster.filename }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ formatDate(poster.created) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div v-else class="text-center text-medium-emphasis py-4">
        <v-icon size="48" class="mb-2">mdi-image-off</v-icon>
        <div class="text-caption">No posters yet</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { usePosterStore } from '../store/posterStore'
import apiService from '../services/api'
import { formatDate } from '../services/utils'

const store = usePosterStore()

const getImageUrl = (url) => {
  return apiService.getImageUrl(url)
}
</script>
