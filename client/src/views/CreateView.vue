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
          Back
        </v-btn>
        <div>
          <h1 class="create-title">Create your poster</h1>
          <p class="create-subtitle">Fill in the details below and generate a sample preview.</p>
        </div>
        <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-lightbulb-outline"
          @click="loadExample"
          color="secondary"
        >
          Load example
        </v-btn>
      </div>

      <v-form ref="form" v-model="store.formValid">

        <!-- ─── SECTION 1: Location ─── -->
        <div class="form-section">
          <div class="form-section__header">
            <span class="form-section__num">01</span>
            <div>
              <h2 class="form-section__title">Location</h2>
              <p class="form-section__subtitle">Enter a city name or use exact coordinates.</p>
            </div>
          </div>

          <!-- Coordinates toggle -->
          <div class="coord-toggle mb-4">
            <button
              type="button"
              class="toggle-pill"
              :class="{ 'toggle-pill--active': !store.useCoordinates }"
              @click="store.useCoordinates = false"
            >
              <v-icon size="14">mdi-city</v-icon> City name
            </button>
            <button
              type="button"
              class="toggle-pill"
              :class="{ 'toggle-pill--active': store.useCoordinates }"
              @click="store.useCoordinates = true"
            >
              <v-icon size="14">mdi-crosshairs-gps</v-icon> Coordinates
            </button>
          </div>

          <div v-if="!store.useCoordinates" class="fields-row">
            <v-text-field
              v-model="store.formData.city"
              label="City"
              placeholder="e.g. Paris"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || 'City is required']"
              hide-details="auto"
              class="flex-grow-1"
            />
            <v-text-field
              v-model="store.formData.country"
              label="Country"
              placeholder="e.g. France"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || 'Country is required']"
              hide-details="auto"
              class="flex-grow-1"
            />
          </div>

          <div v-else class="fields-row">
            <v-text-field
              v-model="store.formData.coords"
              label="Coordinates"
              placeholder="48.8566, 2.3522"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="coordsRules"
              hide-details="auto"
              hint="lat, lon"
              persistent-hint
              class="flex-grow-1"
            />
            <v-text-field
              v-model="store.formData.country"
              label="Country"
              placeholder="e.g. France"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              :rules="[v => !!v || 'Country is required']"
              hide-details="auto"
              class="flex-grow-1"
            />
          </div>

          <v-text-field
            v-model="store.formData.title"
            label="Custom title (optional)"
            placeholder="Leave blank to use the city name"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
            class="mt-3"
            prepend-inner-icon="mdi-format-title"
          />
        </div>

        <!-- ─── SECTION 2: Theme ─── -->
        <div class="form-section">
          <div class="form-section__header">
            <span class="form-section__num">02</span>
            <div>
              <h2 class="form-section__title">Theme</h2>
              <p class="form-section__subtitle">Choose the visual style for your poster.</p>
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
              <h2 class="form-section__title">Options</h2>
              <p class="form-section__subtitle">Customise size, layout and title placement.</p>
            </div>
          </div>

          <!-- Distance -->
          <div class="option-block">
            <div class="option-block__label">
              <span>Map radius</span>
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
              Small (4–8 km) · Medium (8–20 km) · Large (20–50 km)
            </div>
          </div>

          <!-- Orientation -->
          <div class="option-block">
            <div class="option-block__label"><span>Orientation</span></div>
            <div class="orientation-toggle">
              <button
                type="button"
                class="orient-btn"
                :class="{ 'orient-btn--active': store.formData.orientation === 'vertical' }"
                @click="store.formData.orientation = 'vertical'"
              >
                <v-icon size="22">mdi-crop-portrait</v-icon>
                <span>Portrait</span>
              </button>
              <button
                type="button"
                class="orient-btn"
                :class="{ 'orient-btn--active': store.formData.orientation === 'horizontal' }"
                @click="store.formData.orientation = 'horizontal'"
              >
                <v-icon size="22">mdi-crop-landscape</v-icon>
                <span>Landscape</span>
              </button>
            </div>
          </div>

          <!-- Title position -->
          <div class="option-block">
            <div class="option-block__label"><span>Title position</span></div>
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
              <div class="option-block__label"><span>Full borders</span></div>
              <div class="option-block__hint" style="margin-top: 2px;">
                Removes the gradient fade on the edges of the map.
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
        <div v-if="store.generatedPoster" class="poster-output">
          <PosterDisplay />
        </div>
      </div>

      <!-- spacer so sticky bar doesn't cover content -->
      <div style="height: 88px;" />
    </div>

    <!-- ─── STICKY GENERATE BAR ─── -->
    <div class="sticky-bar">
      <div class="sticky-bar__inner">
        <div v-if="store.jobStatus === 'completed'" class="sticky-bar__status">
          <v-icon color="success" size="18">mdi-check-circle</v-icon>
          <span>Poster ready!</span>
        </div>
        <div v-else-if="store.generating" class="sticky-bar__status">
          <v-progress-circular indeterminate size="16" width="2" color="white" />
          <span>Generating…</span>
        </div>
        <div v-else class="sticky-bar__status" style="visibility: hidden;">
          <span>—</span>
        </div>

        <v-btn
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
          {{ store.generating ? 'Generating…' : 'Generate sample' }}
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="secondary"
          :disabled="store.generating"
          @click="store.resetForm()"
        >
          Reset
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePosterStore } from '../store/posterStore'
import ThemeGrid from '../components/ThemeGrid.vue'
import TerminalLogs from '../components/TerminalLogs.vue'
import PosterDisplay from '../components/PosterDisplay.vue'
import { titlePositions, getRandomExample, validateCoordinates } from '../services/utils'

const store = usePosterStore()
const form = ref(null)

const coordsRules = [
  v => {
    if (!store.useCoordinates) return true
    if (!v) return 'Coordinates are required'
    return validateCoordinates(v) || 'Format: lat, lon (e.g. 48.8566, 2.3522)'
  }
]

const loadExample = () => {
  const example = getRandomExample()
  Object.assign(store.formData, example)
  store.useCoordinates = false
  store.formData.title = ''
  store.showSnackbar(`Loaded: ${example.city}, ${example.country}`, 'info')
}
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

/* Coordinate toggle pills */
.coord-toggle {
  display: inline-flex;
  gap: 6px;
  background: #F7F7F7;
  border-radius: 100px;
  padding: 4px;
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
  gap: 10px;
}

.orient-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 24px;
  border: 2px solid #EBEBEB;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: #717171;
  transition: border-color 0.15s, color 0.15s;
  min-width: 90px;
}

.orient-btn--active {
  border-color: #FF385C;
  color: #FF385C;
  background: #fff5f6;
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
}

/* Sticky generate bar */
.sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
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
  min-width: 120px;
}

.generate-btn {
  font-weight: 700;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}
</style>
