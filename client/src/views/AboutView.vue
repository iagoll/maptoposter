<template>
  <div class="about-page">
    <div class="about-container">

      <!-- Header -->
      <div class="about-header">
        <p class="section-eyebrow">{{ $t('about.eyebrow') }}</p>
        <h1 class="about-title">{{ $t('about.title') }}</h1>
        <p class="about-desc">{{ $t('about.description') }}</p>
      </div>

      <!-- Feature cards -->
      <div class="feature-cards">
        <div class="feature-card">
          <v-icon size="36" color="primary" class="mb-3">mdi-palette</v-icon>
          <h3>{{ $t('about.themes') }}</h3>
          <p>{{ $t('about.themesDesc') }}</p>
        </div>
        <div class="feature-card">
          <v-icon size="36" color="primary" class="mb-3">mdi-responsive</v-icon>
          <h3>{{ $t('about.customizable') }}</h3>
          <p>{{ $t('about.customizableDesc') }}</p>
        </div>
        <div class="feature-card">
          <v-icon size="36" color="primary" class="mb-3">mdi-earth</v-icon>
          <h3>{{ $t('about.global') }}</h3>
          <p>{{ $t('about.globalDesc') }}</p>
        </div>
      </div>

      <!-- Features list -->
      <div class="content-section">
        <h2 class="content-section__title">{{ $t('about.featuresTitle') }}</h2>
        <div class="feature-list">
          <div v-for="f in featureList" :key="f" class="feature-list__item">
            <v-icon size="18" color="success">mdi-check-circle</v-icon>
            <span>{{ f }}</span>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="content-section">
        <h2 class="content-section__title">{{ $t('about.tipsTitle') }}</h2>
        <div class="tips-list">
          <div v-for="tip in tips" :key="tip.title" class="tip-card">
            <strong>{{ tip.title }}</strong>
            <p>{{ tip.body }}</p>
          </div>
        </div>
      </div>

      <!-- Tech stack -->
      <div class="content-section">
        <h2 class="content-section__title">{{ $t('about.builtWithTitle') }}</h2>
        <div class="chips">
          <v-chip
            v-for="tech in techStack"
            :key="tech.name"
            variant="tonal"
            color="secondary"
            :prepend-icon="tech.icon"
          >
            {{ tech.name }}
          </v-chip>
        </div>
      </div>

      <!-- Credits -->
      <div class="content-section">
        <h2 class="content-section__title">{{ $t('about.creditsTitle') }}</h2>
        <p class="credits-text">{{ $t('about.creditsText') }}</p>
      </div>

      <!-- CTA -->
      <div class="about-cta">
        <v-btn color="primary" size="large" rounded="xl" elevation="0" to="/create" prepend-icon="mdi-creation">
          {{ $t('home.generateButton') }}
        </v-btn>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()

// These arrays come directly from the active locale file.
// $tm() returns the raw array so we can iterate with v-for.
const featureList = computed(() => tm('about.featureList'))
const tips        = computed(() => tm('about.tips'))

// Tech-stack names are proper nouns — kept as-is across all languages.
const techStack = [
  { name: 'Vue 3',      icon: 'mdi-vuejs'           },
  { name: 'Vuetify 3',  icon: 'mdi-vuetify'         },
  { name: 'Node.js',    icon: 'mdi-nodejs'           },
  { name: 'Python',     icon: 'mdi-language-python'  },
  { name: 'PostgreSQL', icon: 'mdi-database'         },
  { name: 'OSMnx',      icon: 'mdi-map'              },
  { name: 'Matplotlib', icon: 'mdi-chart-line'       },
  { name: 'Stripe',     icon: 'mdi-credit-card'      },
]
</script>

<style scoped>
.about-page {
  background: #F7F7F7;
  min-height: 100vh;
  padding: 40px 24px 80px;
}

.about-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.about-header {
  margin-bottom: 48px;
}

.section-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #FF385C;
  margin: 0 0 4px;
}

.about-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #222;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.about-desc {
  font-size: 1rem;
  color: #717171;
  line-height: 1.7;
  margin: 0;
}

/* Feature cards */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.feature-card {
  background: #fff;
  border: 1px solid #EBEBEB;
  border-radius: 20px;
  padding: 28px 24px;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 0.85rem;
  color: #717171;
  margin: 0;
  line-height: 1.55;
}

/* Content sections */
.content-section {
  background: #fff;
  border: 1px solid #EBEBEB;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 16px;
}

.content-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 20px;
}

/* Feature list */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: #444;
}

/* Tips */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-card {
  padding: 14px 16px;
  background: #F7F7F7;
  border-radius: 12px;
}

.tip-card strong {
  font-size: 0.85rem;
  color: #222;
  display: block;
  margin-bottom: 4px;
}

.tip-card p {
  font-size: 0.82rem;
  color: #717171;
  margin: 0;
  line-height: 1.55;
}

/* Tech chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Credits */
.credits-text {
  font-size: 0.88rem;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

/* CTA */
.about-cta {
  text-align: center;
  margin-top: 48px;
}
</style>
