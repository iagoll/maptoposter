<template>
  <v-card elevation="2">
    <v-card-title class="text-h5">
      <v-icon class="mr-2">mdi-cog</v-icon>
      Configuration
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="form" v-model="store.formValid">
        <!-- Coordinates Toggle -->
        <v-switch
          v-model="store.useCoordinates"
          color="primary"
          label="Use Direct Coordinates"
          hint="Bypass city lookup with lat/lng"
          persistent-hint
          class="mb-4"
        ></v-switch>

        <!-- City Input (conditional) -->
        <v-text-field
          v-if="!store.useCoordinates"
          v-model="store.formData.city"
          label="City"
          prepend-icon="mdi-city"
          :rules="[v => !store.useCoordinates ? !!v || 'City is required' : true]"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-text-field>

        <!-- Coordinates Input (conditional) -->
        <v-text-field
          v-if="store.useCoordinates"
          v-model="store.formData.coords"
          label="Coordinates"
          prepend-icon="mdi-crosshairs-gps"
          placeholder="40.7128,-74.0060"
          hint="Format: latitude,longitude"
          persistent-hint
          :rules="coordsRules"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-text-field>

        <!-- Country Input -->
        <v-text-field
          v-model="store.formData.country"
          label="Country"
          prepend-icon="mdi-flag"
          :rules="[v => !!v || 'Country is required']"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-text-field>

        <!-- Custom Title -->
        <v-text-field
          v-model="store.formData.title"
          label="Custom Title (Optional)"
          prepend-icon="mdi-format-title"
          hint="Override city name on poster"
          persistent-hint
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-text-field>

        <!-- Theme Select -->
        <v-select
          v-model="store.formData.theme"
          :items="store.themes"
          item-title="name"
          item-value="id"
          label="Theme"
          prepend-icon="mdi-palette"
          variant="outlined"
          density="comfortable"
          :loading="store.loadingThemes"
          class="mb-2"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props">
              <template v-slot:subtitle>
                {{ item.raw.description }}
              </template>
            </v-list-item>
          </template>
        </v-select>

        <!-- Distance Slider -->
        <div class="mb-4">
          <v-label class="text-subtitle-2 mb-2 d-flex align-center">
            <v-icon size="small" class="mr-2">mdi-map-marker-distance</v-icon>
            Distance: {{ store.formData.distance.toLocaleString() }}m
          </v-label>
          <v-slider
            v-model="store.formData.distance"
            :min="4000"
            :max="50000"
            :step="1000"
            thumb-label
            color="primary"
            class="mt-2"
          >
            <template v-slot:thumb-label="{ modelValue }">
              {{ (modelValue / 1000).toFixed(0) }}km
            </template>
          </v-slider>
          <div class="text-caption text-medium-emphasis">
            Small (4-8km) • Medium (8-20km) • Large (20-50km)
          </div>
        </div>

        <!-- Orientation Toggle -->
        <div class="mb-4">
          <v-label class="text-subtitle-2 mb-2 d-flex align-center">
            <v-icon size="small" class="mr-2">mdi-crop-portrait</v-icon>
            Orientation
          </v-label>
          <v-btn-toggle
            v-model="store.formData.orientation"
            mandatory
            variant="outlined"
            divided
            color="primary"
            class="w-100"
          >
            <v-btn value="vertical" class="flex-grow-1">
              <v-icon>mdi-crop-portrait</v-icon>
              <span class="ml-2">Vertical</span>
            </v-btn>
            <v-btn value="horizontal" class="flex-grow-1">
              <v-icon>mdi-crop-landscape</v-icon>
              <span class="ml-2">Horizontal</span>
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Title Position -->
        <v-select
          v-model="store.formData.titlePos"
          :items="titlePositions"
          label="Title Position"
          prepend-icon="mdi-format-align-center"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        ></v-select>

        <!-- Advanced Options -->
        <v-expansion-panels variant="accordion" class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-tune</v-icon>
              Advanced Options
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-checkbox
                v-model="store.formData.fullBorders"
                label="Full Borders (No Gradient Fade)"
                density="comfortable"
                hide-details
              ></v-checkbox>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Generate Button -->
        <v-btn
          block
          size="large"
          color="primary"
          :loading="store.generating"
          :disabled="!store.formValid || store.generating"
          @click="store.generatePoster()"
          class="mb-2"
        >
          <v-icon left>mdi-creation</v-icon>
          Generate Poster
        </v-btn>

        <!-- Quick Actions -->
        <div class="d-flex gap-2">
          <v-btn
            variant="outlined"
            size="small"
            @click="loadExample"
            :disabled="store.generating"
            class="flex-grow-1"
          >
            <v-icon size="small">mdi-lightbulb</v-icon>
            <span class="ml-1">Example</span>
          </v-btn>
          <v-btn
            variant="outlined"
            size="small"
            @click="store.resetForm()"
            :disabled="store.generating"
            class="flex-grow-1"
          >
            <v-icon size="small">mdi-refresh</v-icon>
            <span class="ml-1">Reset</span>
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { usePosterStore } from '../store/posterStore'
import { validateCoordinates, titlePositions, getRandomExample } from '../services/utils'

const store = usePosterStore()

const coordsRules = [
  v => {
    if (!store.useCoordinates) return true
    if (!v) return 'Coordinates are required'
    return validateCoordinates(v) || 'Format: latitude,longitude (e.g., 40.7128,-74.0060)'
  }
]

const loadExample = () => {
  const example = getRandomExample()
  Object.assign(store.formData, example)
  store.useCoordinates = false
  store.formData.title = ''
  store.showSnackbar(`Loaded example: ${example.city}, ${example.country}`, 'info')
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
