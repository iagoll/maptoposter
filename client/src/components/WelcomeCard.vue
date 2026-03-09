<template>
  <v-card elevation="2">
    <v-card-text class="text-center pa-8">
      <v-icon size="120" color="primary" class="mb-4">mdi-map-marker-radius</v-icon>
      <h2 class="text-h4 mb-4">{{ $t('welcome.title') }}</h2>
      <p class="text-body-1 text-medium-emphasis mb-6">
        {{ $t('welcome.description') }}
      </p>
      <v-row justify="center">
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="48" color="primary">mdi-palette</v-icon>
              <h3 class="text-h6 mt-2">{{ $t('about.themes') }}</h3>
              <p class="text-caption">{{ $t('form.selectTheme') }}</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="48" color="primary">mdi-responsive</v-icon>
              <h3 class="text-h6 mt-2">{{ $t('about.customizable') }}</h3>
              <p class="text-caption">{{ $t('form.orientation') }}</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal">
            <v-card-text class="text-center">
              <v-icon size="48" color="primary">mdi-earth</v-icon>
              <h3 class="text-h6 mt-2">{{ $t('about.global') }}</h3>
              <p class="text-caption">{{ $t('about.description') }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
</script>
