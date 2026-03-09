<template>
  <div class="history-page">
    <div class="history-container">

      <!-- Header -->
      <div class="page-header">
        <p class="section-eyebrow">Your account</p>
        <h1 class="page-title">{{ $t('history.title') }}</h1>
      </div>

      <!-- Stats -->
      <div v-if="stats" class="stats-grid">
        <div class="stat-card">
          <span class="stat-card__value">{{ stats.totalPreviews }}</span>
          <span class="stat-card__label">{{ $t('history.stats.totalPreviews') }}</span>
        </div>
        <div class="stat-card stat-card--accent">
          <span class="stat-card__value">{{ stats.totalPurchases }}</span>
          <span class="stat-card__label">{{ $t('history.stats.totalPurchases') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ stats.totalSpentFormatted }}</span>
          <span class="stat-card__label">{{ $t('history.stats.totalSpent') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value stat-card__value--sm">{{ formatDate(stats.memberSince) }}</span>
          <span class="stat-card__label">{{ $t('history.stats.memberSince') }}</span>
        </div>
      </div>
      <div v-else class="stats-loading">
        <v-progress-circular indeterminate color="primary" size="28" />
      </div>

      <!-- Tabs -->
      <div class="tabs-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          <v-icon size="16">{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </button>
      </div>

      <!-- Purchases tab -->
      <div v-if="activeTab === 'purchases'">
        <div v-if="loadingPurchases" class="loading-center">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="purchases.length > 0" class="history-grid">
          <div
            v-for="purchase in purchases"
            :key="purchase.request_id"
            class="history-card"
            @click="viewDetails(purchase)"
          >
            <div class="history-card__img-wrap">
              <v-img
                v-if="purchase.highres_filename"
                :src="getImageUrl(`/posters/${purchase.highres_filename}`)"
                :aspect-ratio="3/4"
                cover
              />
              <div v-else class="history-card__no-img">
                <v-icon color="#CCC" size="32">mdi-image-off-outline</v-icon>
              </div>
              <v-chip class="history-card__badge" color="success" size="x-small" label>
                Purchased
              </v-chip>
            </div>
            <div class="history-card__meta">
              <span class="history-card__location">
                {{ purchase.city || 'Custom' }}, {{ purchase.country }}
              </span>
              <span class="history-card__theme">{{ formatThemeName(purchase.theme) }}</span>
              <span class="history-card__price">{{ formatCurrency(purchase.amount) }}</span>
            </div>
            <a
              :href="getImageUrl(`/posters/${purchase.highres_filename}`)"
              :download="purchase.highres_filename"
              class="history-card__download"
              @click.stop
            >
              <v-icon size="14">mdi-download</v-icon> Download
            </a>
          </div>
        </div>
        <div v-else class="empty-tab">
          <v-icon size="56" color="#CCCCCC">mdi-cart-off</v-icon>
          <p>No purchases yet.</p>
          <v-btn color="primary" rounded="xl" elevation="0" to="/create" size="small">Create a poster</v-btn>
        </div>
      </div>

      <!-- Previews tab -->
      <div v-if="activeTab === 'previews'">
        <div v-if="loadingPreviews" class="loading-center">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="previews.length > 0" class="history-grid">
          <div
            v-for="preview in previews"
            :key="preview.request_id"
            class="history-card"
          >
            <div class="history-card__img-wrap">
              <v-img
                v-if="preview.preview_filename"
                :src="getImageUrl(`/cache/${preview.preview_filename}`)"
                :aspect-ratio="3/4"
                cover
              />
              <div v-else class="history-card__no-img">
                <v-icon color="#CCC" size="32">mdi-image-off-outline</v-icon>
              </div>
              <v-chip
                class="history-card__badge"
                :color="preview.is_purchased ? 'success' : 'default'"
                size="x-small"
                label
              >
                {{ preview.is_purchased ? 'Purchased' : 'Preview' }}
              </v-chip>
            </div>
            <div class="history-card__meta">
              <span class="history-card__location">
                {{ preview.city || 'Custom' }}, {{ preview.country }}
              </span>
              <span class="history-card__theme">{{ formatThemeName(preview.theme) }}</span>
            </div>
            <v-btn
              v-if="!preview.is_purchased"
              color="primary"
              variant="tonal"
              size="x-small"
              block
              style="border-radius: 0 0 14px 14px;"
            >
              Buy high-res
            </v-btn>
          </div>
        </div>
        <div v-else class="empty-tab">
          <v-icon size="56" color="#CCCCCC">mdi-image-off-outline</v-icon>
          <p>No previews yet.</p>
          <v-btn color="primary" rounded="xl" elevation="0" to="/create" size="small">Generate one</v-btn>
        </div>
      </div>

      <!-- Themes tab -->
      <div v-if="activeTab === 'themes'">
        <div v-if="loadingThemes" class="loading-center">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="favoriteThemes.length > 0" class="themes-list">
          <div
            v-for="(theme, index) in favoriteThemes"
            :key="theme.theme"
            class="theme-row"
          >
            <span class="theme-row__rank">{{ index + 1 }}</span>
            <div class="theme-row__info">
              <span class="theme-row__name">{{ formatThemeName(theme.theme) }}</span>
              <span class="theme-row__used">Used {{ theme.usage_count }} times</span>
            </div>
            <div class="theme-row__bar-wrap">
              <div
                class="theme-row__bar"
                :style="{ width: (theme.usage_count / favoriteThemes[0].usage_count * 100) + '%' }"
              />
            </div>
          </div>
        </div>
        <div v-else class="empty-tab">
          <v-icon size="56" color="#CCCCCC">mdi-palette-outline</v-icon>
          <p>No theme data yet.</p>
        </div>
      </div>

    </div>

    <!-- Detail dialog -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card v-if="selectedPurchase" rounded="xl" elevation="0">
        <div class="dialog-header">
          <span class="dialog-title">Poster details</span>
          <v-btn icon variant="text" @click="detailsDialog = false" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="dialog-body">
          <v-img
            v-if="selectedPurchase.highres_filename"
            :src="getImageUrl(`/posters/${selectedPurchase.highres_filename}`)"
            max-height="340"
            contain
            class="dialog-img"
          />
          <div class="dialog-details">
            <div class="detail-row"><span>Location</span><strong>{{ selectedPurchase.city || 'Custom' }}, {{ selectedPurchase.country }}</strong></div>
            <div class="detail-row"><span>Theme</span><strong>{{ formatThemeName(selectedPurchase.theme) }}</strong></div>
            <div class="detail-row"><span>Distance</span><strong>{{ selectedPurchase.distance }}m</strong></div>
            <div class="detail-row"><span>Orientation</span><strong>{{ selectedPurchase.orientation }}</strong></div>
            <div class="detail-row"><span>Purchased</span><strong>{{ formatDate(selectedPurchase.paid_at) }}</strong></div>
            <div class="detail-row"><span>Amount</span><strong style="color: #00A699">{{ formatCurrency(selectedPurchase.amount) }}</strong></div>
          </div>
        </div>
        <div class="dialog-footer">
          <v-btn
            color="primary"
            rounded="xl"
            elevation="0"
            :href="getImageUrl(`/posters/${selectedPurchase.highres_filename}`)"
            :download="selectedPurchase.highres_filename"
            prepend-icon="mdi-download"
          >
            Download high-res
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiService from '../services/api'

const activeTab = ref('purchases')
const stats = ref(null)
const purchases = ref([])
const previews = ref([])
const favoriteThemes = ref([])
const selectedPurchase = ref(null)
const detailsDialog = ref(false)
const loadingPurchases = ref(false)
const loadingPreviews = ref(false)
const loadingThemes = ref(false)

const tabs = [
  { value: 'purchases', label: 'Purchases', icon: 'mdi-cart-check' },
  { value: 'previews',  label: 'Previews',  icon: 'mdi-image-search' },
  { value: 'themes',    label: 'Themes',    icon: 'mdi-palette' },
]

const loadStats = async () => {
  try { stats.value = (await apiService.getUserStats()).data } catch {}
}
const loadPurchases = async () => {
  loadingPurchases.value = true
  try { purchases.value = (await apiService.getPurchaseHistory(50)).data } catch {}
  finally { loadingPurchases.value = false }
}
const loadPreviews = async () => {
  loadingPreviews.value = true
  try { previews.value = (await apiService.getPreviewHistory(50)).data } catch {}
  finally { loadingPreviews.value = false }
}
const loadFavoriteThemes = async () => {
  loadingThemes.value = true
  try { favoriteThemes.value = (await apiService.getFavoriteThemes()).data } catch {}
  finally { loadingThemes.value = false }
}
const viewDetails = (p) => { selectedPurchase.value = p; detailsDialog.value = true }
const getImageUrl = (p) => apiService.getImageUrl(p)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
const formatCurrency = (c) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c / 100)
const formatThemeName = (t) => t?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ?? ''

onMounted(() => { loadStats(); loadPurchases(); loadPreviews(); loadFavoriteThemes() })
</script>

<style scoped>
.history-page {
  background: #F7F7F7;
  min-height: 100vh;
  padding: 40px 24px 80px;
}

.history-container {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.section-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #FF385C;
  margin: 0 0 4px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #222;
  margin: 0;
  letter-spacing: -0.5px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border: 1px solid #EBEBEB;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card--accent {
  border-color: #FF385C;
  background: #fff5f6;
}

.stat-card__value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #222;
  letter-spacing: -0.5px;
}

.stat-card__value--sm {
  font-size: 1rem;
}

.stat-card__label {
  font-size: 0.78rem;
  color: #888;
  font-weight: 500;
}

.stats-loading {
  display: flex;
  justify-content: center;
  padding: 32px;
}

/* Tabs */
.tabs-wrap {
  display: flex;
  gap: 4px;
  background: #fff;
  border: 1px solid #EBEBEB;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  color: #717171;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tab-btn--active {
  background: #F7F7F7;
  color: #222;
  font-weight: 600;
}

/* History grid */
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.history-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #EBEBEB;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.history-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
}

.history-card__img-wrap {
  position: relative;
}

.history-card__no-img {
  aspect-ratio: 3/4;
  background: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-card__badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.history-card__meta {
  padding: 10px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.history-card__location {
  font-size: 0.82rem;
  font-weight: 700;
  color: #222;
}

.history-card__theme {
  font-size: 0.73rem;
  color: #888;
}

.history-card__price {
  font-size: 0.8rem;
  font-weight: 700;
  color: #00A699;
  margin-top: 4px;
}

.history-card__download {
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

/* Themes list */
.themes-list {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #EBEBEB;
  overflow: hidden;
}

.theme-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #F5F5F5;
}

.theme-row:last-child {
  border-bottom: none;
}

.theme-row__rank {
  font-size: 0.8rem;
  font-weight: 700;
  color: #FF385C;
  min-width: 24px;
}

.theme-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 140px;
}

.theme-row__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
}

.theme-row__used {
  font-size: 0.73rem;
  color: #888;
}

.theme-row__bar-wrap {
  flex: 1;
  height: 6px;
  background: #F0F0F0;
  border-radius: 100px;
  overflow: hidden;
}

.theme-row__bar {
  height: 100%;
  background: #FF385C;
  border-radius: 100px;
  transition: width 0.3s ease;
}

/* Empty */
.empty-tab {
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-tab p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px;
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
}

.dialog-body {
  display: flex;
  gap: 24px;
  padding: 24px;
  flex-wrap: wrap;
}

.dialog-img {
  flex: 1;
  min-width: 200px;
  border-radius: 12px;
  background: #F7F7F7;
}

.dialog-details {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  border-bottom: 1px solid #F5F5F5;
  padding-bottom: 10px;
}

.detail-row span {
  color: #888;
}

.detail-row strong {
  color: #222;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #EBEBEB;
  display: flex;
  justify-content: flex-end;
}
</style>
