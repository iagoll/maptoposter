<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- User Stats Card -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h4">
            <v-icon class="mr-3" size="large">mdi-history</v-icon>
            Your Purchase History
          </v-card-title>
          <v-divider></v-divider>
          
          <!-- Stats Summary -->
          <v-card-text v-if="stats">
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal" color="primary">
                  <v-card-text class="text-center">
                    <div class="text-h3 font-weight-bold">{{ stats.totalPreviews }}</div>
                    <div class="text-subtitle-1">Total Previews</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal" color="success">
                  <v-card-text class="text-center">
                    <div class="text-h3 font-weight-bold">{{ stats.totalPurchases }}</div>
                    <div class="text-subtitle-1">Purchases</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal" color="info">
                  <v-card-text class="text-center">
                    <div class="text-h3 font-weight-bold">{{ stats.totalSpentFormatted }}</div>
                    <div class="text-subtitle-1">Total Spent</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal" color="warning">
                  <v-card-text class="text-center">
                    <div class="text-body-1 font-weight-bold">{{ formatDate(stats.memberSince) }}</div>
                    <div class="text-subtitle-1">Member Since</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Loading State -->
          <v-card-text v-else class="text-center py-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <div class="mt-4">Loading statistics...</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Filter Tabs -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-tabs v-model="activeTab" bg-color="primary">
            <v-tab value="purchases">
              <v-icon left>mdi-cart-check</v-icon>
              Purchased Posters
            </v-tab>
            <v-tab value="previews">
              <v-icon left>mdi-image-search</v-icon>
              All Previews
            </v-tab>
            <v-tab value="themes">
              <v-icon left>mdi-palette</v-icon>
              Favorite Themes
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Purchases Tab -->
              <v-window-item value="purchases">
                <div v-if="loadingPurchases" class="text-center py-8">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  <div class="mt-4">Loading purchases...</div>
                </div>

                <v-row v-else-if="purchases.length > 0">
                  <v-col
                    v-for="purchase in purchases"
                    :key="purchase.request_id"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-card
                      elevation="4"
                      hover
                      @click="viewDetails(purchase)"
                      class="history-card"
                    >
                      <v-img
                        v-if="purchase.highres_filename"
                        :src="getImageUrl(`/posters/${purchase.highres_filename}`)"
                        :aspect-ratio="1"
                        cover
                        class="history-thumbnail"
                      >
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                          </v-row>
                        </template>
                        <div class="purchased-badge">
                          <v-chip color="success" size="small">
                            <v-icon left size="small">mdi-check-circle</v-icon>
                            Purchased
                          </v-chip>
                        </div>
                      </v-img>

                      <v-card-text class="pa-3">
                        <div class="text-subtitle-2 font-weight-bold text-truncate">
                          {{ purchase.city || 'Custom Location' }}, {{ purchase.country }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Theme: {{ purchase.theme }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Purchased: {{ formatDate(purchase.paid_at) }}
                        </div>
                        <div class="text-caption text-success font-weight-bold">
                          {{ formatCurrency(purchase.amount) }}
                        </div>
                      </v-card-text>

                      <v-card-actions class="pa-2 pt-0">
                        <v-btn
                          size="small"
                          variant="tonal"
                          color="primary"
                          block
                          :href="getImageUrl(`/posters/${purchase.highres_filename}`)"
                          download
                          @click.stop
                        >
                          <v-icon size="small" left>mdi-download</v-icon>
                          Download
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>

                <div v-else class="text-center py-12">
                  <v-icon size="120" color="grey">mdi-cart-off</v-icon>
                  <h3 class="text-h5 mt-4 mb-2">No Purchases Yet</h3>
                  <p class="text-medium-emphasis mb-4">
                    Purchase your first high-resolution poster to see it here!
                  </p>
                  <v-btn color="primary" to="/" prepend-icon="mdi-plus">
                    Create Poster
                  </v-btn>
                </div>
              </v-window-item>

              <!-- Previews Tab -->
              <v-window-item value="previews">
                <div v-if="loadingPreviews" class="text-center py-8">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  <div class="mt-4">Loading previews...</div>
                </div>

                <v-row v-else-if="previews.length > 0">
                  <v-col
                    v-for="preview in previews"
                    :key="preview.request_id"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-card elevation="4" hover class="history-card">
                      <v-img
                        v-if="preview.preview_filename"
                        :src="getImageUrl(`/cache/${preview.preview_filename}`)"
                        :aspect-ratio="1"
                        cover
                        class="history-thumbnail"
                      >
                        <div class="purchased-badge">
                          <v-chip
                            :color="preview.is_purchased ? 'success' : 'grey'"
                            size="small"
                          >
                            <v-icon left size="small">
                              {{ preview.is_purchased ? 'mdi-check-circle' : 'mdi-eye' }}
                            </v-icon>
                            {{ preview.is_purchased ? 'Purchased' : 'Preview' }}
                          </v-chip>
                        </div>
                      </v-img>

                      <v-card-text class="pa-3">
                        <div class="text-subtitle-2 font-weight-bold text-truncate">
                          {{ preview.city || 'Custom Location' }}, {{ preview.country }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Theme: {{ preview.theme }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Created: {{ formatDate(preview.generated_at) }}
                        </div>
                      </v-card-text>

                      <v-card-actions class="pa-2 pt-0">
                        <v-btn
                          v-if="preview.is_purchased && preview.highres_filename"
                          size="small"
                          variant="tonal"
                          color="primary"
                          block
                          :href="getImageUrl(`/posters/${preview.highres_filename}`)"
                          download
                        >
                          <v-icon size="small" left>mdi-download</v-icon>
                          Download
                        </v-btn>
                        <v-btn
                          v-else
                          size="small"
                          variant="tonal"
                          color="success"
                          block
                        >
                          <v-icon size="small" left>mdi-credit-card</v-icon>
                          Buy High-Res
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>

                <div v-else class="text-center py-12">
                  <v-icon size="120" color="grey">mdi-image-off</v-icon>
                  <h3 class="text-h5 mt-4 mb-2">No Previews Yet</h3>
                  <p class="text-medium-emphasis mb-4">
                    Generate your first preview to see it here!
                  </p>
                  <v-btn color="primary" to="/" prepend-icon="mdi-plus">
                    Create Preview
                  </v-btn>
                </div>
              </v-window-item>

              <!-- Favorite Themes Tab -->
              <v-window-item value="themes">
                <div v-if="loadingThemes" class="text-center py-8">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  <div class="mt-4">Loading themes...</div>
                </div>

                <v-list v-else-if="favoriteThemes.length > 0">
                  <v-list-item
                    v-for="(theme, index) in favoriteThemes"
                    :key="theme.theme"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="getThemeColor(index)">
                        <span class="text-h6 text-white">{{ index + 1 }}</span>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="text-h6">
                      {{ formatThemeName(theme.theme) }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                      Used {{ theme.usage_count }} times
                      <span v-if="theme.purchase_count > 0">
                        • {{ theme.purchase_count }} purchased
                      </span>
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-progress-linear
                        :model-value="(theme.usage_count / favoriteThemes[0].usage_count) * 100"
                        :color="getThemeColor(index)"
                        height="8"
                        rounded
                        style="width: 150px"
                      ></v-progress-linear>
                    </template>
                  </v-list-item>
                </v-list>

                <div v-else class="text-center py-12">
                  <v-icon size="120" color="grey">mdi-palette-outline</v-icon>
                  <h3 class="text-h5 mt-4 mb-2">No Theme Data Yet</h3>
                  <p class="text-medium-emphasis">
                    Generate some posters to see your favorite themes!
                  </p>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card v-if="selectedPurchase">
        <v-card-title class="d-flex align-center">
          <span class="text-h5">Poster Details</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-img
                v-if="selectedPurchase.highres_filename"
                :src="getImageUrl(`/posters/${selectedPurchase.highres_filename}`)"
                max-height="400"
                contain
              ></v-img>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-3">Configuration</h3>
              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>Location</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedPurchase.city || 'Custom' }}, {{ selectedPurchase.country }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Theme</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPurchase.theme }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Distance</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPurchase.distance }}m</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Orientation</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPurchase.orientation }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Purchased</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedPurchase.paid_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Amount Paid</v-list-item-title>
                  <v-list-item-subtitle class="text-success font-weight-bold">
                    {{ formatCurrency(selectedPurchase.amount) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :href="getImageUrl(`/posters/${selectedPurchase.highres_filename}`)"
            download
            prepend-icon="mdi-download"
          >
            Download High-Res
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiService from '../services/api'

// State
const activeTab = ref('purchases')
const stats = ref(null)
const purchases = ref([])
const previews = ref([])
const favoriteThemes = ref([])
const selectedPurchase = ref(null)
const detailsDialog = ref(false)

// Loading states
const loadingPurchases = ref(false)
const loadingPreviews = ref(false)
const loadingThemes = ref(false)

// Methods
const loadStats = async () => {
  try {
    const response = await apiService.getUserStats()
    stats.value = response.data
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadPurchases = async () => {
  loadingPurchases.value = true
  try {
    const response = await apiService.getPurchaseHistory(50)
    purchases.value = response.data
  } catch (error) {
    console.error('Error loading purchases:', error)
  } finally {
    loadingPurchases.value = false
  }
}

const loadPreviews = async () => {
  loadingPreviews.value = true
  try {
    const response = await apiService.getPreviewHistory(50)
    previews.value = response.data
  } catch (error) {
    console.error('Error loading previews:', error)
  } finally {
    loadingPreviews.value = false
  }
}

const loadFavoriteThemes = async () => {
  loadingThemes.value = true
  try {
    const response = await apiService.getFavoriteThemes()
    favoriteThemes.value = response.data
  } catch (error) {
    console.error('Error loading themes:', error)
  } finally {
    loadingThemes.value = false
  }
}

const viewDetails = (purchase) => {
  selectedPurchase.value = purchase
  detailsDialog.value = true
}

const getImageUrl = (path) => {
  return apiService.getImageUrl(path)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (cents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

const formatThemeName = (theme) => {
  return theme.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getThemeColor = (index) => {
  const colors = ['primary', 'success', 'info', 'warning', 'error']
  return colors[index % colors.length]
}

// Lifecycle
onMounted(() => {
  loadStats()
  loadPurchases()
  loadPreviews()
  loadFavoriteThemes()
})
</script>

<style scoped>
.history-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.history-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

.history-thumbnail {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
}

.purchased-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
