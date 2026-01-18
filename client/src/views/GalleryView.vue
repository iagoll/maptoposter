<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h4 d-flex align-center">
            <v-icon class="mr-3" size="large">mdi-view-gallery</v-icon>
            Poster Gallery
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              @click="store.loadPosters()"
              :loading="store.loadingPosters"
            >
              Refresh
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row v-if="store.posters.length > 0">
              <v-col
                v-for="poster in store.posters"
                :key="poster.filename"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card elevation="4" @click="viewPoster(poster)" class="poster-card">
                  <v-img
                    :src="apiService.getImageUrl(poster.url)"
                    :aspect-ratio="1"
                    cover
                    class="poster-thumbnail"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                  <v-card-text class="pa-2">
                    <div class="text-caption font-weight-bold text-truncate">
                      {{ poster.filename }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(poster.created) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatFileSize(poster.size) }}
                    </div>
                  </v-card-text>
                  <v-card-actions class="pa-2 pt-0">
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="primary"
                      block
                      :href="apiService.getImageUrl(poster.url)"
                      download
                      @click.stop
                    >
                      <v-icon size="small">mdi-download</v-icon>
                      <span class="ml-1">Download</span>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12">
                <div class="text-center py-12">
                  <v-icon size="120" color="grey">mdi-image-off</v-icon>
                  <h3 class="text-h5 mt-4 mb-2">No Posters Yet</h3>
                  <p class="text-medium-emphasis mb-4">
                    Generate your first poster to see it here!
                  </p>
                  <v-btn color="primary" to="/" prepend-icon="mdi-plus">
                    Create Poster
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Poster Detail Dialog -->
    <v-dialog v-model="dialog" max-width="1200">
      <v-card v-if="selectedPoster">
        <v-card-title class="d-flex align-center">
          <span class="text-h6">{{ selectedPoster.filename }}</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-img
            :src="apiService.getImageUrl(selectedPoster.url)"
            max-height="600"
            contain
          ></v-img>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :href="apiService.getImageUrl(selectedPoster.url)"
            download
            prepend-icon="mdi-download"
          >
            Download
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePosterStore } from '../store/posterStore'
import apiService from '../services/api'
import { formatDate } from '../services/utils'

const store = usePosterStore()
const dialog = ref(false)
const selectedPoster = ref(null)

const viewPoster = (poster) => {
  selectedPoster.value = poster
  dialog.value = true
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

onMounted(() => {
  store.loadPosters()
})
</script>

<style scoped>
.poster-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.poster-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

.poster-thumbnail {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
