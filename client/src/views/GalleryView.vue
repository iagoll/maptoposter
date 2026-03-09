<template>
  <div class="gallery-page">
    <div class="gallery-container">

      <!-- Header -->
      <div class="gallery-header">
        <div>
          <p class="section-eyebrow">Your creations</p>
          <h1 class="gallery-title">Gallery</h1>
        </div>
        <v-btn
          variant="outlined"
          rounded="lg"
          prepend-icon="mdi-refresh"
          color="secondary"
          @click="store.loadPosters()"
          :loading="store.loadingPosters"
          size="small"
        >
          Refresh
        </v-btn>
      </div>

      <!-- Poster grid -->
      <div v-if="store.posters.length > 0" class="poster-grid">
        <div
          v-for="poster in store.posters"
          :key="poster.filename"
          class="poster-card"
          @click="viewPoster(poster)"
        >
          <div class="poster-card__img-wrap">
            <v-img
              :src="apiService.getImageUrl(poster.url)"
              :aspect-ratio="3/4"
              cover
              class="poster-card__img"
            >
              <template #placeholder>
                <div class="poster-card__skeleton">
                  <v-progress-circular indeterminate color="primary" size="24" />
                </div>
              </template>
            </v-img>
            <div class="poster-card__hover">
              <v-btn color="white" variant="flat" size="small" rounded="lg">
                View
              </v-btn>
            </div>
          </div>
          <div class="poster-card__meta">
            <span class="poster-card__name">{{ cleanName(poster.filename) }}</span>
            <span class="poster-card__date">{{ formatDate(poster.created) }}</span>
          </div>
          <a
            :href="apiService.getImageUrl(poster.url)"
            :download="poster.filename"
            class="poster-card__download"
            @click.stop
          >
            <v-icon size="16">mdi-download</v-icon> Download
          </a>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <v-icon size="72" color="#CCCCCC">mdi-image-off-outline</v-icon>
        <h3 class="empty-state__title">No posters yet</h3>
        <p class="empty-state__desc">Generate your first poster and it will appear here.</p>
        <v-btn color="primary" rounded="xl" elevation="0" to="/create" prepend-icon="mdi-creation">
          Create a poster
        </v-btn>
      </div>

    </div>

    <!-- Poster detail dialog -->
    <v-dialog v-model="dialog" max-width="860">
      <v-card v-if="selectedPoster" rounded="xl" elevation="0">
        <div class="dialog-header">
          <span class="dialog-title">{{ cleanName(selectedPoster.filename) }}</span>
          <v-btn icon variant="text" @click="dialog = false" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-img
          :src="apiService.getImageUrl(selectedPoster.url)"
          max-height="560"
          contain
          class="dialog-img"
        />
        <div class="dialog-footer">
          <span class="dialog-meta">{{ formatFileSize(selectedPoster.size) }} · {{ formatDate(selectedPoster.created) }}</span>
          <v-btn
            color="primary"
            rounded="xl"
            elevation="0"
            :href="apiService.getImageUrl(selectedPoster.url)"
            :download="selectedPoster.filename"
            prepend-icon="mdi-download"
          >
            Download
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
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

const cleanName = (filename) => {
  return filename.replace(/_\d{8}_\d{6}\.png$/, '').replace(/_/g, ' ')
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB'
}

onMounted(() => store.loadPosters())
</script>

<style scoped>
.gallery-page {
  background: #F7F7F7;
  min-height: 100vh;
  padding: 40px 24px 80px;
}

.gallery-container {
  max-width: 1100px;
  margin: 0 auto;
}

.gallery-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
  gap: 12px;
  flex-wrap: wrap;
}

.section-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #FF385C;
  margin: 0 0 4px;
}

.gallery-title {
  font-size: 2rem;
  font-weight: 800;
  color: #222;
  margin: 0;
  letter-spacing: -0.5px;
}

/* Grid */
.poster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.poster-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #EBEBEB;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.poster-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.1);
}

.poster-card__img-wrap {
  position: relative;
  overflow: hidden;
}

.poster-card__img {
  display: block;
}

.poster-card__skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #F7F7F7;
}

.poster-card__hover {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.poster-card:hover .poster-card__hover {
  opacity: 1;
}

.poster-card__meta {
  padding: 10px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.poster-card__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #222;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-card__date {
  font-size: 0.72rem;
  color: #aaa;
}

.poster-card__download {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #FF385C;
  text-decoration: none;
  border-top: 1px solid #F5F5F5;
}

.poster-card__download:hover {
  color: #d90b35;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state__title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.empty-state__desc {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

/* Dialog */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #EBEBEB;
}

.dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #222;
  text-transform: capitalize;
}

.dialog-img {
  background: #F7F7F7;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #EBEBEB;
}

.dialog-meta {
  font-size: 0.8rem;
  color: #888;
}
</style>
