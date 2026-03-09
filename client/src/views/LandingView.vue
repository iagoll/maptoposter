<template>
  <div class="landing">

    <!-- ─── HERO ─── -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">
          <v-icon size="14" color="primary">mdi-map-marker</v-icon>
          <span>22 themes · Any city in the world</span>
        </div>
        <h1 class="hero-title">Turn any city<br>into wall art.</h1>
        <p class="hero-subtitle">
          Generate beautiful, print-quality map posters from OpenStreetMap data.
          Pick your city, choose a style, and download in seconds.
        </p>
        <div class="hero-actions">
          <v-btn
            color="primary"
            size="x-large"
            rounded="xl"
            elevation="0"
            to="/create"
            class="hero-cta"
          >
            Start creating
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn
            variant="outlined"
            size="x-large"
            rounded="xl"
            color="secondary"
            to="/gallery"
            class="hero-cta-secondary"
          >
            See examples
          </v-btn>
        </div>
      </div>

      <!-- decorative background blobs -->
      <div class="hero-blob hero-blob--1" />
      <div class="hero-blob hero-blob--2" />
    </section>

    <!-- ─── EXAMPLE STRIP ─── -->
    <section class="section examples-section">
      <div class="section-inner">
        <p class="section-eyebrow">Made with MapToPoster</p>
        <h2 class="section-title">Cities from around the world</h2>

        <div class="examples-grid">
          <div
            v-for="example in exampleCities"
            :key="example.city"
            class="example-card"
            @click="goCreate(example)"
          >
            <div class="example-card__img-wrap">
              <div class="example-card__placeholder" :style="{ background: example.color }">
                <v-icon size="48" color="white" style="opacity:0.4">mdi-map</v-icon>
              </div>
              <div class="example-card__overlay">
                <v-btn color="white" variant="flat" size="small" rounded="lg">
                  Try this →
                </v-btn>
              </div>
            </div>
            <div class="example-card__info">
              <span class="example-card__city">{{ example.city }}, {{ example.country }}</span>
              <v-chip size="x-small" variant="tonal" color="secondary" class="example-card__theme">
                {{ example.themeLabel }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS ─── -->
    <section class="section steps-section">
      <div class="section-inner">
        <p class="section-eyebrow">Simple process</p>
        <h2 class="section-title">How it works</h2>

        <div class="steps-grid">
          <div v-for="step in steps" :key="step.number" class="step-card">
            <div class="step-card__number">{{ step.number }}</div>
            <div class="step-card__icon">
              <v-icon size="32" color="primary">{{ step.icon }}</v-icon>
            </div>
            <h3 class="step-card__title">{{ step.title }}</h3>
            <p class="step-card__desc">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES ROW ─── -->
    <section class="section features-section">
      <div class="section-inner">
        <div class="features-grid">
          <div v-for="feat in features" :key="feat.title" class="feature-item">
            <v-icon size="28" color="primary" class="feature-item__icon">{{ feat.icon }}</v-icon>
            <div>
              <h4 class="feature-item__title">{{ feat.title }}</h4>
              <p class="feature-item__desc">{{ feat.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── BOTTOM CTA ─── -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2 class="cta-title">Ready to create yours?</h2>
        <p class="cta-subtitle">Free preview · No account required to start</p>
        <v-btn
          color="white"
          size="x-large"
          rounded="xl"
          elevation="0"
          to="/create"
          class="cta-btn"
        >
          Get started for free
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </div>
    </section>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePosterStore } from '../store/posterStore'

const router = useRouter()
const store = usePosterStore()

const exampleCities = [
  { city: 'Paris', country: 'France', theme: 'pastel_dream', themeLabel: 'Pastel Dream', color: 'linear-gradient(135deg, #f5c6d0 0%, #e8b4bc 100%)' },
  { city: 'Tokyo', country: 'Japan', theme: 'japanese_ink', themeLabel: 'Japanese Ink', color: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' },
  { city: 'New York', country: 'USA', theme: 'noir', themeLabel: 'Noir', color: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' },
  { city: 'Venice', country: 'Italy', theme: 'blueprint', themeLabel: 'Blueprint', color: 'linear-gradient(135deg, #1A3A5C 0%, #0F2840 100%)' },
  { city: 'Marrakech', country: 'Morocco', theme: 'terracotta', themeLabel: 'Terracotta', color: 'linear-gradient(135deg, #c8853a 0%, #a8621a 100%)' },
  { city: 'Amsterdam', country: 'Netherlands', theme: 'ocean', themeLabel: 'Ocean', color: 'linear-gradient(135deg, #1a6b8a 0%, #0d4a6b 100%)' },
]

const steps = [
  { number: '01', icon: 'mdi-city', title: 'Enter a city', description: 'Type any city name or paste coordinates. We support every location on Earth.' },
  { number: '02', icon: 'mdi-palette', title: 'Pick a theme', description: 'Choose from 22 professionally designed styles — from minimal noir to neon cyberpunk.' },
  { number: '03', icon: 'mdi-creation', title: 'Generate your poster', description: 'Hit generate and watch it come to life in real time. Download your high-res PNG.' },
]

const features = [
  { icon: 'mdi-palette', title: '22 themes', description: 'From Noir to Aurora, every aesthetic is covered.' },
  { icon: 'mdi-earth', title: 'Any city', description: 'Powered by OpenStreetMap. Every city, town, and village.' },
  { icon: 'mdi-printer', title: 'Print ready', description: '300 DPI output suitable for large-format printing.' },
  { icon: 'mdi-tune', title: 'Fully customisable', description: 'Radius, orientation, title position and more.' },
]

const goCreate = (example) => {
  store.formData.city = example.city
  store.formData.country = example.country
  store.formData.theme = example.theme
  store.useCoordinates = false
  router.push('/create')
}
</script>

<style scoped>
.landing {
  min-height: 100vh;
}

/* ── Hero ── */
.hero {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  padding: 80px 24px;
  background: #ffffff;
}

.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 680px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff5f6;
  border: 1px solid #ffd5da;
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 500;
  color: #FF385C;
  margin-bottom: 28px;
}

.hero-title {
  font-size: clamp(2.6rem, 6vw, 4.2rem);
  font-weight: 800;
  line-height: 1.1;
  color: #222222;
  letter-spacing: -1.5px;
  margin: 0 0 20px;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #717171;
  line-height: 1.65;
  margin: 0 0 36px;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-cta {
  font-weight: 600;
  padding: 0 32px;
}

.hero-cta-secondary {
  font-weight: 500;
  padding: 0 28px;
}

/* decorative blobs */
.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
}
.hero-blob--1 {
  width: 500px;
  height: 500px;
  background: #FF385C;
  top: -100px;
  right: -100px;
}
.hero-blob--2 {
  width: 400px;
  height: 400px;
  background: #FFB400;
  bottom: -120px;
  left: -80px;
}

/* ── Sections ── */
.section {
  padding: 80px 24px;
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.section-eyebrow {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #FF385C;
  margin: 0 0 12px;
}

.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 700;
  color: #222222;
  margin: 0 0 48px;
  letter-spacing: -0.5px;
}

/* ── Examples ── */
.examples-section {
  background: #F7F7F7;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.example-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.example-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

.example-card__img-wrap {
  position: relative;
  aspect-ratio: 3/4;
}

.example-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.example-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.example-card:hover .example-card__overlay {
  opacity: 1;
}

.example-card__info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.example-card__city {
  font-size: 0.82rem;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.example-card__theme {
  align-self: flex-start;
}

/* ── Steps ── */
.steps-section {
  background: #ffffff;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}

.step-card {
  padding: 32px 24px;
  border-radius: 20px;
  background: #F7F7F7;
  position: relative;
}

.step-card__number {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #FF385C;
  margin-bottom: 16px;
}

.step-card__icon {
  margin-bottom: 16px;
}

.step-card__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px;
}

.step-card__desc {
  font-size: 0.875rem;
  color: #717171;
  line-height: 1.6;
  margin: 0;
}

/* ── Features ── */
.features-section {
  background: #F7F7F7;
  border-top: 1px solid #EBEBEB;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}

.feature-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.feature-item__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-item__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 4px;
}

.feature-item__desc {
  font-size: 0.85rem;
  color: #717171;
  margin: 0;
  line-height: 1.5;
}

/* ── Bottom CTA ── */
.cta-section {
  background: #FF385C;
  padding: 80px 24px;
  text-align: center;
}

.cta-inner {
  max-width: 560px;
  margin: 0 auto;
}

.cta-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.cta-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0 0 32px;
}

.cta-btn {
  font-weight: 600;
  color: #FF385C !important;
  padding: 0 36px;
}
</style>
