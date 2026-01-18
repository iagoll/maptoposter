<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon class="mr-2">mdi-image</v-icon>
      Generated Poster
      <v-spacer></v-spacer>
      <v-btn
        variant="tonal"
        color="success"
        :href="getImageUrl(store.generatedPoster.url)"
        download
        class="mr-2"
      >
        <v-icon left>mdi-download</v-icon>
        Download
      </v-btn>
      <v-btn
        icon
        size="small"
        @click="store.generatedPoster = null"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-4">
      <!-- Mockup Frame -->
      <div class="poster-mockup">
        <div class="mockup-frame">
          <div class="mockup-border">
            <v-img
              :src="getImageUrl(store.generatedPoster.url)"
              :aspect-ratio="store.formData.orientation === 'vertical' ? 3/4 : 4/3"
              cover
              class="mockup-image"
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
          </div>
        </div>
        <div class="text-center mt-4">
          <v-chip class="mr-2">{{ store.generatedPoster.filename }}</v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { usePosterStore } from '../store/posterStore'
import apiService from '../services/api'

const store = usePosterStore()

const getImageUrl = (url) => {
  return apiService.getImageUrl(url)
}
</script>

<style scoped>
.poster-mockup {
  max-width: 100%;
  margin: 0 auto;
}

.mockup-frame {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.mockup-border {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.mockup-image {
  border-radius: 4px;
  display: block;
  width: 100%;
}

@media (max-width: 960px) {
  .mockup-frame {
    padding: 16px;
  }

  .mockup-border {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .mockup-frame {
    padding: 12px;
  }

  .mockup-border {
    padding: 8px;
  }
}
</style>
