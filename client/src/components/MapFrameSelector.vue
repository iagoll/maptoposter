<template>
  <div class="map-frame-selector">
    <!-- Map container — height adapts to orientation -->
    <div
      ref="mapContainer"
      class="map-container"
      :style="{ height: `${mapContainerH}px` }"
    >
      <!-- Colour wash from selected theme (above tiles, pointer-events none) -->
      <div
        class="map-theme-tint"
        :style="mapThemeTintStyle"
        aria-hidden="true"
      />
      <!-- Vignette panels (4 absolutely-positioned rects) -->
      <div class="vignette" :style="vigTopStyle" />
      <div class="vignette" :style="vigBottomStyle" />
      <div class="vignette" :style="vigLeftStyle" />
      <div class="vignette" :style="vigRightStyle" />

      <!-- Poster frame -->
      <div class="poster-frame" :style="frameStyle">
        <!-- Theme mini-preview bar at top of frame -->
        <div v-if="themeColors" class="theme-bar">
          <span class="theme-bar__swatch" :style="{ background: themeColors.bg }" />
          <span class="theme-bar__swatch" :style="{ background: themeColors.road }" />
          <span class="theme-bar__swatch" :style="{ background: themeColors.water || themeColors.bg }" />
          <span class="theme-bar__name">{{ themeColors.name }}</span>
        </div>
        <!-- Orientation label at bottom of frame -->
        <span class="frame-label">{{ orientationLabel }}</span>
      </div>

      <!-- Zoom/pan hint -->
      <div class="map-hint">Pan &amp; zoom · frame stays centred</div>
    </div>

    <!-- Coordinate readout -->
    <div class="map-readout">
      <div class="map-readout__item">
        <span class="map-readout__label">Lat</span>
        <span class="map-readout__value">{{ displayLat }}</span>
      </div>
      <div class="map-readout__item">
        <span class="map-readout__label">Lng</span>
        <span class="map-readout__value">{{ displayLng }}</span>
      </div>
      <div class="map-readout__item">
        <span class="map-readout__label">Zoom</span>
        <span class="map-readout__value">{{ currentZoom }}</span>
      </div>
      <div class="map-readout__item">
        <span class="map-readout__label">Radius</span>
        <span class="map-readout__value">{{ formattedDistance }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Per-theme CSS filters applied to the Leaflet tile layer ───────────────────
// These transform the standard OSM raster tiles to approximate each theme's
// palette. The approach: start from greyscale/inverted and layer hue-rotates.
const THEME_FILTERS = {
  aurora:          'invert(100%) sepia(80%) hue-rotate(140deg) saturate(500%) brightness(45%)',
  autumn:          'sepia(35%) saturate(130%) hue-rotate(348deg) brightness(100%)',
  blueprint:       'invert(100%) sepia(100%) hue-rotate(200deg) saturate(500%) brightness(65%)',
  contrast_zones:  'grayscale(100%) contrast(145%) brightness(108%)',
  copper_patina:   'invert(100%) sepia(100%) hue-rotate(130deg) saturate(320%) brightness(50%)',
  feature_based:   'none',
  forest:          'invert(100%) sepia(100%) hue-rotate(100deg) saturate(400%) brightness(44%)',
  ghost:           'grayscale(75%) brightness(118%) contrast(80%)',
  gradient_roads:  'sepia(10%) hue-rotate(215deg) saturate(130%)',
  japanese_ink:    'sepia(28%) contrast(112%) brightness(104%)',
  lava:            'invert(100%) sepia(100%) hue-rotate(12deg) saturate(550%) brightness(42%)',
  midnight_blue:   'invert(100%) sepia(90%) hue-rotate(185deg) saturate(280%) brightness(52%)',
  monochrome_blue: 'sepia(60%) hue-rotate(195deg) saturate(260%) brightness(108%)',
  neon_cyberpunk:  'invert(100%) sepia(100%) hue-rotate(270deg) saturate(650%) brightness(68%)',
  noir:            'grayscale(100%) invert(100%)',
  ocean:           'invert(100%) sepia(100%) hue-rotate(175deg) saturate(420%) brightness(54%)',
  papyro:          'sepia(80%) saturate(200%) hue-rotate(18deg) brightness(80%)',
  pastel_dream:    'sepia(20%) hue-rotate(285deg) saturate(55%) brightness(110%)',
  rose_gold:       'sepia(45%) hue-rotate(315deg) saturate(110%) brightness(110%)',
  sunset:          'invert(100%) sepia(100%) hue-rotate(28deg) saturate(420%) brightness(44%)',
  terracotta:      'sepia(55%) saturate(155%) hue-rotate(350deg) brightness(94%)',
  warm_beige:      'sepia(42%) saturate(85%) brightness(103%)',
  widescreen:      'none',
};

/** Build rgba() from #RGB / #RRGGBB for theme overlays */
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,0)`;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return `rgba(0,0,0,0)`;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return `rgba(0,0,0,0)`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// ── Props ──────────────────────────────────────────────────────────────────────
const props = defineProps({
  orientation: {
    type: String,
    default: 'vertical',
    validator: v => ['vertical', 'horizontal', 'square', 'mobile', 'banner'].includes(v),
  },
  initialLat:  { type: Number, default: 48.8566 },
  initialLng:  { type: Number, default: 2.3522 },
  initialZoom: { type: Number, default: 12 },
  themeColors: { type: Object, default: null },
});

const emit = defineEmits(['position-changed', 'position-confirmed']);

// ── Orientation config ─────────────────────────────────────────────────────────
// aspect = width / height for the poster
const ORIENTATION = {
  vertical:   { aspect: 3 / 4,       mapH: 420, label: 'Portrait  3:4' },
  horizontal: { aspect: 4 / 3,       mapH: 380, label: 'Landscape  4:3' },
  square:     { aspect: 1,           mapH: 400, label: 'Square  1:1' },
  mobile:     { aspect: 9 / 19.5,    mapH: 460, label: 'Mobile  9:19.5' },
  banner:     { aspect: 3,           mapH: 300, label: 'Banner  3:1' },
  widescreen: { aspect: 16 / 9,      mapH: 360, label: 'Widescreen  16:9' },
}

const cfg = computed(() => ORIENTATION[props.orientation] || ORIENTATION.vertical)

const mapContainerH = computed(() => cfg.value.mapH)
const orientationLabel = computed(() => cfg.value.label)

// ── Container width (tracked via ResizeObserver) ───────────────────────────────
const mapContainer   = ref(null);
const containerWidth = ref(700);   // safe default matching max-width layout
let resizeObserver   = null;

// ── Poster frame geometry ──────────────────────────────────────────────────────
// The frame occupies at most 82 % of the container width AND 80 % of its height.
const MAX_W_RATIO = 0.82;
const MAX_H_RATIO = 0.80;

const frameW = computed(() => {
  const maxW = containerWidth.value * MAX_W_RATIO;
  const maxH = mapContainerH.value  * MAX_H_RATIO;
  const fromH = maxH * cfg.value.aspect;
  return Math.min(maxW, fromH);
});

const frameH = computed(() => frameW.value / cfg.value.aspect);

const frameTop  = computed(() => (mapContainerH.value - frameH.value) / 2);
const frameLeft = computed(() => (containerWidth.value - frameW.value) / 2);

// The vignette colour mirrors the selected theme's background.
// Falls back to a neutral dark if no theme is loaded yet.
const vigBg = computed(() =>
  props.themeColors?.bg ? `${props.themeColors.bg}ee` : 'rgba(0,0,0,0.42)'
);

const frameStyle = computed(() => ({
  position:  'absolute',
  left:      `${frameLeft.value}px`,
  top:       `${frameTop.value}px`,
  width:     `${frameW.value}px`,
  height:    `${frameH.value}px`,
  zIndex:    450,
  border:    `2px solid ${props.themeColors?.road || 'rgba(255,56,92,0.9)'}`,
  borderRadius: '4px',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  background: props.themeColors ? `${props.themeColors.bg}22` : 'transparent',
  transition: 'left .3s ease, top .3s ease, width .3s ease, height .3s ease',
}));

const vigTopStyle = computed(() => ({
  position: 'absolute', top: 0, left: 0, right: 0,
  height:   `${frameTop.value}px`,
  background: vigBg.value, zIndex: 440, pointerEvents: 'none',
  transition: 'background 0.4s ease',
}));
const vigBottomStyle = computed(() => ({
  position: 'absolute',
  top:      `${frameTop.value + frameH.value}px`,
  left: 0, right: 0, bottom: 0,
  background: vigBg.value, zIndex: 440, pointerEvents: 'none',
  transition: 'background 0.4s ease',
}));
const vigLeftStyle = computed(() => ({
  position: 'absolute',
  top:      `${frameTop.value}px`,
  height:   `${frameH.value}px`,
  left: 0,
  width:    `${frameLeft.value}px`,
  background: vigBg.value, zIndex: 440, pointerEvents: 'none',
  transition: 'background 0.4s ease',
}));
const vigRightStyle = computed(() => ({
  position: 'absolute',
  top:      `${frameTop.value}px`,
  height:   `${frameH.value}px`,
  right: 0,
  width:    `${frameLeft.value}px`,
  background: vigBg.value, zIndex: 440, pointerEvents: 'none',
  transition: 'background 0.4s ease',
}));

// Wash OSM tiles toward the poster palette (bg / water / road) — pairs with THEME_FILTERS
const mapThemeTintStyle = computed(() => {
  if (!props.themeColors) {
    return { display: 'none' };
  }
  const { bg, road, water } = props.themeColors;
  const w = water || bg;
  const rd = road || bg;
  return {
    position: 'absolute',
    inset: 0,
    zIndex: 320,
    pointerEvents: 'none',
    background: [
      `radial-gradient(ellipse 92% 70% at 50% 46%, ${hexToRgba(rd, 0.16)} 0%, transparent 62%)`,
      `linear-gradient(185deg, ${hexToRgba(bg, 0.24)} 0%, transparent 38%, transparent 62%, ${hexToRgba(w, 0.26)} 100%)`,
    ].join(', '),
    mixBlendMode: 'soft-light',
    transition: 'background 0.45s ease, opacity 0.35s ease',
  };
});

// ── Map state ──────────────────────────────────────────────────────────────────
let leafletMap = null;

const currentLat  = ref(props.initialLat);
const currentLng  = ref(props.initialLng);
const currentZoom = ref(props.initialZoom);

const displayLat = computed(() => currentLat.value.toFixed(5));
const displayLng = computed(() => currentLng.value.toFixed(5));

// Use the frame width (in pixels) as the reference dimension for distance.
function zoomToDistance(zoom, lat, frameWidthPx) {
  const EARTH_CIRCUMFERENCE = 40075016.686;
  const mpp =
    (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) /
    Math.pow(2, zoom + 8);
  return Math.max(500, Math.min(100000, Math.round(mpp * frameWidthPx / 2)));
}

const currentDistance = computed(() =>
  zoomToDistance(currentZoom.value, currentLat.value, frameW.value)
);

const formattedDistance = computed(() => {
  const d = currentDistance.value;
  return d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${d} m`;
});

function applyMapTheme() {
  if (!leafletMap) return;
  const themeId = props.themeColors?.id;
  const pane = leafletMap.getPanes().tilePane;
  if (pane) pane.style.filter = THEME_FILTERS[themeId] || 'none';
  const el = leafletMap.getContainer();
  el.style.backgroundColor = props.themeColors?.bg || '#cbd5e0';
}

function syncCenter() {
  if (!leafletMap) return;
  const center = leafletMap.getCenter();
  currentLat.value  = center.lat;
  currentLng.value  = center.lng;
  currentZoom.value = leafletMap.getZoom();

  emit('position-changed', {
    lat: center.lat,
    lng: center.lng,
    zoom: leafletMap.getZoom(),
    distance: currentDistance.value,
  });
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick();

  // Track container width for accurate banner/horizontal sizing
  resizeObserver = new ResizeObserver(entries => {
    containerWidth.value = entries[0].contentRect.width;
    leafletMap?.invalidateSize();
  });
  resizeObserver.observe(mapContainer.value);
  containerWidth.value = mapContainer.value.getBoundingClientRect().width;

  leafletMap = L.map(mapContainer.value, {
    center:           [props.initialLat, props.initialLng],
    zoom:             props.initialZoom,
    zoomControl:      true,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(leafletMap);

  leafletMap.on('moveend', syncCenter);
  leafletMap.on('zoomend', syncCenter);

  // Fixes blank/grey tiles when container was hidden at mount time
  setTimeout(() => {
    leafletMap?.invalidateSize();
    syncCenter();
    applyMapTheme();
  }, 150);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (leafletMap) {
    leafletMap.off('moveend', syncCenter);
    leafletMap.off('zoomend', syncCenter);
    leafletMap.remove();
    leafletMap = null;
  }
});

// Re-centre when parent pushes new coordinates
watch(
  () => [props.initialLat, props.initialLng],
  ([lat, lng]) => {
    if (leafletMap && (lat !== currentLat.value || lng !== currentLng.value)) {
      leafletMap.setView([lat, lng], props.initialZoom, { animate: true });
    }
  }
);

// Re-layout when orientation changes (map container height changes)
watch(
  () => props.orientation,
  async () => {
    await nextTick();
    leafletMap?.invalidateSize();
  }
);

// Tile filter + Leaflet base colour when the selected theme changes
watch(
  () => props.themeColors,
  () => applyMapTheme(),
  { deep: true },
);
</script>

<style scoped>
.map-frame-selector {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.map-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  transition: height 0.3s ease;
  isolation: isolate;
}

.map-theme-tint {
  border-radius: inherit;
}

/* Vignette panels */
.vignette {
  position: absolute;
  transition: all 0.3s ease;
}

/* Poster frame (geometry from :style) */
.poster-frame {
  overflow: hidden;
}

.frame-label {
  position: absolute;
  bottom: 7px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 56, 92, 0.88);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  user-select: none;
}

/* Theme colour bar at top of frame */
.theme-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 2px 2px 0 0;
}

.theme-bar__swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.theme-bar__name {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

/* Pan hint overlay */
.map-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 460;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 3px 9px;
  border-radius: 20px;
  pointer-events: none;
  user-select: none;
}

/* Coordinate readout */
.map-readout {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 16px;
  background: #f9f9f9;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.map-readout__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.map-readout__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #888;
}

.map-readout__value {
  font-size: 13px;
  font-weight: 500;
  color: #222;
  font-variant-numeric: tabular-nums;
}
</style>
