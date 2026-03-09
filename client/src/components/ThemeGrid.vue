<template>
  <div class="theme-grid">
    <div
      v-for="theme in themes"
      :key="theme.id"
      class="theme-card"
      :class="{ 'theme-card--selected': modelValue === theme.id }"
      @click="emit('update:modelValue', theme.id)"
      role="radio"
      :aria-checked="modelValue === theme.id"
    >
      <!-- colour swatch -->
      <div class="theme-card__swatch" :style="swatchStyle(theme.id)">
        <v-icon v-if="modelValue === theme.id" color="white" size="18">mdi-check</v-icon>
      </div>

      <!-- info -->
      <div class="theme-card__body">
        <span class="theme-card__name">{{ theme.name }}</span>
        <span class="theme-card__desc">{{ theme.description }}</span>
      </div>
    </div>

    <!-- loading skeleton -->
    <template v-if="loading">
      <div v-for="n in 6" :key="'sk-' + n" class="theme-card theme-card--skeleton">
        <div class="theme-card__swatch" style="background: #E5E5E5" />
        <div class="theme-card__body">
          <div class="skeleton-line skeleton-line--short" />
          <div class="skeleton-line" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  themes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// Map theme id → a representative swatch palette
const swatchPalettes = {
  noir:             { bg: '#0a0a0a', road: '#ffffff' },
  midnight_blue:    { bg: '#0d1b2e', road: '#c9a84c' },
  blueprint:        { bg: '#1A3A5C', road: '#a8d4f5' },
  neon_cyberpunk:   { bg: '#0d0d1a', road: '#ff2dce' },
  japanese_ink:     { bg: '#f5f0e8', road: '#1a1a1a' },
  pastel_dream:     { bg: '#fef6f0', road: '#b8a0c8' },
  warm_beige:       { bg: '#f2e8d8', road: '#8b5e3c' },
  ocean:            { bg: '#0a2a3c', road: '#4dd0e1' },
  forest:           { bg: '#1a2e1a', road: '#6abf69' },
  terracotta:       { bg: '#f5e6d3', road: '#c06030' },
  sunset:           { bg: '#1a0a00', road: '#ff8c42' },
  autumn:           { bg: '#fbf7f0', road: '#b8450a' },
  copper_patina:    { bg: '#1a2e28', road: '#7dbfb0' },
  monochrome_blue:  { bg: '#e8f0f8', road: '#1a4080' },
  contrast_zones:   { bg: '#f0f0f0', road: '#111111' },
  gradient_roads:   { bg: '#ffffff', road: '#3366cc' },
  feature_based:    { bg: '#ffffff', road: '#333333' },
  lava:             { bg: '#090909', road: '#ff5500' },
  rose_gold:        { bg: '#f8eeea', road: '#a03860' },
  aurora:           { bg: '#04101c', road: '#00ffb0' },
  papyro:           { bg: '#c8853a', road: '#1a0a2e' },
  ghost:            { bg: '#f5f5f5', road: '#4a4a4a' },
}

const swatchStyle = (id) => {
  const p = swatchPalettes[id]
  if (!p) return { background: '#dddddd' }
  return {
    background: `linear-gradient(135deg, ${p.bg} 60%, ${p.road} 100%)`,
  }
}
</script>

<style scoped>
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 2px solid #EBEBEB;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.theme-card:hover {
  border-color: #d0d0d0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.theme-card--selected {
  border-color: #FF385C !important;
  box-shadow: 0 0 0 1px #FF385C, 0 4px 16px rgba(255, 56, 92, 0.15) !important;
}

.theme-card__swatch {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.theme-card__body {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.theme-card__name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-card__desc {
  font-size: 0.68rem;
  color: #888;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* skeleton */
.theme-card--skeleton {
  pointer-events: none;
}

.skeleton-line {
  height: 8px;
  border-radius: 4px;
  background: #E5E5E5;
  width: 100%;
  margin-bottom: 4px;
}

.skeleton-line--short {
  width: 60%;
}
</style>
