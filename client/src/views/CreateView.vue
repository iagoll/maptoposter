<template>
  <div class="create-page">
    <div class="create-container">

      <!-- Page header -->
      <div class="create-header">
        <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-arrow-left"
          to="/"
          class="back-btn"
        >
          {{ $t('create.back') }}
        </v-btn>
        <div>
          <h1 class="create-title">{{ $t('create.pageTitle') }}</h1>
          <p class="create-subtitle">{{ $t('create.pageSubtitle') }}</p>
        </div>
        <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-lightbulb-outline"
          @click="loadExample"
          color="secondary"
        >
          {{ $t('create.loadExample') }}
        </v-btn>
      </div>

      <v-form ref="form" v-model="store.formValid">

        <!-- ─── SECTION 1: Location ─── -->
        <div class="form-section">
          <div class="form-section__header">
            <span class="form-section__num">01</span>
            <div>
              <h2 class="form-section__title">{{ $t('create.locationTitle') }}</h2>
              <p class="form-section__subtitle">{{ $t('create.locationSubtitle') }}</p>
            </div>
          </div>

          <!-- Input mode toggle -->
          <div class="coord-toggle mb-4">
            <button
              type="button"
              class="toggle-pill"
              :class="{ 'toggle-pill--active': inputMode === 'city' }"
              @click="inputMode = 'city'"
            >
              <v-icon size="14">mdi-city</v-icon> {{ $t('create.cityNameMode') }}
            </button>
            <button
              type="button"
              class="toggle-pill"
              :class="{ 'toggle-pill--active': inputMode === 'coords' }"
              @click="inputMode = 'coords'"
            >
              <v-icon size="14">mdi-crosshairs-gps</v-icon> {{ $t('create.coordsMode') }}
            </button>
            <button
              type="button"
              class="toggle-pill"
              :class="{ 'toggle-pill--active': inputMode === 'map' }"
              @click="inputMode = 'map'"
            >
              <v-icon size="14">mdi-map</v-icon> {{ $t('create.interactiveMapMode') }}
            </button>
          </div>

          <!-- City name mode -->
          <div v-if="inputMode === 'city'" class="fields-row">
            <v-text-field
              v-model="store.formData.city"
              :label="$t('form.city')"
              :placeholder="$t('form.cityPlaceholder')"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || $t('create.cityRequired')]"
              hide-details="auto"
              class="flex-grow-1"
            />
            <v-text-field
              v-model="store.formData.country"
              :label="$t('form.country')"
              :placeholder="$t('form.countryPlaceholder')"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || $t('create.countryRequired')]"
              hide-details="auto"
              class="flex-grow-1"
            />
          </div>

          <!-- Raw coordinates mode -->
          <div v-else-if="inputMode === 'coords'" class="fields-row">
            <v-text-field
              v-model="store.formData.coords"
              :label="$t('form.coordinates')"
              placeholder="48.8566, 2.3522"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="coordsRules"
              hide-details="auto"
              :hint="$t('create.coordsHint')"
              persistent-hint
              class="flex-grow-1"
            />
            <v-text-field
              v-model="store.formData.country"
              :label="$t('form.country')"
              :placeholder="$t('form.countryPlaceholder')"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || $t('create.countryRequired')]"
              hide-details="auto"
              class="flex-grow-1"
            />
          </div>

          <!-- Interactive map mode -->
          <div v-else class="map-mode">
            <MapFrameSelector
              :orientation="store.formData.orientation"
              :initial-lat="mapInit.lat"
              :initial-lng="mapInit.lng"
              :initial-zoom="mapInit.zoom"
              :theme-colors="selectedThemeColors"
              @position-changed="onMapPositionChanged"
              @position-confirmed="onMapPositionConfirmed"
            />

            <div v-if="mapPosition" class="map-position-badge mt-2">
              <v-icon size="14" color="success">mdi-check-circle</v-icon>
              {{ $t('create.positionCaptured', { distance: formattedMapDistance }) }}
            </div>

            <!-- Compact inline theme picker for map mode -->
            <div class="map-theme-strip">
              <span class="map-theme-strip__label">{{ $t('create.themeStripLabel') }}</span>
              <div class="map-theme-strip__scroller">
                <button
                  v-for="t in store.themes"
                  :key="t.id"
                  type="button"
                  class="map-theme-pill"
                  :class="{ 'map-theme-pill--active': store.formData.theme === t.id }"
                  :title="t.name"
                  @click="store.formData.theme = t.id"
                >
                  <span
                    class="map-theme-pill__swatch"
                    :style="{ background: `linear-gradient(135deg, ${t.bg || '#fff'} 55%, ${t.road || '#333'} 100%)` }"
                  />
                  <span class="map-theme-pill__name">{{ t.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ── Poster text overrides ── (all modes) -->
          <div class="poster-text-fields">
            <v-text-field
              v-model="store.formData.title"
              :label="$t('create.titleOnPoster')"
              :placeholder="inputMode === 'city' ? (store.formData.city || 'e.g. London') : inputMode === 'coords' ? 'e.g. My Location' : (store.formData.city || 'e.g. London')"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              prepend-inner-icon="mdi-format-title"
              :hint="$t('create.titleHint')"
              persistent-hint
              clearable
            />
            <v-text-field
              v-model="store.formData.subtitle"
              :label="$t('create.subtitleOnPoster')"
              :placeholder="inputMode === 'city' ? (store.formData.country || 'e.g. United Kingdom') : inputMode === 'coords' ? 'e.g. Spain' : (store.formData.country || 'e.g. United Kingdom')"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              prepend-inner-icon="mdi-subtitles-outline"
              :hint="$t('create.subtitleHint')"
              persistent-hint
              clearable
            />
          </div>
        </div>

        <!-- ─── SECTION 2: Theme ─── -->
        <div class="form-section">
          <div class="form-section__header">
            <span class="form-section__num">02</span>
            <div>
              <h2 class="form-section__title">{{ $t('create.themeTitle') }}</h2>
              <p class="form-section__subtitle">{{ $t('create.themeSubtitle') }}</p>
            </div>
          </div>

          <ThemeGrid
            v-model="store.formData.theme"
            :themes="store.themes"
            :loading="store.loadingThemes"
          />
        </div>

        <!-- ─── SECTION 3: Options ─── -->
        <div class="form-section">
          <div class="form-section__header">
            <span class="form-section__num">03</span>
            <div>
              <h2 class="form-section__title">{{ $t('create.optionsTitle') }}</h2>
              <p class="form-section__subtitle">{{ $t('create.optionsSubtitle') }}</p>
            </div>
          </div>

          <!-- Distance (hidden when map mode — radius is set by zoom) -->
          <div v-if="inputMode !== 'map'" class="option-block">
            <div class="option-block__label">
              <span>{{ $t('create.mapRadius') }}</span>
              <strong>{{ (store.formData.distance / 1000).toFixed(0) }} km</strong>
            </div>
            <v-slider
              v-model="store.formData.distance"
              :min="4000"
              :max="50000"
              :step="1000"
              color="primary"
              track-color="#EBEBEB"
              thumb-color="primary"
              hide-details
            />
            <div class="option-block__hint">
              {{ $t('create.radiusHint') }}
            </div>
          </div>

          <!-- Orientation -->
          <div class="option-block">
            <div class="option-block__label"><span>{{ $t('create.formatLabel') }}</span></div>
            <div class="orientation-toggle">
              <button
                v-for="opt in orientationOptions"
                :key="opt.value"
                type="button"
                class="orient-btn"
                :class="{ 'orient-btn--active': store.formData.orientation === opt.value }"
                @click="store.formData.orientation = opt.value"
                :title="opt.hint"
              >
                <!-- SVG shape preview -->
                <svg
                  class="orient-btn__shape"
                  viewBox="0 0 32 32"
                  :width="opt.svgW"
                  :height="opt.svgH"
                  aria-hidden="true"
                >
                  <rect
                    :x="(32 - opt.rW) / 2"
                    :y="(32 - opt.rH) / 2"
                    :width="opt.rW"
                    :height="opt.rH"
                    rx="2" ry="2"
                    :fill="store.formData.orientation === opt.value ? '#FF385C' : '#BDBDBD'"
                  />
                </svg>
                <span>{{ opt.label }}</span>
                <span class="orient-btn__ratio">{{ opt.ratio }}</span>
              </button>
            </div>
          </div>

          <!-- Title position -->
          <div class="option-block">
            <div class="option-block__label"><span>{{ $t('create.titlePositionLabel') }}</span></div>
            <div class="title-pos-grid">
              <button
                v-for="pos in titlePositions"
                :key="pos.value"
                type="button"
                class="pos-btn"
                :class="{ 'pos-btn--active': store.formData.titlePos === pos.value }"
                @click="store.formData.titlePos = pos.value"
              >
                {{ pos.title }}
              </button>
            </div>
          </div>

          <!-- Full borders -->
          <div class="option-block option-block--inline">
            <div>
              <div class="option-block__label"><span>{{ $t('create.fullBordersLabel') }}</span></div>
              <div class="option-block__hint" style="margin-top: 2px;">
                {{ $t('create.fullBordersHint') }}
              </div>
            </div>
            <v-switch
              v-model="store.formData.fullBorders"
              color="primary"
              hide-details
              inset
            />
          </div>
        </div>

      </v-form>

      <!-- ─── OUTPUT: Terminal + Poster ─── -->
      <div v-if="store.showTerminal || store.generatedPoster" class="output-section">
        <TerminalLogs v-if="store.showTerminal" />

        <!-- Preview poster (watermarked) -->
        <div v-if="store.generatedPoster && !highResResult" class="poster-output">
          <div class="poster-output__badge">
            <v-icon size="14" color="warning">mdi-watermark</v-icon>
            {{ $t('create.previewBadge') }}
          </div>
          <PosterDisplay />
        </div>

        <!-- High-res poster (paid) -->
        <div v-if="highResResult" class="poster-output poster-output--highres">
          <div class="poster-output__badge poster-output__badge--success">
            <v-icon size="14" color="success">mdi-star</v-icon>
            {{ $t('create.highResBadge') }}
          </div>
          <img
            :src="apiService.getImageUrl(highResResult.url)"
            class="poster-img"
            :alt="$t('create.highResAlt')"
          />
        </div>
      </div>

      <!-- spacer so sticky bar doesn't cover content -->
      <div style="height: 100px;" />
    </div>

    <!-- ─── STICKY ACTION BAR (3 phases) ─── -->
    <div class="sticky-bar">
      <div class="sticky-bar__inner">

        <!-- Status indicator -->
        <div class="sticky-bar__status">
          <template v-if="store.jobStatus === 'completed' && !previewJobDone">
            <v-progress-circular indeterminate size="16" width="2" color="primary" />
            <span>{{ $t('create.finalising') }}</span>
          </template>
          <template v-else-if="highResResult">
            <v-icon color="success" size="18">mdi-check-circle</v-icon>
            <span>{{ $t('create.readyToDownload') }}</span>
          </template>
          <template v-else-if="previewJobDone">
            <v-icon color="warning" size="18">mdi-eye</v-icon>
            <span>{{ $t('create.previewReady') }}</span>
          </template>
          <template v-else-if="store.generating">
            <v-progress-circular indeterminate size="16" width="2" color="primary" />
            <span>{{ $t('create.generatingStatus') }}</span>
          </template>
          <template v-else>
            <span style="visibility:hidden">—</span>
          </template>
        </div>

        <!-- PHASE 1: Generate free preview -->
        <template v-if="!previewJobDone && !highResResult">
          <v-btn
            v-if="inputMode === 'map'"
            color="primary"
            size="large"
            rounded="xl"
            elevation="0"
            :loading="store.generating"
            :disabled="!canPreviewMap || store.generating"
            @click="generateMapPreview"
            class="generate-btn"
            min-width="200"
          >
            <v-icon start>mdi-eye</v-icon>
            {{ store.generating ? $t('create.generatingStatus') : $t('create.previewBtn') }}
          </v-btn>
          <v-btn
            v-else
            color="primary"
            size="large"
            rounded="xl"
            elevation="0"
            :loading="store.generating"
            :disabled="!store.formValid || store.generating"
            @click="store.generatePoster()"
            class="generate-btn"
            min-width="200"
          >
            <v-icon start>mdi-creation</v-icon>
            {{ store.generating ? $t('create.generatingStatus') : $t('create.generateSampleBtn') }}
          </v-btn>
        </template>

        <!-- PHASE 2: Buy high-res -->
        <template v-else-if="previewJobDone && !highResResult && !generatingFinal">
          <div class="phase2-actions">
            <v-btn
              color="success"
              size="large"
              rounded="xl"
              elevation="0"
              prepend-icon="mdi-credit-card"
              :loading="checkoutLoading"
              @click="buyHighRes"
              class="generate-btn"
              min-width="220"
            >
              {{ $t('create.buyHighResBtn') }}
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              color="secondary"
              @click="resetPreview"
            >
              {{ $t('create.startOver') }}
            </v-btn>
          </div>
        </template>

        <!-- PHASE 2b: Generating final (after payment success) -->
        <template v-else-if="generatingFinal">
          <v-btn
            color="primary"
            size="large"
            rounded="xl"
            elevation="0"
            loading
            class="generate-btn"
            min-width="220"
          >
            {{ $t('create.renderingBtn') }}
          </v-btn>
        </template>

        <!-- PHASE 3: Download + Email -->
        <template v-else-if="highResResult">
          <div class="phase3-actions">
            <v-btn
              color="primary"
              size="large"
              rounded="xl"
              elevation="0"
              prepend-icon="mdi-download"
              :href="apiService.getImageUrl(highResResult.url)"
              :download="highResResult.filename || 'map-poster.png'"
              class="generate-btn"
            >
              {{ $t('create.downloadPng') }}
            </v-btn>
            <v-btn
              variant="outlined"
              size="large"
              rounded="xl"
              color="primary"
              prepend-icon="mdi-email"
              :loading="emailLoading"
              @click="showEmailDialog = true"
              class="generate-btn"
            >
              {{ $t('create.emailMe') }}
            </v-btn>
          </div>
        </template>

        <!-- Reset button in all non-final phases -->
        <v-btn
          v-if="!previewJobDone && !highResResult && inputMode !== 'map'"
          variant="text"
          size="small"
          color="secondary"
          :disabled="store.generating"
          @click="store.resetForm()"
        >
          {{ $t('create.reset') }}
        </v-btn>
      </div>
    </div>

    <!-- ─── EMAIL DIALOG ─── -->
    <v-dialog v-model="showEmailDialog" max-width="400">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">{{ $t('create.emailDialogTitle') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="emailAddress"
            :label="$t('create.emailLabel')"
            type="email"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details="auto"
            :rules="[v => /.+@.+\..+/.test(v) || $t('create.emailValidation')]"
          />
        </v-card-text>
        <v-card-actions class="justify-end gap-2">
          <v-btn variant="text" @click="showEmailDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="emailLoading"
            @click="sendEmail"
          >
            {{ $t('create.sendBtn') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── SIGN-IN DIALOG ─── -->
    <v-dialog v-model="showSignInDialog" max-width="400">
      <v-card rounded="xl" class="pa-6 text-center">
        <v-icon size="48" color="primary" class="mb-3">mdi-account-circle</v-icon>
        <v-card-title class="text-h6 font-weight-bold justify-center">
          {{ $t('create.signInTitle') }}
        </v-card-title>
        <v-card-text class="text-body-2 text-medium-emphasis">
          {{ $t('create.signInDesc') }}
        </v-card-text>
        <v-card-actions class="flex-column gap-2 px-4 pb-4">
          <v-btn
            color="primary"
            variant="flat"
            rounded="xl"
            block
            prepend-icon="mdi-google"
            :loading="signInLoading"
            @click="handleSignIn"
          >
            {{ $t('create.continueWithGoogle') }}
          </v-btn>
          <v-btn variant="text" size="small" @click="showSignInDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePosterStore } from '../store/posterStore'
import { useAuth } from '../composables/useAuth'
import ThemeGrid from '../components/ThemeGrid.vue'
import TerminalLogs from '../components/TerminalLogs.vue'
import PosterDisplay from '../components/PosterDisplay.vue'
import MapFrameSelector from '../components/MapFrameSelector.vue'
import apiService from '../services/api'
import sseService from '../services/sseService'
import { getRandomExample, validateCoordinates } from '../services/utils'

const store = usePosterStore()
const route = useRoute()
const { t } = useI18n()
const { currentUser, signInWithGoogle, getIdToken } = useAuth()
const form = ref(null)

// Orientation options with SVG shape data
// rW / rH are the rect dimensions inside a 32×32 viewBox
const orientationOptions = computed(() => [
  { value: 'vertical',   label: t('create.orientation.portrait'),   ratio: '3:4',    hint: t('create.orientationHints.portrait'),   svgW: 22, svgH: 28, rW: 18, rH: 24 },
  { value: 'horizontal', label: t('create.orientation.landscape'),  ratio: '4:3',    hint: t('create.orientationHints.landscape'),  svgW: 30, svgH: 24, rW: 26, rH: 20 },
  { value: 'widescreen', label: t('create.orientation.widescreen'), ratio: '16:9',   hint: t('create.orientationHints.widescreen'), svgW: 30, svgH: 20, rW: 28, rH: 16 },
  { value: 'square',     label: t('create.orientation.square'),     ratio: '1:1',    hint: t('create.orientationHints.square'),     svgW: 26, svgH: 26, rW: 22, rH: 22 },
  { value: 'mobile',     label: t('create.orientation.mobile'),     ratio: '9:19.5', hint: t('create.orientationHints.mobile'),     svgW: 16, svgH: 28, rW: 12, rH: 26 },
  { value: 'banner',     label: t('create.orientation.banner'),     ratio: '3:1',    hint: t('create.orientationHints.banner'),     svgW: 30, svgH: 16, rW: 28, rH: 10 },
])

const titlePositions = computed(() => [
  { title: t('form.titlePos.topLeft'),      value: 'top-left' },
  { title: t('form.titlePos.topCenter'),    value: 'top-center' },
  { title: t('form.titlePos.topRight'),     value: 'top-right' },
  { title: t('form.titlePos.bottomLeft'),   value: 'bottom-left' },
  { title: t('form.titlePos.bottomCenter'), value: 'bottom-center' },
  { title: t('form.titlePos.bottomRight'),  value: 'bottom-right' },
])

// ── Input mode ───────────────────────────────────────────────────────────────
const inputMode = ref('city') // 'city' | 'coords' | 'map'

// Keep posterStore in sync so store.generatePoster() still works for the
// legacy city / coords modes
watch(inputMode, (mode) => {
  store.useCoordinates = mode === 'coords'
})

// ── Map frame state ───────────────────────────────────────────────────────────
// Initialise from the store's locale-based default (set by settingsStore.language)
const mapInit = ref(
  store.mapLocaleCenter || { lat: 51.5074, lng: -0.1278, zoom: 12 }
)

// When the user switches language, re-centre the map
watch(() => store.mapLocaleCenter, (c) => {
  if (c) mapInit.value = { ...c }
})
const mapPosition = ref(null) // { lat, lng, zoom, distance }
const mapZoom = ref(12)

const formattedMapDistance = computed(() => {
  if (!mapPosition.value) return ''
  const d = mapPosition.value.distance
  return d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${d} m`
})

const canPreviewMap = computed(() =>
  !!mapPosition.value && !!store.formData.country
)

// The full color object for the currently selected theme
const selectedThemeColors = computed(() => {
  const t = store.themes.find(th => th.id === store.formData.theme)
  return t || null
})

function onMapPositionChanged(pos) {
  mapPosition.value = pos
  mapZoom.value = pos.zoom
}

function onMapPositionConfirmed(pos) {
  mapPosition.value = pos
  mapZoom.value = pos.zoom
  store.showSnackbar(`Position set — radius ${pos.distance >= 1000 ? (pos.distance / 1000).toFixed(1) + ' km' : pos.distance + ' m'}`, 'success')
}

// ── Preview / payment state ───────────────────────────────────────────────────
const previewJobDone = ref(false)   // true once free preview completes
const generatingFinal = ref(false)  // true while 300 DPI job runs
const highResResult = ref(null)     // { url, filename } for 300 DPI poster
const currentRequestId = ref(null)  // DB requestId once payment initiates
const checkoutLoading = ref(false)

// ── Sign-in dialog ────────────────────────────────────────────────────────────
const showSignInDialog = ref(false)
const signInLoading = ref(false)
let pendingActionAfterSignIn = null

async function handleSignIn() {
  signInLoading.value = true
  try {
    await signInWithGoogle()
    showSignInDialog.value = false
    if (pendingActionAfterSignIn) {
      await pendingActionAfterSignIn()
      pendingActionAfterSignIn = null
    }
  } catch (err) {
    store.showSnackbar('Sign-in failed: ' + err.message, 'error')
  } finally {
    signInLoading.value = false
  }
}

// ── Email dialog ──────────────────────────────────────────────────────────────
const showEmailDialog = ref(false)
const emailAddress = ref(currentUser.value?.email || '')
const emailLoading = ref(false)

async function sendEmail() {
  if (!emailAddress.value || !currentRequestId.value) return
  emailLoading.value = true
  try {
    const token = await getIdToken()
    await apiService.sendPosterByEmail(currentRequestId.value, emailAddress.value, token)
    showEmailDialog.value = false
    store.showSnackbar('Poster sent! Check your inbox.', 'success')
  } catch (err) {
    store.showSnackbar('Failed to send email: ' + (err.response?.data?.error || err.message), 'error')
  } finally {
    emailLoading.value = false
  }
}

// ── Form helpers ──────────────────────────────────────────────────────────────
const coordsRules = [
  v => {
    if (inputMode.value !== 'coords') return true
    if (!v) return t('create.coordsRequired')
    return validateCoordinates(v) || t('create.coordsFormat')
  }
]

const loadExample = () => {
  const example = getRandomExample()
  Object.assign(store.formData, example)
  inputMode.value = 'city'
  store.formData.title = ''
  store.formData.subtitle = ''
  store.showSnackbar(`Loaded: ${example.city}, ${example.country}`, 'info')
  // Reset map to locale default centre
  if (store.mapLocaleCenter) mapInit.value = { ...store.mapLocaleCenter }
}

function resetPreview() {
  previewJobDone.value = false
  highResResult.value = null
  currentRequestId.value = null
  store.showTerminal = false
  store.generatedPoster = null
  store.jobStatus = 'idle'
}

// ── Map preview generation ────────────────────────────────────────────────────
async function generateMapPreview() {
  if (!mapPosition.value || !store.formData.country) return
  store.generating = true
  store.showTerminal = true
  store.logs = []
  store.generatedPoster = null
  store.jobStatus = 'running'
  previewJobDone.value = false

  try {
    const body = {
      center_lat: mapPosition.value.lat,
      center_lng: mapPosition.value.lng,
      zoom: mapZoom.value,
      country: store.formData.subtitle || store.formData.country,
      theme: store.formData.theme,
      orientation: store.formData.orientation,
      title: store.formData.title || undefined,
      titlePos: store.formData.titlePos,
      fullBorders: store.formData.fullBorders,
    }

    const response = await apiService.renderPreview(body)
    store.jobId = response.jobId

    store.showSnackbar('Preview started — watch the live logs!', 'info')
    connectPreviewToLogs(response.jobId)
  } catch (err) {
    store.generating = false
    store.jobStatus = 'failed'
    store.showSnackbar(err.response?.data?.error || 'Failed to start preview', 'error')
  }
}

function connectPreviewToLogs(id) {
  const logsUrl = apiService.getLogsUrl(id)
  sseService.connect(logsUrl, {
    onMessage: (log) => { store.logs.push(log) },
    onComplete: (data) => {
      store.jobStatus = data.status
      store.generating = false
      if (data.status === 'completed' && data.result) {
        store.generatedPoster = data.result
        previewJobDone.value = true
        store.showSnackbar('Preview ready! Buy the high-res version to download.', 'success')
      } else {
        store.showSnackbar('Preview generation failed. Check logs for details.', 'error')
      }
    },
    onError: (err) => {
      store.jobStatus = 'failed'
      store.generating = false
      store.showSnackbar('Generation error: ' + (err.message || 'Unknown error'), 'error')
    }
  })
}

// ── Buy high-res ──────────────────────────────────────────────────────────────
async function buyHighRes() {
  if (!currentUser.value) {
    pendingActionAfterSignIn = buyHighRes
    showSignInDialog.value = true
    return
  }
  checkoutLoading.value = true
  try {
    const token = await getIdToken()

    // Determine position data based on the input mode
    let body
    if (inputMode.value === 'map' && mapPosition.value) {
      body = {
        center_lat: mapPosition.value.lat,
        center_lng: mapPosition.value.lng,
        zoom: mapZoom.value,
        country: store.formData.subtitle || store.formData.country,
        theme: store.formData.theme,
        orientation: store.formData.orientation,
        title: store.formData.title || undefined,
        titlePos: store.formData.titlePos,
        fullBorders: store.formData.fullBorders,
      }
    } else {
      // For city/coords mode, still use /api/payment/initiate with coords
      const isCoords = inputMode.value === 'coords'
      const coordStr = isCoords
        ? store.formData.coords
        : null
      // Parse or use default zoom 12 for city mode (backend will use stored distance)
      const [lat, lng] = coordStr
        ? coordStr.split(',').map(Number)
        : [48.8566, 2.3522]
      body = {
        center_lat: lat,
        center_lng: lng,
        zoom: 12,
        country: store.formData.subtitle || store.formData.country,
        theme: store.formData.theme,
        orientation: store.formData.orientation,
        title: store.formData.title || undefined,
        titlePos: store.formData.titlePos,
        fullBorders: store.formData.fullBorders,
      }
    }

    const { url, requestId } = await apiService.initiateCheckout(body, token)
    currentRequestId.value = requestId
    window.location.href = url
  } catch (err) {
    store.showSnackbar(err.response?.data?.error || 'Failed to create checkout', 'error')
  } finally {
    checkoutLoading.value = false
  }
}

// ── Handle Stripe return ──────────────────────────────────────────────────────
async function handlePaymentReturn() {
  const payment = route.query.payment
  const requestId = route.query.requestId
  if (!payment || !requestId) return

  currentRequestId.value = requestId

  if (payment === 'success') {
    store.showSnackbar('Payment confirmed! Generating your 300 DPI poster…', 'success')
    previewJobDone.value = true  // show the right phase while final renders
    await startFinalRender(requestId)
  } else if (payment === 'cancelled') {
    store.showSnackbar('Payment cancelled. Your free preview is still available.', 'info')
    previewJobDone.value = true
  }
}

async function startFinalRender(requestId) {
  if (!currentUser.value) {
    store.showSnackbar('Please sign in to download your poster.', 'warning')
    showSignInDialog.value = true
    pendingActionAfterSignIn = () => startFinalRender(requestId)
    return
  }

  generatingFinal.value = true
  store.showTerminal = true
  store.logs = []

  try {
    const token = await getIdToken()
    const response = await apiService.renderFinal(requestId, token)

    sseService.connect(apiService.getLogsUrl(response.jobId), {
      onMessage: (log) => { store.logs.push(log) },
      onComplete: (data) => {
        generatingFinal.value = false
        if (data.status === 'completed' && data.result) {
          highResResult.value = data.result
          store.showSnackbar('High-res poster ready! 🎉', 'success')
        } else {
          store.showSnackbar('High-res generation failed. Please contact support.', 'error')
        }
      },
      onError: (err) => {
        generatingFinal.value = false
        store.showSnackbar('Render error: ' + (err.message || 'Unknown error'), 'error')
      }
    })
  } catch (err) {
    generatingFinal.value = false
    store.showSnackbar(err.response?.data?.error || 'Failed to start high-res render', 'error')
  }
}

// ── Patch store's connectToLogs to also set previewJobDone ───────────────────
// We watch store.jobStatus so city/coords "Generate sample" also triggers Phase 2
watch(() => store.jobStatus, (status) => {
  if (status === 'completed' && inputMode.value !== 'map') {
    previewJobDone.value = true
  }
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  handlePaymentReturn()
})
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #F7F7F7;
  padding-bottom: 0;
}

.create-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 0;
}

/* Header */
.create-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.back-btn {
  color: #717171 !important;
}

.create-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #222;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.create-subtitle {
  font-size: 0.9rem;
  color: #717171;
  margin: 0;
}

/* Form sections */
.form-section {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 16px;
  border: 1px solid #EBEBEB;
}

.form-section__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.form-section__num {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #FF385C;
  background: #fff5f6;
  border: 1px solid #ffd5da;
  border-radius: 8px;
  padding: 4px 8px;
  white-space: nowrap;
  margin-top: 2px;
}

.form-section__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 2px;
}

.form-section__subtitle {
  font-size: 0.82rem;
  color: #888;
  margin: 0;
}

/* Toggle pills */
.coord-toggle {
  display: inline-flex;
  gap: 6px;
  background: #F7F7F7;
  border-radius: 100px;
  padding: 4px;
  flex-wrap: wrap;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: none;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: #717171;
  transition: background 0.15s, color 0.15s;
}

.toggle-pill--active {
  background: #fff;
  color: #222;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.fields-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.fields-row > * {
  min-width: 140px;
}

/* Map mode */
.map-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-position-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #00A699;
  font-weight: 500;
}

/* Compact horizontal theme strip inside map mode */
.map-theme-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 2px;
  border-top: 1px solid #F0F0F0;
}

.map-theme-strip__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
}

.map-theme-strip__scroller {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

.map-theme-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 8px;
  border: 2px solid #EBEBEB;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.12s, transform 0.12s;
  min-width: 58px;
}

.map-theme-pill:hover {
  border-color: #ccc;
  transform: translateY(-1px);
}

.map-theme-pill--active {
  border-color: #FF385C !important;
  background: #fff5f6;
}

.map-theme-pill__swatch {
  width: 34px;
  height: 22px;
  border-radius: 5px;
  display: block;
}

.map-theme-pill__name {
  font-size: 0.62rem;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 58px;
  text-align: center;
}

/* Poster text fields row (always visible) */
.poster-text-fields {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #F0F0F0;
}

.poster-text-fields > * {
  flex: 1 1 180px;
  min-width: 140px;
}

/* Options */
.option-block {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #F0F0F0;
}

.option-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.option-block--inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.option-block__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 10px;
}

.option-block__label strong {
  color: #FF385C;
}

.option-block__hint {
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 6px;
}

/* Orientation */
.orientation-toggle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.orient-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  border: 2px solid #EBEBEB;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-size: 0.73rem;
  font-weight: 600;
  color: #717171;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  min-width: 72px;
  flex: 1 1 72px;
}

.orient-btn:hover {
  border-color: #ccc;
}

.orient-btn--active {
  border-color: #FF385C;
  color: #FF385C;
  background: #fff5f6;
}

.orient-btn__shape {
  display: block;
  flex-shrink: 0;
}

.orient-btn__ratio {
  font-size: 0.62rem;
  font-weight: 500;
  color: #aaa;
  letter-spacing: 0.02em;
}

.orient-btn--active .orient-btn__ratio {
  color: #FF385C;
  opacity: 0.75;
}

/* Title position grid */
.title-pos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.pos-btn {
  padding: 8px 4px;
  border: 2px solid #EBEBEB;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 500;
  color: #717171;
  text-align: center;
  transition: border-color 0.15s, color 0.15s;
}

.pos-btn--active {
  border-color: #FF385C;
  color: #FF385C;
  background: #fff5f6;
}

/* Output */
.output-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.poster-output {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #EBEBEB;
  overflow: hidden;
  position: relative;
}

.poster-output--highres {
  border-color: #00A699;
  box-shadow: 0 0 0 2px rgba(0, 166, 153, 0.2);
}

.poster-output__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 8px 16px;
  background: #fff8e7;
  color: #b8860b;
  border-bottom: 1px solid #f0e0b0;
  width: 100%;
  box-sizing: border-box;
}

.poster-output__badge--success {
  background: #e6f9f7;
  color: #00796b;
  border-color: #b2dfdb;
}

.poster-img {
  width: 100%;
  display: block;
}

/* Sticky bar */
.sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid #EBEBEB;
  z-index: 100;
  padding: 12px 24px;
}

.sticky-bar__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.sticky-bar__status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #717171;
  min-width: 130px;
}

.generate-btn {
  font-weight: 700;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.phase2-actions,
.phase3-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
